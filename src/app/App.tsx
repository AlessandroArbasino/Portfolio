import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react'; // Ensure this import is correct based on project deps
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import { Documents } from './components/Documents';
import { AIChatButton } from './components/AIChatButton';
import { VideoBackground } from './components/VideoBackground';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageSelector } from './components/LanguageSelector';
import { Loading } from './components/Loading';
import { fetchChatHistory, getBackgroundImages, saveTheme } from '../api';
import { extractPalette } from '../utils/colorExtractor';

export default function App() {
  const [forcedBackground, setForcedBackground] = useState<string | null>(null);
  const [initialChatHistory, setInitialChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { updateTheme } = useTheme();

  const handleBackgroundChange = React.useCallback(async (url: string | null, thumbnailUrl?: string | null) => {
    if (url || thumbnailUrl) {
      // Use thumbnail for extraction if available (recommended for videos)
      const extractUrl = thumbnailUrl || url;
      if (extractUrl) {
        const palette = await extractPalette(extractUrl);
        if (palette) {
          const newTheme = {
            primaryColor: palette.primary,
            secondaryColor: palette.secondary,
            accentColor: palette.accent
          };
          updateTheme(newTheme);
          // Persist the extracted theme on the backend
          saveTheme(newTheme).catch(e => console.error("Failed to persist theme:", e));
        }
      }
    }
    // Set the background URL ONLY after the theme has potentially been updated
    // This makes the transition feel atomic and avoids text contrast issues on fade-in
    setForcedBackground(url);
  }, [updateTheme]);

  const handleHistory = React.useCallback((msgs: { role: 'user' | 'assistant'; content: string }[]) => setInitialChatHistory(msgs), []);
  const handleLoaded = React.useCallback(() => setIsLoading(false), []);

  return (
    <>
      <StartupInitializer
        onBackground={handleBackgroundChange}
        onHistory={handleHistory}
        onLoaded={handleLoaded}
      />
      <AnimatePresence>
        {isLoading && <Loading key="loading-screen" isLoading={true} />}
      </AnimatePresence>
      <div className="relative min-h-screen overflow-x-hidden">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Video Background */}
        <VideoBackground forcedUrl={forcedBackground} />

        {/* Main Content */}
        <main className="relative z-10">
          <Hero />
          <About />
          <Projects />
          <Documents />
          <Contact />
        </main>

        {/* AI Chat Button */}
        <AIChatButton onBackgroundChange={handleBackgroundChange} initialHistory={initialChatHistory || undefined} />
      </div>
    </>
  );
}

let hasRunGlobal = false;

function StartupInitializer({ onBackground, onHistory, onLoaded }: {
  onBackground: (url: string | null, thumbnailUrl?: string | null) => void;
  onHistory: (msgs: { role: 'user' | 'assistant'; content: string }[]) => void;
  onLoaded: () => void;
}) {
  const { updateTheme } = useTheme();

  useEffect(() => {
    if (hasRunGlobal) return;
    hasRunGlobal = true;

    (async () => {
      try {
        const data = await fetchChatHistory();
        if (data.backgroundUrl) {
          onBackground(data.backgroundUrl, data.thumbnailUrl);
        } else {
          // Fallback: pick a default motion background
          try {
            const images = await getBackgroundImages('abstract dark gradient', 'motion-backgrounds');
            if (Array.isArray(images) && images.length > 0) {
              onBackground(images[0]);
            }
          } catch { }
        }

        if (Array.isArray(data.messages) && data.messages.length > 0) {
          onHistory(data.messages);
        }

        const theme: any = {};
        if (data.primaryColor) theme.primaryColor = data.primaryColor;
        if (data.secondaryColor) theme.secondaryColor = data.secondaryColor;
        if (data.accentColor) theme.accentColor = data.accentColor;
        if (data.fontFamily) theme.fontFamily = data.fontFamily;
        if (data.backgroundColor) theme.backgroundColor = data.backgroundColor;
        if (data.textColor) theme.textColor = data.textColor;
        if (data.assistantColor) theme.assistantColor = data.assistantColor;
        if (Object.keys(theme).length > 0) {
          updateTheme(theme);
        }
      } catch (e) {
        // ignore startup errors
      } finally {
        // Ensure loading screen is removed even if there are errors
        onLoaded();
      }
    })();
    // Empty dependency array ensures this only runs once on mount.
    // The ref is an extra guard for React Strict Mode.
  }, []);

  return null;
}
