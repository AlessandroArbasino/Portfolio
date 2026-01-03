import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-video-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 w-full h-full overflow-hidden" style="z-index: 0; background-color: black;">
      @if (currentUrl) {
        @if (isVideo(currentUrl)) {
          <video
            #videoPlayer
            [@fadeAnimation]
            [src]="currentUrl"
            class="absolute inset-0 w-full h-full object-cover"
            [muted]="true"
            [loop]="true"
            [autoplay]="true"
            playsinline
            (loadedmetadata)="onMetadataLoaded()"
            (canplay)="onCanPlay()"
          ></video>
        } @else {
          <img
            [@fadeAnimation]
            [src]="currentUrl"
            class="absolute inset-0 w-full h-full object-cover"
            alt="Background"
          />
        }
      }
      <!-- Overlay for better text readability -->
      <div class="absolute inset-0 bg-black/30"></div>
    </div>
  `,
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class VideoBackgroundComponent implements OnChanges {
  @Input() forcedUrl: string | null = null;
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;

  currentUrl: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['forcedUrl']) {
      const newUrl = changes['forcedUrl'].currentValue;
      if (newUrl !== this.currentUrl) {
        this.currentUrl = newUrl;
        // If the video element already exists, we might need to tell it to load the new source
        setTimeout(() => this.playVideo(), 50);
      }
    }
  }

  onMetadataLoaded() {
    this.playVideo();
  }

  onCanPlay() {
    this.playVideo();
  }

  private playVideo() {
    if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.play().catch(err => {
        // Autoplay might be blocked by browser until interaction
        console.log('Autoplay deferred or blocked:', err);
      });
    }
  }

  isVideo(url: string): boolean {
    if (!url) return false;
    return url.includes('.mp4') || url.includes('.webm') || url.includes('video') || url.includes('pexels');
  }
}
