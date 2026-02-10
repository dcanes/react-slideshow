import { Slide } from './slides';

interface SlideRendererProps {
  slide: Slide;
  className?: string;
}

export function SlideRenderer({ slide, className }: SlideRendererProps) {
  const kind = slide.kind || 'default';

  if (kind === 'lossAversion') {
    return (
      <div className={`slide-layout-loss-aversion ${className || ''}`}>
        <div className="loss-aversion-card">
          <header className="loss-aversion-header">
            {slide.title}
          </header>
          <div className="loss-aversion-vow">
            {slide.subtitle}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`slide-layout-default ${className || ''}`}>
      <h1 className="slide-title">{slide.title}</h1>
      {slide.subtitle && <h2 className="slide-subtitle">{slide.subtitle}</h2>}
      {slide.image && (
        <div className="slide-image-container">
          <img src={slide.image} alt={slide.imageAlt || ''} className="slide-image" />
        </div>
      )}
      {slide.bullets && (
        <ul className="slide-bullets">
          {slide.bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
