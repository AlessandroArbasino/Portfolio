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
import { timeout, catchError, filter, take } from 'rxjs/operators';
import { of, firstValueFrom } from 'rxjs';
import { LanguageService } from './services/language.service';

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
        private colorExtractor: ColorExtractorService,
        private languageService: LanguageService
    ) { }

    ngOnInit(): void {
        this.initializeApp();
    }

    private async initializeApp(): Promise<void> {
        try {
            // Wait for language to be initialized
            const lang = await firstValueFrom(
                this.languageService.currentLanguage$.pipe(
                    filter((l: string) => !!l),
                    take(1)
                )
            );

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
