import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { PersonalProfile, FixedTexts } from '../../models/api.models';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="about"  class="flex flex-col justify-center px-4 py-8">
      <div class="max-w-6xl mx-auto w-full">
        @if (fixedTexts) {
          <!-- Title with fade-in animation equivalent -->
          <div class="mb-12 text-center opacity-0 animate-fade-in-up" style="animation-fill-mode: forwards;">
            <h2 class="text-white mb-12 text-center text-4xl font-bold">
              {{ fixedTexts.about.title || 'About Me' }}
            </h2>
          </div>
        }

        <!-- Profile Section with Image -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          
          <!-- Image Column (Left) -->
          @if (profile && profile.imageUrl) {
            <div class="flex justify-center lg:justify-end opacity-0 animate-fade-in-left" style="animation-fill-mode: forwards; animation-delay: 0.2s;">
              <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl blur-2xl"></div>
                <div class="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border-2 border-white/10">
                  <img 
                    [src]="profile.imageUrl" 
                    [alt]="profile.name || 'Profile'"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          }

          <!-- Text Column (Right) -->
          @if (fixedTexts && profile) {
            <div class="flex flex-col justify-center opacity-0 animate-fade-in-right" style="animation-fill-mode: forwards; animation-delay: 0.2s;">
              <h3 class="text-white mb-4 text-2xl font-semibold">
                {{ profile.greeting || fixedTexts.about.greeting || 'Hello there!' }}
              </h3>
              <p class="text-white/70 mb-6 leading-relaxed whitespace-pre-line text-lg">
                {{ profile.description || fixedTexts.about.description1 }}
              </p>

              <!-- Highlights -->
              <div class="grid grid-cols-3 gap-4">
                <!-- Experience -->
                <div class="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 text-center">
                  <div class="text-white/80 mb-2 flex justify-center">
                    <!-- Briefcase Icon -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </div>
                  <div class="text-white text-sm mb-1 font-semibold">
                    {{ profile.experienceYears ? profile.experienceYears : (fixedTexts.about.years || 'Years') }}
                  </div>
                  <div class="text-white/60 text-xs">
                    {{ fixedTexts.about.experience || 'Experience' }}
                  </div>
                </div>

                <!-- Projects -->
                <div class="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 text-center">
                  <div class="text-white/80 mb-2 flex justify-center">
                    <!-- Award Icon -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="8" r="7"></circle>
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                    </svg>
                  </div>
                  <div class="text-white text-sm mb-1 font-semibold">
                    {{ profile.completedProjects ? profile.completedProjects : (fixedTexts.about.projects || 'Projects') }}
                  </div>
                  <div class="text-white/60 text-xs">
                    {{ fixedTexts.about.completed || 'Completed' }}
                  </div>
                </div>

                <!-- Training -->
                <div class="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 text-center">
                  <div class="text-white/80 mb-2 flex justify-center">
                    <!-- GraduationCap Icon -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                  </div>
                  <div class="text-white text-sm mb-1 font-semibold">
                    {{ fixedTexts.about.training || 'Training' }}
                  </div>
                  <div class="text-white/60 text-xs">
                    {{ fixedTexts.about.continuous || 'Continuous' }}
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Skills Section -->
        @if (competences.length > 0) {
          <div class="mb-8 text-center opacity-0 animate-fade-in-up" style="animation-fill-mode: forwards; animation-delay: 0.4s;">
            <h2 class="text-white text-center mb-12 text-3xl font-bold">
              {{ fixedTexts?.about?.skills || 'My Skills' }}
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (skill of competences; track skill.title; let i = $index) {
              <div 
                class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors opacity-0 animate-fade-in-up"
                [style.animation-delay]="(0.5 + i * 0.1) + 's'"
                style="animation-fill-mode: forwards;"
              >
                <div class="text-white/80 mb-4">
                  <!-- Dynamic Icon Logic -->
                   @switch (skill.icon) {
                     @case ('layout') {
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                     }
                     @case ('database') {
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                     }
                     @case ('code') {
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                     }
                     @default {
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                     }
                   }
                </div>
                <h3 class="text-white mb-2 font-semibold">{{ skill.title }}</h3>
                <p class="text-white/60 text-sm">{{ skill.description }}</p>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
    .animate-fade-in-left { animation: fadeInLeft 0.6s ease-out forwards; }
    .animate-fade-in-right { animation: fadeInRight 0.6s ease-out forwards; }
  `]
})
export class AboutComponent implements OnInit, OnDestroy {
  fixedTexts: FixedTexts | null = null;
  profile: PersonalProfile | null = null;
  competences: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.languageService.currentLanguage$,
      this.languageService.fixedTexts$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([lang, texts]) => {
        this.fixedTexts = texts;
        if (lang) {
          this.loadProfile(lang);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfile(lang: string): void {
    this.apiService.fetchProfile(lang)
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.profile = profile;
        this.updateCompetences();
      });
  }

  private updateCompetences(): void {
    if (this.profile && this.profile.competences && this.profile.competences.length > 0) {
      this.competences = this.profile.competences;
    } else {
      // Fallback skills matching React implementation
      this.competences = [
        {
          title: 'Frontend',
          description: 'React, TypeScript, Tailwind CSS',
          icon: 'layout'
        },
        {
          title: 'Backend',
          description: 'Node.js, Express, PostgreSQL',
          icon: 'database'
        },
        {
          title: 'Tools',
          description: 'Git, Docker, REST API',
          icon: 'code'
        }
      ];
    }
  }
}
