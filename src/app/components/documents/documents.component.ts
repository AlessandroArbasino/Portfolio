import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { Document as PortfolioDocument, FixedTexts } from '../../models/api.models';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="documents" class="flex flex-col justify-center px-4 py-8">
      <div class="max-w-4xl mx-auto w-full">
        @if (fixedTexts) {
          <div class="mb-12 text-center opacity-0 animate-fade-in-up" style="animation-fill-mode: forwards;">
            <h2 class="text-white mb-4 text-center text-3xl font-bold">
              {{ fixedTexts.documents.title || 'Documenti' }}
            </h2>
            <p class="text-white/70 text-center mb-12">
              {{ fixedTexts.documents.subtitle || 'Scarica o visualizza i miei documenti' }}
            </p>
          </div>
        }

        @if (documents && documents.length > 0) {
          <div 
            class="grid gap-6"
            [ngClass]="{
              'md:grid-cols-2': documents.length > 1,
              'grid-cols-1': true,
              'max-w-md mx-auto': documents.length === 1
            }"
          >
            @for (doc of documents; track doc._id; let i = $index) {
              <div 
                class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group flex flex-col opacity-0 animate-fade-in-up"
                [style.animation-delay]="(i * 0.1) + 's'"
                style="animation-fill-mode: forwards;"
              >
                <!-- Header: Icon and Actions -->
                <div class="flex items-start justify-between mb-4">
                  <div class="p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                    <!-- FileText Icon -->
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <line x1="10" y1="9" x2="8" y2="9"></line>
                    </svg>
                  </div>
                  <div class="flex gap-2">
                    <a
                      [href]="doc.fileUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="p-2 text-white/60 hover:text-white transition-colors"
                      title="Visualizza"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </a>
                    <button
                      (click)="downloadDocument(doc._id)"
                      class="p-2 text-white/60 hover:text-white transition-colors"
                      title="Scarica"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                  </div>
                </div>

                <!-- Title and Description -->
                <h3 class="text-white mb-2 font-semibold">{{ doc.title }}</h3>
                <p class="text-white/60 text-sm flex-grow mb-4">
                  {{ doc.description }}
                </p>

                <!-- Footer: Type -->
                <div class="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span class="text-xs text-white/40 uppercase tracking-wider">
                    {{ doc.type }}
                  </span>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center text-gray-500">
            No documents available
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
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
  `]
})
export class DocumentsComponent implements OnInit, OnDestroy {
  fixedTexts: FixedTexts | null = null;
  documents: PortfolioDocument[] = [];
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
          this.loadDocuments(lang);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDocuments(lang: string): void {
    this.apiService.getDocuments(lang)
      .pipe(takeUntil(this.destroy$))
      .subscribe(docs => this.documents = docs);
  }

  downloadDocument(docId: string): void {
    window.location.href = `/api/documents/download/${docId}`;
  }
}
