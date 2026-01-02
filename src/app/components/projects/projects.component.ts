import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest, takeUntil, forkJoin } from 'rxjs';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { MediaService } from '../../services/media.service';
import { MediaRendererComponent } from '../media-renderer/media-renderer.component';
import { Project, FixedTexts } from '../../models/api.models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, MediaRendererComponent, SlickCarouselModule],
  template: `
    <section id="projects" class="flex flex-col justify-center px-4 py-8">
      <div class="max-w-4xl mx-auto w-full">
        @if (fixedTexts) {
          <div class="mb-12 text-center">
            <h2 class="text-white mb-4 text-4xl font-bold">{{ fixedTexts.projects.title }}</h2>
            <p class="text-white/70">
              {{ fixedTexts.projects.subtitle }}
            </p>
          </div>
        }
        <div class="space-y-12">
          <!-- Web Projects Section -->
          @if (webProjects.length > 0 && fixedTexts) {
            <div>
              <h3 class="text-white text-2xl font-bold mb-6 border-b border-white/10 pb-2 text-center">{{ fixedTexts.projects.webTitle }}</h3>
              <div class="space-y-4">
              @for (project of webProjects; track project.id) {
                <div 
                  class="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden"
                  #projectElement
                >
                  <button
                    (click)="toggleProject(project.id)"
                    class="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                  >
                    <div class="flex-1">
                      <h3 class="text-white mb-1 text-xl font-medium">{{ project.name }}</h3>
                      <p class="text-white/60 text-sm">{{ project.description }}</p>
                    </div>
                    <div 
                      class="text-white/60 ml-4 transition-transform duration-300"
                      [class.rotate-180]="expandedProject === project.id"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>
                  </button>

                  @if (expandedProject === project.id) {
                    <div 
                      [@expandCollapse]
                      class="overflow-hidden"
                    >
                      <div class="px-6 pb-4 border-t border-white/10">
                        <div class="pt-4">
                          <!-- Image Carousel -->
                          @if (project.images && project.images.length > 0) {
                            <div class="mb-4 project-slider md:px-10 px-2">
                              <ngx-slick-carousel 
                                [config]="slideConfig" 
                                class="carousel"
                              >
                                @for (image of project.images; track $index) {
                                  <div ngxSlickItem class="px-1">
                                    <div class="relative aspect-video rounded-lg overflow-hidden">
                                      <app-media-renderer
                                        [url]="image"
                                        [type]="'image'"
                                        (mediaClick)="openMedia($event)"
                                      />
                                    </div>
                                  </div>
                                }
                              </ngx-slick-carousel>
                            </div>
                          }

                          <!-- Tech Stack -->
                          <div class="flex flex-wrap gap-2 mb-4">
                            @for (tech of project.tech; track tech) {
                              <span class="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
                                {{ tech }}
                              </span>
                            }
                          </div>

                          <!-- Challenges -->
                          @if (project.challenges && project.challenges.length > 0) {
                            <div class="mb-6 space-y-2">
                              <h4 class="text-white/80 font-medium mb-3">Sfide e Soluzioni</h4>
                              @for (challenge of project.challenges; track $index) {
                                <div class="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                  <details class="group">
                                    <summary class="px-4 py-3 flex items-center justify-between cursor-pointer list-none hover:bg-white/5 transition-colors">
                                      <span class="text-white/90 text-sm font-medium">{{ challenge.problem }}</span>
                                      <span class="text-white/60 group-open:rotate-180 transition-transform">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                          <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                      </span>
                                    </summary>
                                    <div class="px-4 py-3 border-t border-white/10 bg-white/5 text-white/70 text-sm">
                                      <p><span class="text-green-400 font-medium">Soluzione:</span> {{ challenge.solution }}</p>
                                    </div>
                                  </details>
                                </div>
                              }
                            </div>
                          }

                          <!-- Links -->
                          <div class="flex gap-3 mb-4">
                            @if (project.github) {
                              <a
                                [href]="project.github"
                                class="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                </svg>
                                <span>GitHub</span>
                              </a>
                            }
                            @if (project.demo) {
                              <a
                                [href]="project.demo"
                                class="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                  <polyline points="15 3 21 3 21 9"/>
                                  <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                                <span>Demo</span>
                              </a>
                            }
                          </div>

                          <!-- SubProjects -->
                          @if (project.subProjects && project.subProjects.length > 0) {
                            <div class="mt-4 space-y-2">
                              <p class="text-white/60 text-sm mb-2">Sotto-progetti:</p>
                              @for (subProject of project.subProjects; track subProject.id) {
                                <div 
                                  class="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                                  #subProjectElement
                                >
                                  <button
                                    (click)="toggleSubProject(subProject.id)"
                                    class="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                                  >
                                    <span class="text-white/80 text-sm">{{ subProject.name }}</span>
                                    <div 
                                      class="text-white/60 transition-transform duration-300"
                                      [class.rotate-180]="expandedSubProject === subProject.id"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M6 9l6 6 6-6"/>
                                      </svg>
                                    </div>
                                  </button>

                                  @if (expandedSubProject === subProject.id) {
                                    <div 
                                      [@expandCollapse]
                                      class="overflow-hidden"
                                    >
                                      <div class="px-4 pb-3 border-t border-white/10">
                                        <!-- SubProject Images -->
                                        @if (subProject.images && subProject.images.length > 0) {
                                          <div class="mt-3 mb-3 subproject-slider md:px-10 px-2">
                                            <ngx-slick-carousel 
                                              [config]="slideConfig" 
                                              class="carousel"
                                            >
                                              @for (image of subProject.images; track $index) {
                                                <div ngxSlickItem class="px-1">
                                                  <div class="relative aspect-video rounded-lg overflow-hidden">
                                                    <app-media-renderer
                                                      [url]="image"
                                                      [type]="'image'"
                                                      (mediaClick)="openMedia($event)"
                                                    />
                                                  </div>
                                                </div>
                                              }
                                            </ngx-slick-carousel>
                                          </div>
                                        }

                                        <!-- SubProject Details -->
                                        <p class="text-white/60 text-sm mb-3">
                                          {{ subProject.description }}
                                        </p>
                                        
                                        @if (subProject.challenges && subProject.challenges.length > 0) {
                                              <div class="mb-4 space-y-2">
                                                <p class="text-white/60 text-xs font-medium">Sfide:</p>
                                                @for (challenge of subProject.challenges; track $index) {
                                                  <div class="bg-white/5 rounded border border-white/5 overflow-hidden">
                                                    <details class="group">
                                                      <summary class="px-3 py-2 flex items-center justify-between cursor-pointer list-none hover:bg-white/5">
                                                        <span class="text-white/80 text-xs">{{ challenge.problem }}</span>
                                                          <span class="text-white/40 group-open:rotate-180 transition-transform">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                              <path d="M6 9l6 6 6-6"/>
                                                            </svg>
                                                          </span>
                                                      </summary>
                                                      <div class="px-3 py-2 border-t border-white/5 bg-black/20 text-white/60 text-xs">
                                                        <span class="text-green-400/80">Soluzione: </span> {{ challenge.solution }}
                                                      </div>
                                                    </details>
                                                  </div>
                                                }
                                              </div>
                                            }

                                        @if (subProject.tech && subProject.tech.length > 0) {
                                          <div class="flex flex-wrap gap-2 mb-2">
                                            @for (tech of subProject.tech; track tech) {
                                              <span class="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs">
                                                {{ tech }}
                                              </span>
                                            }
                                          </div>
                                        }
                                      </div>
                                    </div>
                                  }
                                </div>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
          }

          <!-- Videogame Projects Section -->
          @if (videogameProjects.length > 0 && fixedTexts) {
            <div>
              <h3 class="text-white text-2xl font-bold mb-6 border-b border-white/10 pb-2 text-center">{{ fixedTexts.projects.videogameTitle }}</h3>
              <div class="space-y-4">
                @for (project of videogameProjects; track project.id) {
                  <div 
                    class="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden"
                    #projectElement
                  >
                    <button
                      (click)="toggleProject(project.id)"
                      class="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                    >
                      <div class="flex-1">
                        <h3 class="text-white mb-1 text-xl font-medium">{{ project.name }}</h3>
                        <p class="text-white/60 text-sm">{{ project.description }}</p>
                      </div>
                      <div 
                        class="text-white/60 ml-4 transition-transform duration-300"
                        [class.rotate-180]="expandedProject === project.id"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </div>
                    </button>

                    @if (expandedProject === project.id) {
                      <div 
                        [@expandCollapse]
                        class="overflow-hidden"
                      >
                        <div class="px-6 pb-4 border-t border-white/10">
                          <div class="pt-4">
                            <!-- Image Carousel -->
                            @if (project.images && project.images.length > 0) {
                              <div class="mb-4 project-slider md:px-10 px-2">
                                <ngx-slick-carousel 
                                  [config]="slideConfig" 
                                  class="carousel"
                                >
                                  @for (image of project.images; track $index) {
                                    <div ngxSlickItem class="px-1">
                                      <div class="relative aspect-video rounded-lg overflow-hidden">
                                        <app-media-renderer
                                          [url]="image"
                                          [type]="'image'"
                                          (mediaClick)="openMedia($event)"
                                        />
                                      </div>
                                    </div>
                                  }
                                </ngx-slick-carousel>
                              </div>
                            }

                            <!-- Tech Stack -->
                            <div class="flex flex-wrap gap-2 mb-4">
                              @for (tech of project.tech; track tech) {
                                <span class="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
                                  {{ tech }}
                                </span>
                              }
                            </div>

                            <!-- Challenges -->
                            @if (project.challenges && project.challenges.length > 0) {
                              <div class="mb-6 space-y-2">
                                <h4 class="text-white/80 font-medium mb-3">Sfide e Soluzioni</h4>
                                @for (challenge of project.challenges; track $index) {
                                  <div class="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                    <details class="group">
                                      <summary class="px-4 py-3 flex items-center justify-between cursor-pointer list-none hover:bg-white/5 transition-colors">
                                        <span class="text-white/90 text-sm font-medium">{{ challenge.problem }}</span>
                                        <span class="text-white/60 group-open:rotate-180 transition-transform">
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M6 9l6 6 6-6"/>
                                          </svg>
                                        </span>
                                      </summary>
                                      <div class="px-4 py-3 border-t border-white/10 bg-white/5 text-white/70 text-sm">
                                        <p><span class="text-green-400 font-medium">Soluzione:</span> {{ challenge.solution }}</p>
                                      </div>
                                    </details>
                                  </div>
                                }
                              </div>
                            }

                            <!-- Links -->
                            <div class="flex gap-3 mb-4">
                              @if (project.github) {
                                <a
                                  [href]="project.github"
                                  class="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                  </svg>
                                  <span>GitHub</span>
                                </a>
                              }
                              @if (project.demo) {
                                <a
                                  [href]="project.demo"
                                  class="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                  </svg>
                                  <span>Demo</span>
                                </a>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: '0', opacity: 0 }))
      ])
    ])
  ]
})
export class ProjectsComponent implements OnInit, OnDestroy {
  fixedTexts: FixedTexts | null = null;
  projects: Project[] = [];
  expandedProject: string | null = null;
  expandedSubProject: string | null = null;
  private destroy$ = new Subject<void>();

  get webProjects(): Project[] {
    return this.projects.filter(p => !p.type || p.type === 'web');
  }

  get videogameProjects(): Project[] {
    return this.projects.filter(p => p.type === 'videogame');
  }

  @ViewChildren('projectElement') projectElements!: QueryList<ElementRef>;
  @ViewChildren('subProjectElement') subProjectElements!: QueryList<ElementRef>;

  slideConfig = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true
  };

  constructor(
    private apiService: ApiService,
    private languageService: LanguageService,
    private mediaService: MediaService
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
          this.loadProjects(lang);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private loadProjects(lang: string): void {
    forkJoin({
      web: this.apiService.getProjects(lang, 'web'),
      videogame: this.apiService.getProjects(lang, 'videogame')
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ web, videogame }) => {
          this.projects = [...web, ...videogame];
        },
        error: (err) => {
          console.error('Error loading projects:', err);
        }
      });
  }

  toggleProject(id: string): void {
    const wasExpanded = this.expandedProject === id;
    this.expandedProject = wasExpanded ? null : id;
    this.expandedSubProject = null;

    // Scroll logic (simple timeout for DOM update)
    if (this.expandedProject) {
      setTimeout(() => {
        // Find in webProjects first, then videogameProjects
        const allFiltered = [...this.webProjects, ...this.videogameProjects];
        const index = allFiltered.findIndex(p => p.id === id);
        if (index !== -1) {
          const element = this.projectElements.toArray()[index];
          element?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }

  toggleSubProject(id: string): void {
    this.expandedSubProject = this.expandedSubProject === id ? null : id;
  }

  openMedia(event: { url: string, type: 'image' | 'video' }): void {
    this.mediaService.openMedia(event.url, event.type);
  }
}

