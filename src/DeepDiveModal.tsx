import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeepDiveModalProps {
  isOpen: boolean;
  image: string;
  imageAlt?: string;
  onClose: () => void;
}

export function DeepDiveModal({ isOpen, image, imageAlt, onClose }: DeepDiveModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="deep-dive-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="deep-dive-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          >
            <button className="deep-dive-close" onClick={onClose}>
              ✕
            </button>
            <div className="deep-dive-image-wrapper">
              <img src={image} alt={imageAlt || ''} className="deep-dive-image" />
            </div>
            {imageAlt && (
              <p className="deep-dive-caption">{imageAlt}</p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
