import { useState } from 'react';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import { AIChatButton } from './components/AIChatButton';
import { VideoBackground } from './components/VideoBackground';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageSelector } from './components/LanguageSelector';

export default function App() {
  const [forcedBackground, setForcedBackground] = useState<string | null>(null);

  return (
    <LanguageProvider>
      <ThemeProvider>
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
            <Contact />
          </main>

          {/* AI Chat Button */}
          <AIChatButton onBackgroundChange={setForcedBackground} />
        </div>
      </ThemeProvider>
    </LanguageProvider>
  );
}
