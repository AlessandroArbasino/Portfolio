import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { sendMessage } from '../../api';

interface AIChatButtonProps {
  showWelcome?: boolean;
  initialHistory?: { role: 'user' | 'assistant'; content: string }[];
  onBackgroundChange?: (url: string | null) => void;
}

export function AIChatButton({ showWelcome = true, initialHistory, onBackgroundChange }: AIChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Logic from previous version
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Ciao! Sono il tuo assistente AI. Posso aiutarti a personalizzare l\'aspetto del portfolio. Prova a chiedermi di cambiare i colori, il tema o lo stile!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const { language, fixedTexts } = useLanguage();
  const { updateTheme, theme } = useTheme();

  // Restore history sync effect
  useEffect(() => {
    if (initialHistory && Array.isArray(initialHistory) && initialHistory.length > 0) {
      setChatHistory(initialHistory);
    }
  }, [initialHistory]);

  // Tooltip effect (New)
  useEffect(() => {
    // Mostra il tooltip dopo che il loading è completato
    if (showWelcome) {
      // Sync with button delay (1s)
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 1000);

      // Nascondi il tooltip dopo 10 secondi
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 10500);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [showWelcome]);

  // Click outside to close effect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
    setShowBadge(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const result = await sendMessage(userMsg);
      // The backend maps gemini text to 'response'
      const reply = result.response;

      setChatHistory(prev => [...prev, { role: 'assistant', content: reply }]);

      if (result.backgroundUrl && onBackgroundChange) {
        onBackgroundChange(result.backgroundUrl);
      }

      if (result.theme) {
        updateTheme(result.theme);
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Scusa, ho avuto un problema nel processare la tua richiesta." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const translations = fixedTexts?.chat || {
    tooltipTitle: 'AI Assistant',
    tooltipDesc: 'I can customize the site for you!',
    chatTitle: 'AI Assistant',
    welcome: 'Hi! Ask me to change the site moodboard.',
    placeholder: 'Type a message...',
    send: 'Send',
    subtitle: 'Ask me to change the site moodboard'
  };

  // Dynamic Styles
  const primaryColor = theme?.primaryColor || '#a855f7'; // purple-500
  const secondaryColor = theme?.secondaryColor || '#ec4899'; // pink-500
  const accentColor = theme?.accentColor || '#ef4444'; // red-500
  const textColor = theme?.textColor; // Don't force this globally on the button, mostly for internal content
  const fontFamily = theme?.fontFamily;

  const gradientStyle = {
    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
  };

  const badgeStyle = {
    backgroundColor: accentColor,
  };

  const fontStyle = fontFamily ? { fontFamily } : {};

  return (
    <>
      {/* Tooltip/Welcome Message */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 20 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="fixed bottom-24 right-6 z-40 max-w-xs"
            style={fontStyle}
          >
            <div
              className="rounded-2xl p-4 shadow-2xl relative"
              style={gradientStyle}
            >
              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white mb-1 text-sm">{translations.tooltipTitle}</h4>
                  <p className="text-white/90 text-xs leading-relaxed">
                    {translations.tooltipDesc}
                  </p>
                </div>
                <button
                  onClick={() => setShowTooltip(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              {/* Arrow */}
              <div
                className="absolute -bottom-2 right-8 w-4 h-4 transform rotate-45"
                style={gradientStyle}
              ></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button with pulse animation and badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        {/* Pulse animation ring */}
        <AnimatePresence>
          {showBadge && !isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full"
                style={gradientStyle}
              />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute inset-0 rounded-full"
                style={gradientStyle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification badge */}
        <AnimatePresence>
          {showBadge && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-950 flex items-center justify-center z-10"
              style={badgeStyle}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-white rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          ref={buttonRef}
          onClick={handleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
          aria-label="Open AI chat"
          style={gradientStyle}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            ref={chatRef}
            className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] max-w-md"
            style={fontStyle}
          >
            <div
              className="backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden"
              style={{
                backgroundColor: theme?.backgroundColor ? `${theme.backgroundColor}f2` : 'rgba(0, 0, 0, 0.8)',
                borderColor: theme?.primaryColor ? `${theme.primaryColor}33` : 'rgba(255, 255, 255, 0.2)',
                color: theme?.textColor || '#ffffff'
              }}
            >
              {/* Header */}
              <div
                className="px-6 py-4"
                style={gradientStyle}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={18} className="text-white" />
                  <h3 className="text-white">{translations.chatTitle}</h3>
                </div>
                <p className="text-white/80 text-sm">{translations.subtitle}</p>
              </div>

              {/* Messages */}
              <div className="p-6 h-64 overflow-y-auto flex flex-col gap-4">
                {chatHistory.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={msg.role === 'user' ? {
                      backgroundColor: primaryColor,
                      color: '#fff',
                      marginLeft: 'auto'
                    } : {
                      backgroundColor: theme?.assistantColor || (theme?.backgroundColor ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'),
                      color: theme?.assistantColor ? '#ffffff' : (theme?.textColor || '#ffffff'),
                      border: theme?.assistantColor ? 'none' : `1px solid ${theme?.primaryColor}20`
                    }}
                    className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm`}
                  >
                    <p>{msg.content}</p>
                  </motion.div>
                ))}
                {isLoading && (
                  <div
                    className="text-xs italic opacity-60"
                    style={{ color: theme?.textColor || '#ffffff' }}
                  >
                    Sta scrivendo...
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={translations.placeholder}
                    className="flex-1 rounded-lg px-4 py-2 placeholder-white/40 focus:outline-none transition-colors border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: theme?.primaryColor ? `${theme.primaryColor}40` : 'rgba(255, 255, 255, 0.2)',
                      color: theme?.textColor || '#ffffff'
                    }}
                  />
                  <button
                    type="submit"
                    className="rounded-lg px-4 py-2 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    aria-label={translations.send}
                    disabled={isLoading}
                    style={gradientStyle}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}