import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { FixedTexts } from '../../models/api.models';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="min-h-screen flex flex-col items-center justify-center px-4 relative">
      @if (fixedTexts && fixedTexts.hero) {
        <div class="text-center z-10 opacity-0 animate-fade-in-up" style="animation-fill-mode: forwards;">
          <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 opacity-0 animate-fade-in-up" style="animation-fill-mode: forwards; animation-delay: 0.2s;">
            {{ fixedTexts.hero.title }}
          </h1>
          <p class="text-white/80 text-2xl md:text-3xl mb-8 opacity-0 animate-fade-in-up" style="animation-fill-mode: forwards; animation-delay: 0.4s;">
            {{ fixedTexts.hero.subtitle }}
          </p>
          <p class="text-white/70 max-w-md mx-auto mb-8 opacity-0 animate-fade-in-up" style="animation-fill-mode: forwards; animation-delay: 0.6s;">
            {{ fixedTexts.hero.description }}
          </p>
        </div>

        <button
          (click)="scrollToProjects()"
          class="absolute bottom-8 text-white/60 hover:text-white transition-colors cursor-pointer opacity-0 animate-fade-in"
          style="animation-fill-mode: forwards; animation-delay: 1s;"
          aria-label="Scroll to projects"
        >
          <div class="animate-bounce-slow">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </button>
      }
    </section>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes bounceSlow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(10px); }
    }
    .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
    .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
    .animate-bounce-slow { animation: bounceSlow 1.5s infinite; }
  `]
})
export class HeroComponent implements OnInit, OnDestroy {
  fixedTexts: FixedTexts | null = null;
  private destroy$ = new Subject<void>();

  constructor(private languageService: LanguageService) { }

  ngOnInit(): void {
    this.languageService.fixedTexts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(texts => {
        this.fixedTexts = texts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scrollToProjects(): void {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
