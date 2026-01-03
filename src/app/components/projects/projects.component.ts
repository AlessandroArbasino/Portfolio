import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest, takeUntil, forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { MediaService } from '../../services/media.service';
import { Project, FixedTexts } from '../../models/api.models';
import { ProjectItemComponent } from './project-item/project-item.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ProjectItemComponent],
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
                <app-project-item 
                  #projectElement
                  [project]="project"
                  [isExpanded]="expandedProject === project.id"
                  (toggle)="toggleProject(project.id)"
                  (mediaClick)="openMedia($event)"
                />
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
                  <app-project-item 
                    #projectElement
                    [project]="project"
                    [isExpanded]="expandedProject === project.id"
                    (toggle)="toggleProject(project.id)"
                    (mediaClick)="openMedia($event)"
                  />
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class ProjectsComponent implements OnInit, OnDestroy {
  fixedTexts: FixedTexts | null = null;
  projects: Project[] = [];
  expandedProject: string | null = null;
  private destroy$ = new Subject<void>();

  get webProjects(): Project[] {
    return this.projects.filter(p => !p.type || p.type === 'web');
  }

  get videogameProjects(): Project[] {
    return this.projects.filter(p => p.type === 'videogame');
  }

  @ViewChildren('projectElement', { read: ElementRef }) projectElements!: QueryList<ElementRef>;

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



  openMedia(event: { url: string, type: 'image' | 'video', startTime?: number }): void {
    this.mediaService.openMedia(event.url, event.type, event.startTime);
  }
}

