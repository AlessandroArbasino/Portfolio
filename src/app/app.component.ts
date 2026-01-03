import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './components/loading/loading.component';
import { VideoBackgroundComponent } from './components/video-background/video-background.component';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { ContactComponent } from './components/contact/contact.component';
import { AiChatButtonComponent } from './components/ai-chat-button/ai-chat-button.component';
import { MediaModalComponent } from './components/media-modal/media-modal.component';
import { ApiService } from './services/api.service';
import { ThemeService } from './services/theme.service';
import { ColorExtractorService } from './services/color-extractor.service';
import { ChatMessage } from './models/api.models';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        LoadingComponent,
        VideoBackgroundComponent,
        LanguageSelectorComponent,
        HeroComponent,
        AboutComponent,
        ProjectsComponent,
        DocumentsComponent,
        ContactComponent,
        AiChatButtonComponent,
        MediaModalComponent
    ],
    template: `
    <app-loading [isLoading]="isLoading" />

    <div class="relative min-h-screen overflow-x-hidden">
      <!-- Language Selector -->
      <app-language-selector />

      <!-- Video Background -->
      <app-video-background [forcedUrl]="forcedBackground" />

      <!-- Main Content -->
      <main class="relative z-10">
        <app-hero />
        <app-about />
        <app-projects />
        <app-documents />
        <app-contact />
      </main>

      <!-- AI Chat Button -->
      <app-ai-chat-button 
        [initialHistory]="initialChatHistory"
        (backgroundChange)="handleBackgroundChange($event)"
      />

      <!-- Media Modal -->
      <app-media-modal />
    </div>
  `
})
export class AppComponent implements OnInit {
    forcedBackground: string | null = null;
    initialChatHistory: ChatMessage[] = [];
    isLoading = true;

    constructor(
        private apiService: ApiService,
        private themeService: ThemeService,
        private colorExtractor: ColorExtractorService
    ) { }

    ngOnInit(): void {
        this.initializeApp();
    }

    private async initializeApp(): Promise<void> {
        try {
            // Fetch chat history and theme with a 7-second timeout
            const data: any = await this.apiService.fetchChatHistory()
                .pipe(
                    timeout(7000),
                    catchError(err => {
                        console.error('Chat history fetch failed or timed out:', err);
                        return of(null);
                    })
                ).toPromise();

            if (data) {
                // Restore chat messages
                if (data.messages && data.messages.length > 0) {
                    this.initialChatHistory = data.messages;
                }

                // Restore theme
                const theme: any = {};
                if (data.primaryColor) theme.primaryColor = data.primaryColor;
                if (data.secondaryColor) theme.secondaryColor = data.secondaryColor;
                if (data.accentColor) theme.accentColor = data.accentColor;
                if (data.fontFamily) theme.fontFamily = data.fontFamily;
                if (data.backgroundColor) theme.backgroundColor = data.backgroundColor;
                if (data.textColor) theme.textColor = data.textColor;
                if (data.assistantColor) theme.assistantColor = data.assistantColor;

                if (Object.keys(theme).length > 0) {
                    this.themeService.updateTheme(theme);
                }

                // Restore background
                if (data.backgroundUrl) {
                    this.handleBackgroundChange({
                        url: data.backgroundUrl,
                        thumbnailUrl: data.thumbnailUrl
                    });
                }
            }
        } catch (error) {
            console.error('Startup initialization error:', error);
        } finally {
            // Remove loading screen
            setTimeout(() => {
                this.isLoading = false;
            }, 500);
        }
    }

    async handleBackgroundChange(event: { url: string | null, thumbnailUrl?: string | null }): Promise<void> {
        const { url, thumbnailUrl } = event;

        // Update background URL immediately
        this.forcedBackground = url;

        if (url || thumbnailUrl) {
            // Extract palette asynchronously from thumbnail or main URL
            const extractUrl = thumbnailUrl || url;
            if (extractUrl) {
                try {
                    const palette = await this.colorExtractor.extractPalette(extractUrl);
                    if (palette) {
                        const newTheme = {
                            primaryColor: palette.primary,
                            secondaryColor: palette.secondary,
                            accentColor: palette.accent,
                            assistantColor: palette.primary // AI chat color matches the video
                        };
                        this.themeService.updateTheme(newTheme);

                        // Persist theme
                        this.apiService.saveTheme(newTheme).subscribe({
                            error: (e) => console.error('Failed to persist theme:', e)
                        });
                    }
                } catch (error) {
                    console.error('Color extraction error:', error);
                }
            }
        }
    }
}
