import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { slides as initialSlides, Slide } from './slides';
import { SlideRenderer } from './SlideRenderer';
import { SlidePicker } from './SlidePicker';
import { generateMarkdown } from './utils/markdownExport';
import { saveSlides, loadSlides } from './utils/db';
import './styles.css';

function App() {
  const [slideData, setSlideData] = useState<Slide[]>(initialSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomMode, setZoomMode] = useState(true);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isLoaded, setIsLoaded] = useState(false);

  // Shortcut States
  const [isBlurred, setIsBlurred] = useState(false);
  const [isWhiteboard, setIsWhiteboard] = useState(false);
  const [isSpotlight, setIsSpotlight] = useState(false);
  const [activeTileIndex, setActiveTileIndex] = useState(-1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [toast, setToast] = useState<string | null>(null);

  const totalSlides = slideData.length;
  const currentSlide = slideData[currentIndex];

  // Toast helper
  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Confetti trigger
  const triggerConfetti = useCallback(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000, colors: ['#d4af37', '#ffffff'] };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  // Load from IndexedDB on mount
  useEffect(() => {
    async function init() {
      const saved = await loadSlides();
      if (saved) {
        setSlideData(initialSlides.map(initialSlide => {
          const savedSlide = saved.find((s: any) => s.id === initialSlide.id);
          if (savedSlide && savedSlide.image) {
            return { ...initialSlide, image: savedSlide.image };
          }
          return initialSlide;
        }));
      }
      setIsLoaded(true);
    }
    init();
  }, []);

  // Save to IndexedDB whenever slideData changes
  useEffect(() => {
    if (isLoaded) {
      saveSlides(slideData).catch(err => console.error('Failed to save slides:', err));
    }
  }, [slideData, isLoaded]);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalSlides - 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const jumpToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPickerOpen(false);
  };

  const handleImageUpdate = (slideId: number, newImage: string | undefined) => {
    setSlideData((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, image: newImage } : s))
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Input Protection
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '') || 
                      (document.activeElement as HTMLElement)?.isContentEditable;
      if (isInput) return;

      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'z' || event.key === 'Z') {
        setZoomMode((prev) => !prev);
      } else if (event.key === 'b' || event.key === 'B') {
        setIsBlurred(prev => {
          const next = !prev;
          showToast(`Blur Mode: ${next ? 'ON' : 'OFF'}`);
          return next;
        });
      } else if (event.key === 'w' || event.key === 'W') {
        setIsWhiteboard(prev => {
          const next = !prev;
          showToast(`Whiteboard: ${next ? 'ON' : 'OFF'}`);
          return next;
        });
      } else if (event.key === 's' || event.key === 'S') {
        setIsSpotlight(prev => {
          const next = !prev;
          showToast(`Spotlight: ${next ? 'ON' : 'OFF'}`);
          return next;
        });
      } else if (event.key === 'l' || event.key === 'L') {
        const bodyLength = currentSlide?.body?.length || 0;
        if (bodyLength > 0) {
          setActiveTileIndex(prev => {
            const next = prev >= bodyLength - 1 ? -1 : prev + 1;
            if (next === -1) showToast('Highlighter: OFF');
            else showToast(`Highlighting Tile ${next + 1}`);
            return next;
          });
        }
      } else if (event.key === 'c' || event.key === 'C') {
        triggerConfetti();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [totalSlides, currentSlide, handleNext, handlePrev, showToast, triggerConfetti]);

  if (!currentSlide) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748b' }}>No slides found. Check src/slides.md</div>
      </div>
    );
  }

  const progress = totalSlides > 0 ? ((currentIndex + 1) / totalSlides) * 100 : 0;
  const isDarkMode = currentSlide.type === 'dark' || currentSlide.type === 'hero';

  const appClasses = [
    'app',
    isDarkMode ? 'dark-mode' : '',
    zoomMode ? 'zoom-mode' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={appClasses}>
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="chapter-label">{currentSlide.chapter}</div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Invisible Navigation Areas */}
      <div className="nav-area left" onClick={handlePrev} />
      <div className="nav-area right" onClick={handleNext} />

      <main className="slide-content">
        <AnimatePresence mode="wait">
          <SlideRenderer
            key={currentIndex}
            slide={currentSlide}
            onImageUpdate={handleImageUpdate}
            activeTileIndex={activeTileIndex}
          />
        </AnimatePresence>
      </main>

      {/* Shortcuts Overlays */}
      <AnimatePresence>
        {isBlurred && (
          <motion.div
            className="blur-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
        {isWhiteboard && (
          <motion.div
            className="whiteboard-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
        {isSpotlight && (
          <motion.div
            className="spotlight-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(0,0,0,0.8) 100%)`
            }}
          />
        )}
        {toast && (
          <motion.div
            className="shortcut-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="slide-footer">
        <button className="sync-btn" onClick={() => setIsSyncModalOpen(true)} title="Sync changes to disk">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Sync
        </button>
        <div className="slide-counter" onClick={() => setIsPickerOpen(true)}>
          {currentIndex + 1} / {totalSlides}
        </div>
      </footer>

      {/* Sync Modal */}
      <AnimatePresence>
        {isSyncModalOpen && (
          <>
            <motion.div
              className="sync-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSyncModalOpen(false)}
            />
            <motion.div
              className="sync-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="sync-header">
                <h3>Sync to Disk</h3>
                <button className="sync-close" onClick={() => setIsSyncModalOpen(false)}>✕</button>
              </div>
              <p className="sync-instruction">
                Copy the markdown below and paste it into <code>src/slides.md</code> to permanently save your changes.
              </p>
              <div className="sync-content">
                <pre>{generateMarkdown(slideData)}</pre>
              </div>
              <div className="sync-footer">
                <button
                  className={`copy-btn ${copyStatus === 'copied' ? 'success' : ''}`}
                  onClick={() => {
                    navigator.clipboard.writeText(generateMarkdown(slideData));
                    setCopyStatus('copied');
                    setTimeout(() => setCopyStatus('idle'), 2000);
                  }}
                >
                  {copyStatus === 'copied' ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SlidePicker
        slides={slideData}
        currentIndex={currentIndex}
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={jumpToSlide}
      />

      {/* Keyboard Shortcuts Icon */}
      <button 
        className="shortcuts-icon" 
        onClick={() => setIsShortcutsOpen(true)}
        title="Keyboard Shortcuts"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/>
        </svg>
      </button>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {isShortcutsOpen && (
          <>
            <motion.div 
              className="shortcuts-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShortcutsOpen(false)}
            />
            <motion.div 
              className="shortcuts-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="shortcuts-header">
                <h3>Keyboard Shortcuts</h3>
                <button className="shortcuts-close" onClick={() => setIsShortcutsOpen(false)}>✕</button>
              </div>
              <div className="shortcuts-grid">
                <div className="shortcut-item"><kbd>B</kbd> <span>Toggle Blur</span></div>
                <div className="shortcut-item"><kbd>W</kbd> <span>Toggle Whiteboard</span></div>
                <div className="shortcut-item"><kbd>S</kbd> <span>Toggle Spotlight</span></div>
                <div className="shortcut-item"><kbd>L</kbd> <span>Cycle Tile Highlight</span></div>
                <div className="shortcut-item"><kbd>C</kbd> <span>Confetti Burst</span></div>
                <div className="shortcut-item"><kbd>Z</kbd> <span>Toggle Zoom Mode</span></div>
                <div className="shortcut-item"><kbd>→</kbd> / <kbd>Space</kbd> <span>Next Slide</span></div>
                <div className="shortcut-item"><kbd>←</kbd> <span>Previous Slide</span></div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
