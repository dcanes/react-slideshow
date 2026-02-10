import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isLoaded, setIsLoaded] = useState(false);

  const totalSlides = slideData.length;
  const currentSlide = slideData[currentIndex];

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
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'z' || event.key === 'Z') {
        setZoomMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides]);

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
          />
        </AnimatePresence>
      </main>

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
    </div>
  );
}

export default App;
