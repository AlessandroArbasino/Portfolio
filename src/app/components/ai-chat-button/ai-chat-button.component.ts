import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { trigger, style, animate, transition } from '@angular/animations';
import { ApiService } from '../../services/api.service';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ChatMessage, FixedTexts } from '../../models/api.models';

@Component({
  selector: 'app-ai-chat-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Tooltip -->
    @if (showTooltip && !isOpen) {
      <div 
        [@fadeSlide]
        class="fixed bottom-24 right-6 z-40 max-w-xs"
        [ngStyle]="fontStyle"
      >
        <div 
          class="rounded-2xl p-4 shadow-2xl relative"
          [ngStyle]="gradientStyle"
        >
          <div class="flex items-start gap-3">
            <div class="bg-white/20 rounded-full p-2">
              <svg class="w-5 h-5" [style.color]="tooltipTextColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div class="flex-1">
              <h4 [style.color]="tooltipTextColor" class="mb-1 text-sm font-semibold">
                {{ translations.tooltipTitle }}
              </h4>
              <p [style.color]="tooltipTextColor" [style.opacity]="0.9" class="text-xs">
                {{ translations.tooltipDesc }}
              </p>
            </div>
            <button
              (click)="showTooltip = false"
              [style.color]="tooltipTextColor"
              [style.opacity]="0.6"
              class="hover:opacity-100 transition-opacity"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="absolute -bottom-2 right-8 w-4 h-4 transform rotate-45" [ngStyle]="gradientStyle"></div>
        </div>
      </div>
    }

    <!-- Chat Button -->
    <div [@scaleIn] class="fixed bottom-6 right-6 z-40">
      <!-- Pulse rings -->
      @if (showBadge && !isOpen) {
        <div [@fadeAnimation] class="absolute inset-0 pointer-events-none">
          <div class="absolute inset-0 rounded-full animate-ping" [ngStyle]="gradientStyle" style="opacity: 0.3;"></div>
        </div>
      }

      <!-- Badge -->
      @if (showBadge && !isOpen) {
        <div [@scaleAnimation] class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-950 flex items-center justify-center z-10" [ngStyle]="badgeStyle">
          <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      }

      <button
        (click)="toggleChat()"
        class="relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        [ngStyle]="buttonStyle"
        aria-label="Open AI chat"
      >
        @if (!isOpen) {
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
        @if (isOpen) {
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        }
      </button>
    </div>

    <!-- Chat Window -->
    @if (isOpen) {
      <div 
        [@slideIn]
        class="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] max-w-md"
        [ngStyle]="fontStyle"
      >
        <div 
          class="backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden"
          style="background-color: rgba(0, 0, 0, 0.15);"
          [style.border-color]="primaryColor + '33'"
        >
          <!-- Header -->
          <div class="px-6 py-4" [ngStyle]="headerStyle">
            <div class="flex items-center gap-2 mb-1">
              <svg class="w-5 h-5" [style.color]="headerTextColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h3 [style.color]="headerTextColor" class="font-semibold">{{ translations.chatTitle }}</h3>
            </div>
            <p [style.color]="headerTextColor" [style.opacity]="0.8" class="text-sm">{{ translations.subtitle }}</p>
          </div>

          <!-- Messages -->
          <div class="p-6 h-64 overflow-y-auto flex flex-col gap-4">
            @for (msg of chatHistory; track $index) {
              <div 
                [@fadeSlide]
                class="max-w-[85%] p-3.5 rounded-2xl shadow-md"
                [class.ml-auto]="msg.role === 'user'"
                [ngStyle]="{
                  backgroundColor: msg.role === 'user' ? primaryColor : assistantColor + '1F',
                  color: msg.role === 'user' ? buttonTextColor : textColor,
                  border: msg.role === 'user' ? 'none' : '1px solid ' + assistantColor + '33'
                }"
              >
                <p class="whitespace-pre-wrap text-sm">{{ msg.content }}</p>
              </div>
            }
            @if (isLoading) {
              <div class="text-xs italic opacity-60 text-white">
                {{ translations.typing }}
              </div>
            }
          </div>

          <!-- Input -->
          <form (submit)="handleSubmit($event)" class="p-4 border-t border-white/10">
            <div class="flex gap-2">
              <input
                type="text"
                [(ngModel)]="message"
                name="message"
                [placeholder]="translations.placeholder"
                class="flex-1 rounded-lg px-4 py-2 focus:outline-none transition-colors border-none shadow-inner"
                [ngStyle]="inputStyle"
                [style.--placeholder-color]="buttonTextColor"
              />
              <button
                type="submit"
                class="rounded-lg px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                [ngStyle]="buttonStyle"
                [disabled]="isLoading || !message.trim()"
                [attr.aria-label]="translations.send"
              >
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z"/>
                  <path d="M22 2 11 13"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    input::placeholder {
      color: var(--placeholder-color) !important;
      opacity: 0.7;
    }
  `],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0)' }),
        animate('300ms 1000ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(1)' }))
      ])
    ]),
    trigger('scaleAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms', style({ transform: 'scale(0)' }))
      ])
    ]),
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.9)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0, transform: 'translateY(20px) scale(0.9)' }))
      ])
    ])
  ]
})
export class AiChatButtonComponent implements OnInit, OnDestroy {
  @Input() initialHistory?: ChatMessage[];
  @Output() backgroundChange = new EventEmitter<{ url: string | null, thumbnailUrl?: string | null }>();

  isOpen = false;
  message = '';
  showTooltip = false;
  showBadge = true;
  chatHistory: ChatMessage[] = [];
  isLoading = false;
  translations: any = {};

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private elementRef: ElementRef
  ) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) return;

    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);

    if (!clickedInside) {
      this.closeChat();
    }
  }

  ngOnInit(): void {
    // Load translations first
    this.languageService.fixedTexts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(texts => {
        if (texts?.chat) {
          this.translations = texts.chat;
        } else {
          this.translations = {
            tooltipTitle: 'AI Assistant',
            tooltipDesc: 'I can customize the site for you!',
            chatTitle: 'AI Assistant',
            subtitle: 'Ask me to change the site moodboard',
            placeholder: 'Type a message...',
            send: 'Send',
            welcome: 'Hi! Ask me to change the site moodboard.',
            typing: 'Typing...'
          };
        }
      });

    // Initialize chat history
    if (this.initialHistory && this.initialHistory.length > 0) {
      this.chatHistory = this.initialHistory;
    } else {
      // Fetch history from API
      this.apiService.fetchChatHistory()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (history) => {
            if (history && history.messages && history.messages.length > 0) {
              this.chatHistory = history.messages;

              // Also apply theme/background if present in history
              if (history.primaryColor) {
                // We might need to construct a partial theme to update
                // But typically theme is saved in local storage or fetched via separate theme API
                // For now, just trusting the global theme service
              }
            } else {
              // Default welcome message if no history
              this.chatHistory = [{
                role: 'assistant',
                content: 'Hi! I am your AI assistant. I can help you customize the look of the portfolio. Try asking me to change the colors, theme, or style!'
              }];
            }
          },
          error: (err) => {
            console.error('Failed to fetch chat history', err);
            // Fallback default message on error
            this.chatHistory = [{
              role: 'assistant',
              content: 'Ciao! Sono il tuo assistente AI. Posso aiutarti a personalizzare l\'aspetto del portfolio. Prova a chiedermi di cambiare i colori, il tema o lo stile!'
            }];
          }
        });
    }

    // Show tooltip after delay
    setTimeout(() => {
      this.showTooltip = true;
    }, 1000);

    // Hide tooltip after 10 seconds
    setTimeout(() => {
      this.showTooltip = false;
    }, 10500);
  }

  ngOnDestroy(): void {
    document.body.classList.remove('chat-open');
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleChat(): void {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat(): void {
    this.isOpen = true;
    this.showTooltip = false;
    this.showBadge = false;
    document.body.classList.add('chat-open');
  }

  closeChat(): void {
    this.isOpen = false;
    document.body.classList.remove('chat-open');
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    if (!this.message.trim() || this.isLoading) return;

    const userMsg = this.message;
    this.message = '';
    this.chatHistory.push({ role: 'user', content: userMsg });
    this.isLoading = true;

    this.apiService.sendMessage(userMsg)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.chatHistory.push({ role: 'assistant', content: result.response });

          if (result.backgroundUrl) {
            this.backgroundChange.emit({
              url: result.backgroundUrl,
              thumbnailUrl: result.thumbnailUrl
            });
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Chat Error:', error);
          this.chatHistory.push({
            role: 'assistant',
            content: 'Sorry, I had a problem processing your request.'
          });
          this.isLoading = false;
        }
      });
  }

  // Computed styles
  get primaryColor(): string {
    return this.themeService.currentTheme?.primaryColor || '#a855f7';
  }

  get secondaryColor(): string {
    return this.themeService.currentTheme?.secondaryColor || '#ec4899';
  }

  get accentColor(): string {
    return this.themeService.currentTheme?.accentColor || '#ef4444';
  }

  get assistantColor(): string {
    return this.themeService.currentTheme?.assistantColor || this.primaryColor;
  }

  get textColor(): string {
    return this.themeService.currentTheme?.textColor || '#ffffff';
  }

  get fontFamily(): string | undefined {
    return this.themeService.currentTheme?.fontFamily;
  }

  get gradientStyle(): any {
    return {
      background: `linear-gradient(135deg, ${this.primaryColor}, ${this.secondaryColor})`
    };
  }

  get badgeStyle(): any {
    return {
      backgroundColor: this.accentColor
    };
  }

  get fontStyle(): any {
    return this.fontFamily ? { fontFamily: this.fontFamily } : {};
  }

  get buttonTextColor(): string {
    return this.themeService.getContrastColor(this.primaryColor);
  }

  get tooltipTextColor(): string {
    return this.themeService.getContrastColor(this.primaryColor);
  }

  get headerTextColor(): string {
    return this.themeService.getContrastColor(this.primaryColor);
  }

  get headerStyle(): any {
    return {
      background: `linear-gradient(135deg, ${this.assistantColor}, ${this.secondaryColor})`
    };
  }

  get buttonStyle(): any {
    return {
      background: `linear-gradient(135deg, ${this.primaryColor}, ${this.secondaryColor})`,
      color: this.buttonTextColor
    };
  }

  get inputStyle(): any {
    return {
      background: `linear-gradient(135deg, ${this.primaryColor}, ${this.secondaryColor})`,
      color: this.buttonTextColor
    };
  }
}
