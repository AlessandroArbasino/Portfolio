import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MediaContextType {
    openMedia: (src: string, isVideo: boolean) => void;
    closeMedia: () => void;
    isOpen: boolean;
    currentMedia: { src: string; isVideo: boolean } | null;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMedia, setCurrentMedia] = useState<{ src: string; isVideo: boolean } | null>(null);

    const openMedia = (src: string, isVideo: boolean) => {
        setCurrentMedia({ src, isVideo });
        setIsOpen(true);
    };

    const closeMedia = () => {
        setIsOpen(false);
        // Optional: delay clearing currentMedia for smooth exit animation
        setTimeout(() => setCurrentMedia(null), 300);
    };

    return (
        <MediaContext.Provider value={{ openMedia, closeMedia, isOpen, currentMedia }}>
            {children}
        </MediaContext.Provider>
    );
}

export function useMedia() {
    const context = useContext(MediaContext);
    if (context === undefined) {
        throw new Error('useMedia must be used within a MediaProvider');
    }
    return context;
}
