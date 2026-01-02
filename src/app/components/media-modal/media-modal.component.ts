import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { trigger, style, animate, transition } from '@angular/animations';
import { MediaService } from '../../services/media.service';
import { MediaItem } from '../../models/api.models';

@Component({
  selector: 'app-media-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen && currentMedia) {
      <div 
        [@fadeAnimation]
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        (click)="close()"
      >
        <!-- Close button -->
        <button
          class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          (click)="close()"
          aria-label="Close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Media content -->
        <div 
          class="relative max-w-7xl max-h-[90vh] w-full"
          (click)="$event.stopPropagation()"
          [@scaleAnimation]
        >
          @if (currentMedia.type === 'image') {
            <img 
              [src]="currentMedia.url" 
              class="w-full h-full object-contain rounded-lg"
              alt="Full size media"
            />
          } @else if (currentMedia.type === 'video') {
            <video 
              [src]="currentMedia.url"
              class="w-full h-full object-contain rounded-lg"
              controls
              autoplay
            ></video>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.9)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms', style({ transform: 'scale(0.9)', opacity: 0 }))
      ])
    ])
  ]
})
export class MediaModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  currentMedia: MediaItem | null = null;
  private destroy$ = new Subject<void>();

  constructor(private mediaService: MediaService) { }

  ngOnInit(): void {
    this.mediaService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
        if (isOpen) {
          document.body.classList.add('modal-open');
        } else {
          document.body.classList.remove('modal-open');
        }
      });

    this.mediaService.currentMedia$
      .pipe(takeUntil(this.destroy$))
      .subscribe(media => this.currentMedia = media);
  }

  ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.mediaService.closeMedia();
  }
}
