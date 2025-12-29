import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-media-renderer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      class="cursor-pointer transition-transform hover:scale-105"
      (click)="handleClick()"
    >
      @if (type === 'image') {
        <img 
          [src]="url" 
          [alt]="alt"
          class="w-full h-full object-cover rounded-lg"
          loading="lazy"
        />
      } @else if (type === 'video') {
        <video 
          [src]="url"
          class="w-full h-full object-cover rounded-lg"
          [muted]="true"
          [loop]="true"
          [autoplay]="autoplay"
          playsinline
        ></video>
      }
    </div>
  `
})
export class MediaRendererComponent {
    @Input() url!: string;
    @Input() type: 'image' | 'video' = 'image';
    @Input() alt: string = '';
    @Input() autoplay: boolean = false;
    @Output() mediaClick = new EventEmitter<{ url: string, type: 'image' | 'video' }>();

    handleClick(): void {
        this.mediaClick.emit({ url: this.url, type: this.type });
    }
}
