import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send } from 'lucide-react';
import { sendMessage, fetchChatHistory } from '../../api';
import { useTheme } from '../context/ThemeContext';

interface AIChatButtonProps {
  initialHistory?: { role: 'user' | 'assistant'; content: string }[];
  onBackgroundChange?: (url: string | null) => void;
}

export function AIChatButton({ initialHistory, onBackgroundChange }: AIChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Ciao! Sono il tuo assistente AI. Posso aiutarti a personalizzare l\'aspetto del portfolio. Prova a chiedermi di cambiare i colori, il tema o lo stile!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const { updateTheme } = useTheme();

  // Startup history/theme loading is handled globally at app mount
  useEffect(() => {
    if (initialHistory && Array.isArray(initialHistory) && initialHistory.length > 0) {
      setChatHistory(initialHistory);
    }
  }, [initialHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const result = await sendMessage(userMsg);
      setChatHistory(prev => [...prev, { role: 'assistant', content: result.response }]);

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

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:shadow-xl transition-shadow"
        aria-label="Open AI chat"
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

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] max-w-md"
          >
            <div className="bg-popover/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-primary px-6 py-4">
                <h3 className="text-primary-foreground font-medium">AI Assistant</h3>
                <p className="text-primary-foreground/80 text-sm">Chiedimi di modificare la moodboard del sito</p>
              </div>

              {/* Messages */}
              <div className="p-6 h-64 overflow-y-auto flex flex-col gap-4">
                {chatHistory.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                      ? 'bg-primary ml-auto text-primary-foreground'
                      : 'bg-muted text-foreground'
                      }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="text-muted-foreground text-xs italic">Sta scrivendo...</div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 bg-input border border-input rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-primary rounded-lg px-4 py-2 text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                    aria-label="Send message"
                    disabled={isLoading}
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
