import { motion, AnimatePresence } from 'framer-motion';
import { Slide } from './slides';
import { SlideRenderer } from './SlideRenderer';

interface SlidePickerProps {
  slides: Slide[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (index: number) => void;
}

export function SlidePicker({ slides, currentIndex, isOpen, onClose, onSelect }: SlidePickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="slide-picker-backdrop"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="slide-picker-drawer"
          >
            <div className="drawer-header">
              <h3>Select Slide</h3>
              <button onClick={onClose} className="close-button">✕</button>
            </div>
            
            <div className="thumbnail-container">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`thumbnail-item ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => onSelect(index)}
                >
                  <div className="thumbnail-preview-wrapper">
                    <div className="thumbnail-preview-content">
                      <SlideRenderer slide={slide} />
                    </div>
                  </div>
                  <div className="thumbnail-info">
                    <span className="thumbnail-number">{index + 1}</span>
                    <span className="thumbnail-title">{slide.headline}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
