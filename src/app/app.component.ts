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
            // Fetch chat history and theme
            const data = await this.apiService.fetchChatHistory().toPromise();

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
                    await this.handleBackgroundChange({
                        url: data.backgroundUrl,
                        thumbnailUrl: data.thumbnailUrl
                    });
                } else {
                    // Fallback: get default background
                    try {
                        const images = await this.apiService.getBackgroundImages(
                            'abstract dark gradient',
                            'motion-backgrounds'
                        ).toPromise();
                        if (images && images.length > 0) {
                            await this.handleBackgroundChange({ url: images[0] });
                        }
                    } catch (err) {
                        console.error('Failed to load default background:', err);
                    }
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

        if (url || thumbnailUrl) {
            // Extract palette from thumbnail or main URL
            const extractUrl = thumbnailUrl || url;
            if (extractUrl) {
                const palette = await this.colorExtractor.extractPalette(extractUrl);
                if (palette) {
                    const newTheme = {
                        primaryColor: palette.primary,
                        secondaryColor: palette.secondary,
                        accentColor: palette.accent
                    };
                    this.themeService.updateTheme(newTheme);

                    // Persist theme
                    this.apiService.saveTheme(newTheme).subscribe({
                        error: (e) => console.error('Failed to persist theme:', e)
                    });
                }
            }
        }

        // Update background URL
        this.forcedBackground = url;
    }
}
