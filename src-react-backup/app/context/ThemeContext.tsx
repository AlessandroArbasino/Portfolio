import React, { createContext, useContext, ReactNode } from 'react';

export interface Theme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    backgroundColor?: string;
    textColor?: string;
}

interface ThemeContextType {
    theme: Theme | null;
    updateTheme: (theme: Partial<Theme>) => void;
    resetTheme: () => void;
    getContrastColor: (hexColor: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = React.useState<Theme | null>(null);

    // Helper to calculate contrast color
    const getContrastColor = React.useCallback((hexColor: string) => {
        if (!hexColor || hexColor.length < 7) return '#ffffff';
        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);

        // Calculate YIQ
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        // Return black or white
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }, []);

    const updateTheme = React.useCallback((newTheme: Partial<Theme>) => {
        setTheme(prev => {
            const updated = prev ? { ...prev, ...newTheme } : (newTheme as Theme);

            const root = document.documentElement;

            if (newTheme.primaryColor) {
                root.style.setProperty('--primary', newTheme.primaryColor);
                root.style.setProperty('--primary-foreground', getContrastColor(newTheme.primaryColor));
            }

            if (newTheme.secondaryColor) {
                root.style.setProperty('--secondary', newTheme.secondaryColor);
                root.style.setProperty('--secondary-foreground', getContrastColor(newTheme.secondaryColor));
            }

            if (newTheme.accentColor) {
                root.style.setProperty('--accent', newTheme.accentColor);
                root.style.setProperty('--accent-foreground', getContrastColor(newTheme.accentColor));
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

            return updated;
        });
    }, [getContrastColor]);

    const resetTheme = React.useCallback(() => {
        setTheme(null);
        const root = document.documentElement;
        root.style.removeProperty('--primary');
        root.style.removeProperty('--secondary');
        root.style.removeProperty('--accent');
        document.body.style.removeProperty('font-family');
    }, []);

    const contextValue = React.useMemo(() => ({ theme, updateTheme, resetTheme, getContrastColor }), [theme, updateTheme, resetTheme, getContrastColor]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
