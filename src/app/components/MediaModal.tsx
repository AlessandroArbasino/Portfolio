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
                                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
                                onClick={closeMedia}
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 z-[101] flex flex-col items-center justify-center p-2 md:p-8 pointer-events-none"
                            >
                                <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                                    {/* Close Button - more visible and fixed-like position */}
                                    <div className="absolute top-0 right-0 p-4 z-[102] pointer-events-auto">
                                        <Dialog.Close className="text-white/70 hover:text-white transition-all p-4 md:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 shadow-lg">
                                            <X size={32} className="md:w-7 md:h-7 w-8 h-8" />
                                            <span className="sr-only">Chiudi</span>
                                        </Dialog.Close>
                                    </div>

                                    {/* Media Container */}
                                    <div className="w-full h-full flex items-center justify-center p-4">
                                        <div className="relative max-w-full max-h-full flex items-center justify-center pointer-events-auto shadow-2xl rounded-xl overflow-hidden">
                                            {currentMedia?.isVideo ? (
                                                <video
                                                    src={currentMedia.src}
                                                    controls
                                                    autoPlay
                                                    className="max-w-full max-h-[85vh] md:max-h-[90vh] object-contain"
                                                />
                                            ) : (
                                                <img
                                                    src={currentMedia?.src}
                                                    alt="Full screen media"
                                                    className="max-w-full max-h-[85vh] md:max-h-[90vh] object-contain"
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
