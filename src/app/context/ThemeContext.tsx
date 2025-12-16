import React, { createContext, useContext, ReactNode } from 'react';

export interface Theme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
}

interface ThemeContextType {
    updateTheme: (theme: Theme) => void;
    resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Helper to calculate contrast color
    const getContrastColor = (hexColor: string) => {
        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);

        // Calculate YIQ
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        // Return black or white
        return (yiq >= 128) ? '#000000' : '#ffffff';
    };

    const updateTheme = (theme: Theme) => {
        const root = document.documentElement;

        if (theme.primaryColor) {
            root.style.setProperty('--primary', theme.primaryColor);
            root.style.setProperty('--primary-foreground', getContrastColor(theme.primaryColor));
        }

        if (theme.secondaryColor) {
            root.style.setProperty('--secondary', theme.secondaryColor);
            root.style.setProperty('--secondary-foreground', getContrastColor(theme.secondaryColor));
        }

        if (theme.accentColor) {
            root.style.setProperty('--accent', theme.accentColor);
            root.style.setProperty('--accent-foreground', getContrastColor(theme.accentColor));
        }

        // You might want to map font-family to specific CSS variables or google fonts import
        // For simplicity, we'll assuming standard fonts or update the --font-family variable if it exists
        // checking index.css, standard fonts are used. Let's try to set a global font.
        if (theme.fontFamily) {
            root.style.setProperty('--font-family-sans', theme.fontFamily);
            document.body.style.fontFamily = theme.fontFamily;
        }
    };

    const resetTheme = () => {
        const root = document.documentElement;
        root.style.removeProperty('--primary');
        root.style.removeProperty('--secondary');
        root.style.removeProperty('--accent');
        document.body.style.removeProperty('font-family');
    };

    return (
        <ThemeContext.Provider value={{ updateTheme, resetTheme }}>
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
