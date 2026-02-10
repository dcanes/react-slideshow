import { Slide } from './slides';

export function parseSlides(markdown: string): Slide[] {
  const slides: Slide[] = [];
  const slideSections = markdown.split(/\r?\n\s*---\s*\r?\n/).filter(section => section.trim());

  slideSections.forEach((section, index) => {
    const slide: Partial<Slide> = {
      id: index + 1,
      type: 'standard',
      layout: 'center',
      accent: false,
    };

    const lines = section.split(/\r?\n/);
    let inBullets = false;
    const bullets: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      // Extract headline from first # header
      if (line.startsWith('# ') && !slide.headline) {
        slide.headline = line.substring(2).trim();
        continue;
      }

      // Extract metadata fields
      if (line.startsWith('Chapter:')) {
        slide.chapter = line.substring(8).trim();
        continue;
      }

      if (line.startsWith('Type:')) {
        slide.type = line.substring(5).trim() as any;
        continue;
      }

      if (line.startsWith('Layout:')) {
        slide.layout = line.substring(7).trim() as any;
        continue;
      }

      if (line.startsWith('Accent:')) {
        slide.accent = line.substring(7).trim().toLowerCase() === 'true';
        continue;
      }

      if (line.startsWith('Notes:')) {
        slide.notes = line.substring(6).trim();
        continue;
      }

      if (line.startsWith('Image:')) {
        slide.image = line.substring(6).trim();
        continue;
      }

      if (line.startsWith('ImageAlt:')) {
        slide.imageAlt = line.substring(9).trim();
        continue;
      }

      // Handle bullets section
      if (line.toLowerCase() === 'bullets:' || line.toLowerCase() === 'body:') {
        inBullets = true;
        continue;
      }

      if (inBullets) {
        if (line.match(/^(Chapter|Type|Layout|Accent|Notes|Image|ImageAlt):/i)) {
          inBullets = false;
          i--;
          continue;
        }

        const bulletMatch = line.match(/^[-*]\s+(.+)$/);
        if (bulletMatch) {
          bullets.push(bulletMatch[1]);
        } else if (line.trim()) {
          bullets.push(line);
        }
      }
    }

    if (bullets.length > 0) {
      slide.body = bullets;
    }

    if (!slide.headline || !slide.chapter) {
      console.warn(`Slide ${index + 1} is missing required fields (headline or chapter)`);
    } else {
      slides.push(slide as Slide);
    }
  });

  return slides;
}
