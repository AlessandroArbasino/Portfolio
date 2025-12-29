import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { LanguageDto } from '../../models/api.models';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-40">
      <div class="relative">
        <button
          (click)="toggleDropdown()"
          class="px-4 py-2 rounded-lg glass-dark text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
        >
          {{ currentLanguage?.text || 'Language' }}
          <svg 
            class="w-4 h-4 transition-transform"
            [class.rotate-180]="isOpen"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        @if (isOpen) {
          <div class="absolute right-0 mt-2 w-32 rounded-lg glass-dark shadow-xl overflow-hidden">
            @for (lang of languages; track lang.id) {
              <button
                (click)="selectLanguage(lang.id)"
                class="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                [ngClass]="{'bg-white/20': lang.id === currentLanguage?.id}"
              >
                {{ lang.text }}
              </button>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  languages: LanguageDto[] = [];
  currentLanguage: LanguageDto | null = null;
  isOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    // Load available languages
    this.apiService.getLanguages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(langs => {
        this.languages = langs;
        this.updateCurrentLanguage();
      });

    // Track current language
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateCurrentLanguage());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectLanguage(langId: string): void {
    this.languageService.setLanguage(langId);
    this.isOpen = false;
  }

  private updateCurrentLanguage(): void {
    const currentLang = this.languageService.currentLanguage;
    this.currentLanguage = this.languages.find(l => l.id === currentLang) || null;
  }
}
