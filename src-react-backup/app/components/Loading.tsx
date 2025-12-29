import { motion } from 'motion/react';
import { Code2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LoadingProps {
  isLoading: boolean;
}

export function Loading({ isLoading }: LoadingProps) {
  const { language } = useLanguage();

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        />
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated logo/icon */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-white/80 border-r-white/60"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Code2 className="text-white" size={32} />
          </div>
        </motion.div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white text-xl"
          >
            {language === 'it' ? 'Caricamento...' : 'Loading...'}
          </motion.h2>

          {/* Animated dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-white/60 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              ease: "easeInOut",
            }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          />
        </div>
      </div>
    </motion.div>
  );
}