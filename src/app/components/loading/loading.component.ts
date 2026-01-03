import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition, keyframes } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading) {
      <div 
        [@fadeAnimation] 
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950"
      >
        <!-- Animated background gradient -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob"></div>
          <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob animation-delay-500"></div>
        </div>

        <!-- Loading content -->
        <div class="relative z-10 flex flex-col items-center gap-8">
          
          <!-- Animated logo/icon -->
          <div class="relative animate-spin-slow">
            <div class="w-20 h-20 rounded-full border-4 border-white/10 border-t-white/80 border-r-white/60"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                class="text-white"
                style="animation: counter-spin 2s linear infinite;"
              >
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
          </div>

          <!-- Loading text -->
          <div class="flex flex-col items-center gap-4">
            <h2 class="text-white text-xl animate-fade-in-up">
              {{ currentLang === 'it' ? 'Caricamento...' : 'Loading...' }}
            </h2>

            <!-- Animated dots -->
            <div class="flex gap-2">
              <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse-fast" style="animation-delay: 0s;"></div>
              <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse-fast" style="animation-delay: 0.2s;"></div>
              <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse-fast" style="animation-delay: 0.4s;"></div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-progress"></div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes blob {
      0% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.2); opacity: 0.5; }
      100% { transform: scale(1); opacity: 0.3; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes counterSpin {
      to { transform: rotate(-360deg); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulseFast {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.5); opacity: 1; }
    }
    @keyframes progress {
      from { width: 0%; }
      to { width: 100%; }
    }

    .animate-blob { animation: blob 4s ease-in-out infinite; }
    .animation-delay-500 { animation-delay: 0.5s; }
    .animate-spin-slow { animation: spin 2s linear infinite; }
    .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; animation-delay: 0.2s; opacity: 0; }
    .animate-pulse-fast { animation: pulseFast 1.5s infinite; }
    .animate-progress { animation: progress 2s ease-in-out forwards; }
  `],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class LoadingComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean = true;
  currentLang: string = 'en';
  private destroy$ = new Subject<void>();

  constructor(private languageService: LanguageService) { }

  ngOnInit(): void {
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => this.currentLang = lang);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
