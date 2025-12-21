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
import { fetchChatHistory, getBackgroundImages } from '../api';

export default function App() {
  const [forcedBackground, setForcedBackground] = useState<string | null>(null);
  const [initialChatHistory, setInitialChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleBackground = React.useCallback((url: string | null) => setForcedBackground(url), []);
  const handleHistory = React.useCallback((msgs: { role: 'user' | 'assistant'; content: string }[]) => setInitialChatHistory(msgs), []);
  const handleLoaded = React.useCallback(() => setIsLoading(false), []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <StartupInitializer
          onBackground={handleBackground}
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
          <AIChatButton onBackgroundChange={setForcedBackground} initialHistory={initialChatHistory || undefined} />
        </div>
      </ThemeProvider>
    </LanguageProvider>
  );
}

function StartupInitializer({ onBackground, onHistory, onLoaded }: {
  onBackground: (url: string | null) => void;
  onHistory: (msgs: { role: 'user' | 'assistant'; content: string }[]) => void;
  onLoaded: () => void;
}) {
  const { updateTheme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchChatHistory();
        if (data.backgroundUrl) {
          onBackground(data.backgroundUrl);
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
  }, [updateTheme, onBackground, onLoaded]);

  return null;
}
