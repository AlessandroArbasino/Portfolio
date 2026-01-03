import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Theme } from '../models/api.models';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private themeSubject = new BehaviorSubject<Theme | null>(null);
    public theme$ = this.themeSubject.asObservable();

    constructor() { }

    /**
     * Get current theme value
     */
    get currentTheme(): Theme | null {
        return this.themeSubject.value;
    }

    /**
     * Update theme with partial changes
     */
    updateTheme(newTheme: Partial<Theme>): void {
        const current = this.themeSubject.value;
        const updated = current ? { ...current, ...newTheme } : (newTheme as Theme);

        const root = document.documentElement;

        // Update CSS custom properties
        if (newTheme.primaryColor) {
            root.style.setProperty('--primary', newTheme.primaryColor);
            root.style.setProperty('--primary-foreground', this.getContrastColor(newTheme.primaryColor));
        }

        if (newTheme.secondaryColor) {
            root.style.setProperty('--secondary', newTheme.secondaryColor);
            root.style.setProperty('--secondary-foreground', this.getContrastColor(newTheme.secondaryColor));
        }

        if (newTheme.accentColor) {
            root.style.setProperty('--accent', newTheme.accentColor);
            root.style.setProperty('--accent-foreground', this.getContrastColor(newTheme.accentColor));
        }

        if (newTheme.fontFamily) {
            root.style.setProperty('--font-family-sans', newTheme.fontFamily);
            document.body.style.fontFamily = newTheme.fontFamily;
        }

        if (newTheme.backgroundColor) {
            document.body.style.backgroundColor = newTheme.backgroundColor;
            root.style.setProperty('--background', newTheme.backgroundColor);
        }

        if (newTheme.textColor) {
            document.body.style.color = newTheme.textColor;
            root.style.setProperty('--foreground', newTheme.textColor);
        }

        if (newTheme.assistantColor) {
            root.style.setProperty('--assistant-color', newTheme.assistantColor);
            root.style.setProperty('--assistant-foreground', this.getContrastColor(newTheme.assistantColor));
        }

        this.themeSubject.next(updated);
    }

    /**
     * Reset theme to default
     */
    resetTheme(): void {
        this.themeSubject.next(null);
        const root = document.documentElement;
        root.style.removeProperty('--primary');
        root.style.removeProperty('--secondary');
        root.style.removeProperty('--accent');
        root.style.removeProperty('--primary-foreground');
        root.style.removeProperty('--secondary-foreground');
        root.style.removeProperty('--accent-foreground');
        document.body.style.removeProperty('font-family');
        document.body.style.removeProperty('background-color');
        document.body.style.removeProperty('color');
        root.style.removeProperty('--assistant-color');
        root.style.removeProperty('--assistant-foreground');
    }

    /**
     * Calculate contrast color (black or white) for a given hex color
     */
    getContrastColor(hexColor: string): string {
        if (!hexColor || hexColor.length < 7) return '#ffffff';

        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);

        // Calculate YIQ for contrast
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        // Return black or white
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }
}
