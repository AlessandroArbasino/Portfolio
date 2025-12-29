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
    openMedia(url: string, type: 'image' | 'video'): void {
        this.currentMediaSubject.next({ url, type });
        this.isOpenSubject.next(true);
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
