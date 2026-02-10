import { Slide } from '../slides';

export function generateMarkdown(slides: Slide[]): string {
  return slides
    .map((slide) => {
      const parts = [`# ${slide.headline}`, ''];
      
      parts.push(`Chapter: ${slide.chapter}`);
      parts.push(`Type: ${slide.type}`);
      parts.push(`Layout: ${slide.layout}`);
      parts.push(`Accent: ${slide.accent}`);
      
      if (slide.body && slide.body.length > 0) {
        parts.push('Body:');
        slide.body.forEach(item => {
          parts.push(`- ${item}`);
        });
      }
      
      if (slide.image) {
        parts.push(`Image: ${slide.image}`);
        if (slide.imageAlt) {
          parts.push(`ImageAlt: ${slide.imageAlt}`);
        }
      }
      
      if (slide.notes) {
        parts.push(`Notes: ${slide.notes}`);
      }
      
      return parts.join('\n');
    })
    .join('\n\n---\n\n');
}
