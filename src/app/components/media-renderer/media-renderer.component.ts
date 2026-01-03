import { Component, Input, Output, EventEmitter, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-media-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="relative cursor-pointer transition-transform hover:scale-105 w-full h-full"
      (click)="handleClick()"
    >
      <!-- Loading Overlay -->
      @if (isLoading) {
        <div class="media-loader-container">
          <div class="media-loader"></div>
        </div>
      }

      @if (type === 'image') {
        <img 
          [src]="mediaService.getOptimizedUrl(url, 'image')" 
          [alt]="alt"
          class="w-full h-full object-contain rounded-lg media-hidden"
          [class.media-visible]="!isLoading"
          loading="lazy"
          (load)="onMediaLoaded()"
        />
      } @else if (type === 'video') {
        <video 
          #videoElement
          [src]="mediaService.getOptimizedUrl(url, 'video')"
          class="w-full h-full object-contain rounded-lg media-hidden"
          [class.media-visible]="!isLoading"
          [muted]="true"
          [loop]="true"
          playsinline
          (canplaythrough)="onMediaLoaded()"
        ></video>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class MediaRendererComponent implements AfterViewInit, OnDestroy {
  @Input() url!: string;
  @Input() type: 'image' | 'video' = 'image';
  @Input() alt: string = '';
  @Input() autoplay: boolean = false;
  @Output() mediaClick = new EventEmitter<{ url: string, type: 'image' | 'video', startTime?: number }>();

  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;

  isLoading = true;
  private observer?: IntersectionObserver;

  constructor(public mediaService: MediaService) { }

  ngAfterViewInit(): void {
    if (this.type === 'video' && this.autoplay) {
      this.setupIntersectionObserver();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = this.videoElement?.nativeElement;
        if (!video) return;

        if (entry.isIntersecting) {
          video.play().catch(err => console.warn('Autoplay failed:', err));
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });

    if (this.videoElement) {
      this.observer.observe(this.videoElement.nativeElement);
    }
  }

  onMediaLoaded(): void {
    this.isLoading = false;
  }

  handleClick(): void {
    const startTime = this.videoElement?.nativeElement.currentTime || 0;
    this.mediaClick.emit({ url: this.url, type: this.type, startTime });
  }
}
