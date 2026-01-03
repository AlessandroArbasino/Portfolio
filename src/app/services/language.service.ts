import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FixedTexts } from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private currentLanguageSubject = new BehaviorSubject<string>('');
    private fixedTextsSubject = new BehaviorSubject<FixedTexts | null>(null);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    public currentLanguage$ = this.currentLanguageSubject.asObservable();
    public fixedTexts$ = this.fixedTextsSubject.asObservable();
    public loading$ = this.loadingSubject.asObservable();

    constructor(private apiService: ApiService) {
        this.initLanguage();
    }

    /**
     * Initialize language by fetching available languages from DB
     */
    private initLanguage(): void {
        this.apiService.getLanguages().subscribe({
            next: (langs) => {
                const defaultLang = langs && langs.length > 0 ? langs[0].id : 'en';
                this.setLanguage(defaultLang);
            },
            error: (err) => {
                console.error('Failed to fetch initial languages:', err);
                this.setLanguage('en'); // Final fallback
            }
        });
    }

    /**
     * Get current language code
     */
    get currentLanguage(): string {
        return this.currentLanguageSubject.value;
    }

    /**
     * Get current fixed texts
     */
    get fixedTexts(): FixedTexts | null {
        return this.fixedTextsSubject.value;
    }

    /**
     * Set language and reload texts
     */
    setLanguage(lang: string): void {
        this.currentLanguageSubject.next(lang);
        this.loadTexts(lang);
    }

    /**
     * Load fixed texts for given language
     */
    private loadTexts(lang: string): void {
        if (!lang) return;
        this.loadingSubject.next(true);
        this.apiService.getFixedTexts(lang).subscribe({
            next: (texts) => {
                this.fixedTextsSubject.next(texts);
                this.loadingSubject.next(false);
            },
            error: (error) => {
                console.error('Failed to fetch fixed texts:', error);
                this.loadingSubject.next(false);
            }
        });
    }
}
