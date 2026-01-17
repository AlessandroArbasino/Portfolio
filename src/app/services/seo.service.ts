import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private defaultConfig: SeoConfig = {
        title: 'Alessandro Arbasino - Full Stack Developer & Software Engineer',
        description: 'Full Stack Developer specializing in Angular, Node.js, and modern web technologies. Portfolio showcasing web applications and videogame projects.',
        keywords: 'Alessandro Arbasino, Full Stack Developer, Angular Developer, Node.js, TypeScript, Web Development, Software Engineer, Portfolio',
        image: 'https://alessandroarbasino.vercel.app/AA_Logo.ico',
        url: 'https://alessandroarbasino.vercel.app/',
        type: 'website'
    };

    constructor(
        private meta: Meta,
        private title: Title
    ) { }

    /**
     * Update all SEO meta tags
     */
    updateMetaTags(config: SeoConfig): void {
        const seoConfig = { ...this.defaultConfig, ...config };

        // Update title
        if (seoConfig.title) {
            this.title.setTitle(seoConfig.title);
        }

        // Update standard meta tags
        this.updateTag('description', seoConfig.description);
        this.updateTag('keywords', seoConfig.keywords);

        // Update Open Graph tags
        this.updateProperty('og:title', seoConfig.title);
        this.updateProperty('og:description', seoConfig.description);
        this.updateProperty('og:image', seoConfig.image);
        this.updateProperty('og:url', seoConfig.url);
        this.updateProperty('og:type', seoConfig.type);

        // Update Twitter Card tags
        this.updateTag('twitter:title', seoConfig.title);
        this.updateTag('twitter:description', seoConfig.description);
        this.updateTag('twitter:image', seoConfig.image);
        this.updateTag('twitter:url', seoConfig.url);

        // Update canonical URL
        this.updateCanonical(seoConfig.url);
    }

    /**
     * Update meta tag by name
     */
    private updateTag(name: string, content?: string): void {
        if (content) {
            this.meta.updateTag({ name, content });
        }
    }

    /**
     * Update meta tag by property (for Open Graph)
     */
    private updateProperty(property: string, content?: string): void {
        if (content) {
            this.meta.updateTag({ property, content });
        }
    }

    /**
     * Update canonical link
     */
    private updateCanonical(url?: string): void {
        if (!url) return;

        // Remove existing canonical
        const existingCanonical = document.querySelector('link[rel="canonical"]');
        if (existingCanonical) {
            existingCanonical.setAttribute('href', url);
        } else {
            // Create new canonical if doesn't exist
            const link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            link.setAttribute('href', url);
            document.head.appendChild(link);
        }
    }

    /**
     * Update HTML lang attribute
     */
    updateLanguage(lang: string): void {
        document.documentElement.lang = lang;
    }

    /**
     * Reset to default SEO config
     */
    resetToDefault(): void {
        this.updateMetaTags(this.defaultConfig);
    }
}
