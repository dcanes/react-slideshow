import { useState, useEffect, useMemo } from 'react';
import { slides, Slide } from './slides';
import { SlideRenderer } from './SlideRenderer';
import './styles.css';

type TransitionStatus = 'idle' | 'exiting' | 'entering';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionStatus, setTransitionStatus] = useState<TransitionStatus>('entering');
  const [displayIndex, setDisplayIndex] = useState(0);

  const totalSlides = slides.length;
  const currentSlide = slides[displayIndex];

  // Group slides by chapter for the progress bar
  const chapters = useMemo(() => {
    const groups: { name: string; count: number }[] = [];
    slides.forEach((slide) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.name === slide.chapter) {
        lastGroup.count++;
      } else {
        groups.push({ name: slide.chapter, count: 1 });
      }
    });
    return groups;
  }, []);

  const changeSlide = (newIndex: number) => {
    if (newIndex === displayIndex || transitionStatus !== 'idle') return;
    
    setTransitionStatus('exiting');
    setTimeout(() => {
      setDisplayIndex(newIndex);
      setTransitionStatus('entering');
    }, 300);
  };

  useEffect(() => {
    if (transitionStatus === 'entering') {
      const timer = setTimeout(() => setTransitionStatus('idle'), 400);
      return () => clearTimeout(timer);
    }
  }, [transitionStatus]);

  const handleNext = () => {
    if (displayIndex < totalSlides - 1) {
      changeSlide(displayIndex + 1);
    }
  };

  const handlePrev = () => {
    if (displayIndex > 0) {
      changeSlide(displayIndex - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayIndex, transitionStatus]);

  return (
    <div className="app">
      {/* Segmented Progress Bar */}
      <div className="progress-bar">
        {chapters.map((chapter, idx) => {
          const startIdx = slides.findIndex(s => s.chapter === chapter.name);
          const isActiveChapter = currentSlide.chapter === chapter.name;
          
          return (
            <div 
              key={idx} 
              className={`progress-segment ${isActiveChapter ? 'active' : ''}`}
              style={{ flex: chapter.count }}
            >
              <div className="segment-label">{chapter.name}</div>
              <div className="segment-track">
                {Array.from({ length: chapter.count }).map((_, i) => {
                  const slideIdx = startIdx + i;
                  const isPast = slideIdx < displayIndex;
                  const isCurrent = slideIdx === displayIndex;
                  return (
                    <div 
                      key={i} 
                      className={`slide-dot ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clickable Navigation Areas */}
      <div className="nav-area left" onClick={handlePrev} />
      <div className="nav-area right" onClick={handleNext} />

      <main className="slide-container">
        <SlideRenderer 
          slide={currentSlide} 
          className={transitionStatus} 
        />
      </main>

      <footer className="slide-footer">
        <div className="slide-counter">
          Slide {displayIndex + 1} / {totalSlides}
        </div>
      </footer>
    </div>
  );
}

export default App;
