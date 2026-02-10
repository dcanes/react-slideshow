import { Slide } from './slides';

export function parseSlides(markdown: string): Slide[] {
  const slides: Slide[] = [];
  const slideSections = markdown.split(/\n---\n/).filter(section => section.trim());

  slideSections.forEach((section, index) => {
    const slide: Partial<Slide> = {
      id: index + 1,
      kind: 'default',
    };

    const lines = section.split('\n');
    let inBullets = false;
    const bullets: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Extract title from first # header
      if (line.startsWith('# ') && !slide.title) {
        slide.title = line.substring(2).trim();
        continue;
      }

      // Extract metadata fields
      if (line.startsWith('Chapter:')) {
        slide.chapter = line.substring(8).trim();
        continue;
      }

      if (line.startsWith('Kind:')) {
        const kindValue = line.substring(5).trim();
        slide.kind = (kindValue === 'lossAversion' ? 'lossAversion' : 'default') as 'default' | 'lossAversion';
        continue;
      }

      if (line.startsWith('Subtitle:')) {
        slide.subtitle = line.substring(9).trim();
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
      if (line.toLowerCase() === 'bullets:') {
        inBullets = true;
        continue;
      }

      if (inBullets) {
        // Check if we hit another metadata field (end of bullets)
        if (line.match(/^(Chapter|Kind|Subtitle|Notes|Image|ImageAlt):/i)) {
          inBullets = false;
          i--; // Reprocess this line
          continue;
        }

        // Extract bullet point (remove leading - or *)
        const bulletMatch = line.match(/^[-*]\s+(.+)$/);
        if (bulletMatch) {
          bullets.push(bulletMatch[1]);
        } else if (line.trim()) {
          // If it's not a bullet marker but has content, treat as bullet
          bullets.push(line);
        }
      }
    }

    if (bullets.length > 0) {
      slide.bullets = bullets;
    }

    // Validate required fields
    if (!slide.title || !slide.chapter) {
      console.warn(`Slide ${index + 1} is missing required fields (title or chapter)`);
      return;
    }

    slides.push(slide as Slide);
  });

  return slides;
}
