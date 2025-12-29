import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-video-background',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 w-full h-full overflow-hidden" style="z-index: 0;">
      @if (currentUrl) {
        @if (isVideo(currentUrl)) {
          <video
            [@fadeAnimation]
            [src]="currentUrl"
            class="absolute inset-0 w-full h-full object-cover"
            autoplay
            loop
            muted
            playsinline
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
                animate('800ms ease-in', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('800ms ease-out', style({ opacity: 0 }))
            ])
        ])
    ]
})
export class VideoBackgroundComponent implements OnChanges {
    @Input() forcedUrl: string | null = null;
    currentUrl: string | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['forcedUrl'] && changes['forcedUrl'].currentValue) {
            this.currentUrl = changes['forcedUrl'].currentValue;
        }
    }

    isVideo(url: string): boolean {
        return url.includes('.mp4') || url.includes('.webm') || url.includes('video');
    }
}
