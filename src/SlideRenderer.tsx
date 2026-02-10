import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slide } from './slides';
import { SmartTile } from './SmartTile';
import { DeepDiveModal } from './DeepDiveModal';
import { ImageManager } from './ImageManager';

interface SlideRendererProps {
  slide: Slide;
  onImageUpdate?: (slideId: number, newImage: string | undefined) => void;
}

export function SlideRenderer({ slide, onImageUpdate }: SlideRendererProps) {
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { layout, headline, body, accent, image, imageAlt } = slide;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  /* --------------------------------------------------
     Dynamic Tile System
     <= 3  items  -> horizontal row of large tiles
     4-6   items  -> bento grid (3 cols, or 2 if 4)
     7+    items  -> tiered grid system (2, 3, or 4 cols)
  -------------------------------------------------- */
  const renderBody = () => {
    if (!body || body.length === 0) return null;
    const count = body.length;

    if (count >= 7) {
      let gridClass = 'bullet-grid-2';
      if (count >= 25) {
        gridClass = 'bullet-grid-4';
      } else if (count >= 11) {
        gridClass = 'bullet-grid-3';
      }

      return (
        <div className={gridClass}>
          {body.map((item, i) => (
            <motion.p key={i} variants={itemVariants} className="list-item">
              {item}
            </motion.p>
          ))}
        </div>
      );
    }

    if (count >= 4) {
      const colClass = count === 4 ? 'cols-2' : '';
      return (
        <div className={`tile-grid ${colClass}`}>
          {body.map((item, i) => (
            <SmartTile key={i} text={item} />
          ))}
        </div>
      );
    }

    return (
      <div className="tile-row">
        {body.map((item, i) => (
          <SmartTile key={i} text={item} />
        ))}
      </div>
    );
  };

  const alignClass = layout === 'stack' ? 'align-left' : '';

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`slide-inner ${alignClass}`}
      >
        {accent && <motion.div variants={itemVariants} className="swiss-divider" />}

        <motion.h1 variants={itemVariants} className="headline">
          {headline}
        </motion.h1>

        {renderBody()}

        {/* Deep-Dive button instead of inline image */}
        {image && (
          <motion.button
            variants={itemVariants}
            className="deep-dive-btn"
            onClick={() => setIsDeepDiveOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 10 }}>
              <path d="M15 3h6v6" />
              <path d="M9 21H3v-6" />
              <path d="M21 3l-7 7" />
              <path d="M3 21l7-7" />
            </svg>
            View Evidence
          </motion.button>
        )}

        {/* Asset icon (bottom-left) */}
        <button
          className="asset-icon"
          onClick={() => setIsEditMode(true)}
          title="Manage image asset"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
      </motion.div>

      {/* Deep-Dive Modal */}
      {image && (
        <DeepDiveModal
          isOpen={isDeepDiveOpen}
          image={image}
          imageAlt={imageAlt}
          onClose={() => setIsDeepDiveOpen(false)}
        />
      )}

      {/* Image Manager Panel */}
      <ImageManager
        currentImage={image}
        onImageUpdate={(newImage) => onImageUpdate?.(slide.id, newImage)}
        isOpen={isEditMode}
        onClose={() => setIsEditMode(false)}
      />
    </>
  );
}
