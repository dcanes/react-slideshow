import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { slides as initialSlides, Slide } from './slides';
import { SlideRenderer } from './SlideRenderer';
import { SlidePicker } from './SlidePicker';
import './styles.css';

function App() {
  const [slideData, setSlideData] = useState<Slide[]>(initialSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomMode, setZoomMode] = useState(true);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const totalSlides = slideData.length;
  const currentSlide = slideData[currentIndex];

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
        <div className="slide-counter" onClick={() => setIsPickerOpen(true)}>
          {currentIndex + 1} / {totalSlides}
        </div>
      </footer>

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
