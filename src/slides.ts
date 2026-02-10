import slidesMarkdown from './slides.md?raw';
import { parseSlides } from './parseSlides';

export interface Slide {
  id: number;
  chapter: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  notes?: string;
  kind?: 'default' | 'lossAversion';
  image?: string;
  imageAlt?: string;
}

export const slides: Slide[] = parseSlides(slidesMarkdown);
