import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageManagerProps {
  currentImage?: string;
  onImageUpdate: (newImage: string | undefined) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageManager({ currentImage, onImageUpdate, isOpen, onClose }: ImageManagerProps) {
  const [urlValue, setUrlValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const processImage = useCallback((file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress to JPEG at 0.8 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        onImageUpdate(compressedBase64);
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [onImageUpdate]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    processImage(file);
  }, [processImage]);

  // Paste support
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, handleFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleUrlSubmit = () => {
    const trimmed = urlValue.trim();
    if (trimmed) {
      onImageUpdate(trimmed);
      setUrlValue('');
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleUrlSubmit();
    }
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="image-manager-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            className="image-manager"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="im-header">
              <h4>Image Asset {isProcessing && '(Processing...)'}</h4>
              <button className="im-close" onClick={onClose}>✕</button>
            </div>

            {currentImage && (
              <div className="im-preview">
                <img src={currentImage} alt="Current asset" className="im-preview-img" />
                <button className="im-remove" onClick={() => onImageUpdate(undefined)}>
                  Remove
                </button>
              </div>
            )}

            <div
              className={`im-dropzone ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>{isProcessing ? 'Optimizing...' : 'Drop image, or paste from clipboard'}</span>
            </div>

            <div className="im-url-row">
              <input
                type="text"
                className="im-url-input"
                placeholder="Paste image URL..."
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={handleUrlKeyDown}
              />
              <button className="im-url-btn" onClick={handleUrlSubmit}>
                Load
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
