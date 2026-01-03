import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MediaItem } from '../models/api.models';

@Injectable({
    providedIn: 'root'
})
export class MediaService {
    private isOpenSubject = new BehaviorSubject<boolean>(false);
    private currentMediaSubject = new BehaviorSubject<MediaItem | null>(null);

    public isOpen$ = this.isOpenSubject.asObservable();
    public currentMedia$ = this.currentMediaSubject.asObservable();

    constructor() { }

    /**
     * Open media modal with given URL and type
     */
    openMedia(url: string, type: 'image' | 'video', startTime: number = 0): void {
        this.currentMediaSubject.next({ url, type, startTime });
        this.isOpenSubject.next(true);
    }

    /**
     * Centralized utility to optimize Cloudinary URLs
     */
    getOptimizedUrl(url: string, type: 'image' | 'video'): string {
        if (!url || !url.includes('cloudinary.com')) return url;

        // Cloudinary optimization: q_auto (quality auto), f_auto (format auto)
        // For videos also add vc_auto (video codec auto)
        const optimization = type === 'video' ? 'q_auto,f_auto,vc_auto' : 'q_auto,f_auto';

        if (url.includes('/upload/')) {
            return url.replace('/upload/', `/upload/${optimization}/`);
        }
        return url;
    }

    /**
     * Close media modal
     */
    closeMedia(): void {
        this.isOpenSubject.next(false);
        // Delay clearing media to allow exit animation
        setTimeout(() => {
            this.currentMediaSubject.next(null);
        }, 300);
    }
}
