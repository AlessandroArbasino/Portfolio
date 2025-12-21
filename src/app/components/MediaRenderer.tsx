import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MediaRendererProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
}

/**
 * Heuristic to detect if a URL is a video.
 */
export const isVideo = (url: string) => {
    if (!url) return false;

    // Specific domains that are known images
    if (url.includes('images.unsplash.com')) return false;

    // Extension check (case insensitive)
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
    const lowercaseUrl = url.toLowerCase();
    if (videoExtensions.some(ext => lowercaseUrl.includes(ext))) return true;

    // Heuristic for Pexels or others
    if (url.includes('player.vimeo.com') || url.includes('youtube.com/embed') || url.includes('pexels.com/video')) return true;

    // Final check: if it has a known image extension, it's an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (imageExtensions.some(ext => lowercaseUrl.includes(ext))) return false;

    // Default to false (image)
    return false;
};

export function MediaRenderer({ src, alt, className, style, ...rest }: MediaRendererProps) {
    // Use object-contain for all media to respect original aspect ratio without zooming
    const normalizedClassName = className?.includes('object-cover')
        ? className.replace('object-cover', 'object-contain')
        : className;

    if (isVideo(src)) {
        // Extract video-compatible props from rest to avoid React type warnings/errors
        const {
            // Omit image specific props that might be in rest
            crossOrigin: _crossOrigin,
            decoding: _decoding,
            loading: _loading,
            referrerPolicy: _referrerPolicy,
            useMap: _useMap,
            ...videoProps
        } = rest as any;

        return (
            <video
                src={src}
                className={normalizedClassName}
                style={style}
                autoPlay
                muted
                loop
                playsInline
                {...videoProps}
            />
        );
    }

    return (
        <ImageWithFallback
            src={src}
            alt={alt}
            className={normalizedClassName}
            style={style}
            {...rest}
        />
    );
}
