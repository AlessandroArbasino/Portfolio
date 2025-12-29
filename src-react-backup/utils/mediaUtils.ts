/**
 * Heuristic to detect if a URL is a video.
 */
export const isVideo = (url: string | null | undefined): boolean => {
    if (!url) return false;

    // Specific domains that are known images
    if (url.includes('images.unsplash.com')) return false;

    // Extension check (case insensitive)
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
    const lowercaseUrl = url.toLowerCase();

    // Specific video domains
    if (
        url.includes('player.vimeo.com') ||
        url.includes('youtube.com/embed') ||
        url.includes('pexels.com/video') ||
        url.includes('assets.mixkit.co')
    ) {
        return true;
    }

    if (videoExtensions.some(ext => lowercaseUrl.includes(ext))) return true;

    // Final check: if it has a known image extension, it's an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (imageExtensions.some(ext => lowercaseUrl.includes(ext))) return false;

    // Default heuristic for Pexels URLs that don't have extension but are videos
    if (url.includes('pexels.com') && !url.includes('images.pexels.com')) return true;

    // Default to false (image)
    return false;
};
