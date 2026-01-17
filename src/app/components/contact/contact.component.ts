import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { ContactItem, FixedTexts } from '../../models/api.models';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer id="contact" class="flex flex-col justify-center px-4 py-8">
      <div class="max-w-4xl mx-auto w-full">
        @if (fixedTexts) {
          <div class="mb-12 text-center opacity-0 animate-fade-in-up" style="animation-fill-mode: forwards;">
            <h2 class="text-white mb-4 text-center text-3xl font-bold">
              {{ fixedTexts.contact.title || 'Contatti' }}
            </h2>
            <p class="text-white/70 text-center mb-12">
              {{ fixedTexts.contact.subtitle || 'Interessato a collaborare? Contattiamoci!' }}
            </p>
          </div>
        }

        @if (contactItems.length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (item of contactItems; track item.id; let i = $index) {
              <a
                [href]="item.href"
                target="_blank"
                rel="noopener noreferrer"
                class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group opacity-0 animate-fade-in-up"
                [style.animation-delay]="(i * 0.1) + 's'"
                style="animation-fill-mode: forwards;"
              >
                <div class="text-white/80 group-hover:text-white transition-colors mb-4">
                  @switch (item.id) {
                    @case ('email') {
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                    }
                    @case ('linkedin') {
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    }
                    @case ('github') {
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    }
                    @default {
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                    }
                  }
                </div>
                <h3 class="text-white mb-2">{{ item.label }}</h3>
                <p class="text-white/60 text-sm break-all">{{ item.value }}</p>
              </a>
            }
          </div>
        }

        @if (fixedTexts) {
          <div 
            class="text-center mt-12 opacity-0 animate-fade-in" 
            style="animation-fill-mode: forwards; animation-delay: 0.4s;"
          >
            <p class="text-white/40 text-sm">
              {{ fixedTexts.contact.copyright || '© 2024 Alessandro Arbasino. Tutti i diritti riservati.' }}
            </p>
          </div>
        }
      </div>
    </footer>
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
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
    .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
  `]
})
export class ContactComponent implements OnInit, OnDestroy {
  fixedTexts: FixedTexts | null = null;
  contactItems: ContactItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.languageService.fixedTexts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(texts => {
        this.fixedTexts = texts;
      });

    this.apiService.getContact()
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.contactItems = items;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
