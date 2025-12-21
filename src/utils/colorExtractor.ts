/**
 * Utility to extract dominant and vibrant colors from an image URL.
 */

export interface ExtractedPalette {
    primary: string;
    secondary: string;
    accent: string;
}

export async function extractPalette(imageUrl: string): Promise<ExtractedPalette | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }

            // Small size for performance
            canvas.width = 50;
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const colorCounts: { [key: string]: number } = {};
            const colors: { r: number, g: number, b: number }[] = [];

            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const a = imageData[i + 3];

                if (a < 128) continue; // Skip transparent

                const rgb = `${r},${g},${b}`;
                colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
                colors.push({ r, g, b });
            }

            // Sort by frequency
            const sortedColors = Object.entries(colorCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([rgb]) => {
                    const [r, g, b] = rgb.split(',').map(Number);
                    return { r, g, b };
                });

            if (sortedColors.length < 3) {
                resolve(null);
                return;
            }

            const toHex = (c: number) => c.toString(16).padStart(2, '0');
            const rgbToHex = (r: number, g: number, b: number) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;

            // Heuristic for palette selection
            // 1. Dominant color (Primary)
            // 2. A vibrant contrast (Secondary)
            // 3. A subtle accent

            const primary = rgbToHex(sortedColors[0].r, sortedColors[0].g, sortedColors[0].b);

            // Look for a secondary that is different enough
            let secondaryIdx = 1;
            for (let i = 1; i < sortedColors.length; i++) {
                const diff = Math.abs(sortedColors[0].r - sortedColors[i].r) +
                    Math.abs(sortedColors[0].g - sortedColors[i].g) +
                    Math.abs(sortedColors[0].b - sortedColors[i].b);
                if (diff > 100) {
                    secondaryIdx = i;
                    break;
                }
            }

            const secondary = rgbToHex(sortedColors[secondaryIdx].r, sortedColors[secondaryIdx].g, sortedColors[secondaryIdx].b);

            // Accent: look for something even more different or just pick one
            let accentIdx = secondaryIdx + 1;
            if (accentIdx >= sortedColors.length) accentIdx = 0;

            const accent = rgbToHex(sortedColors[accentIdx].r, sortedColors[accentIdx].g, sortedColors[accentIdx].b);

            resolve({ primary, secondary, accent });
        };

        img.onerror = () => {
            resolve(null);
        };
    });
}
