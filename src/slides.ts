import slidesMarkdown from './slides.md?raw';
import { parseSlides } from './parseSlides';

export interface Slide {
  id: number;
  chapter: string;
  headline: string;
  body?: string[];
  notes?: string;
  type: 'standard' | 'hero' | 'data' | 'dark';
  layout: 'center' | 'grid-2' | 'grid-3' | 'stack';
  accent: boolean;
  image?: string;
  imageAlt?: string;
}

export const slides: Slide[] = parseSlides(slidesMarkdown);
