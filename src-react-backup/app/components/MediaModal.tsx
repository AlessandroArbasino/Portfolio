import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { motion, AnimatePresence } from 'motion/react';

export function MediaModal() {
    const { isOpen, closeMedia, currentMedia } = useMedia();

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeMedia()}>
            <AnimatePresence>
                {isOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100]"
                                onClick={closeMedia}
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 z-[101] flex flex-col items-center justify-center pointer-events-none"
                            >
                                <div className="relative w-full h-full flex flex-col items-center justify-center p-2 md:p-8 pointer-events-none">
                                    {/* Close Button - fixed relative to viewport for accessibility */}
                                    <div className="absolute top-0 right-0 p-4 md:p-6 z-[103] pointer-events-auto">
                                        <Dialog.Close className="text-white/70 hover:text-white transition-all p-3 md:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 shadow-lg">
                                            <X size={28} className="md:w-7 md:h-7 w-6 h-6" />
                                            <span className="sr-only">Chiudi</span>
                                        </Dialog.Close>
                                    </div>

                                    {/* Media Container - ensures fitting in both portrait and landscape */}
                                    <div className="w-full h-full flex items-center justify-center pointer-events-auto">
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            {currentMedia?.isVideo ? (
                                                <video
                                                    src={currentMedia.src}
                                                    controls
                                                    autoPlay
                                                    className="max-w-[calc(100vw-4rem)] max-h-[calc(100vh-4rem)] md:max-w-[85vw] md:max-h-[85vh] object-contain shadow-2xl rounded-lg"
                                                />
                                            ) : (
                                                <img
                                                    src={currentMedia?.src}
                                                    alt="Full screen media"
                                                    className="max-w-[calc(100vw-4rem)] max-h-[calc(100vh-4rem)] md:max-w-[85vw] md:max-h-[85vh] object-contain shadow-2xl rounded-lg"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
