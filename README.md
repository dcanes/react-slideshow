# Cinematic React Presentation System

A high-end, broadcast-quality presentation engine built with React, TypeScript, and Framer Motion. Designed for maximum legibility on Zoom and a premium aesthetic inspired by Apple Keynote and OpenAI launch events.

## ✨ Key Features

- **Cinematic Aesthetic**: Radial-gradient "stage" backgrounds, glassmorphic UI, and gold (#d4af37) accents.
- **Broadcast Legibility**: Optimized for Zoom with oversized typography (text-7xl+ headlines) and a dynamic "Smart Tile" system.
- **Interactive Tools**:
  - **'B' (Blur)**: Instantly soften the background to focus on the speaker.
  - **'W' (Whiteboard)**: Toggle a pure white screen for verbal deep-dives.
  - **'S' (Spotlight)**: A mouse-following radial mask to point at specific data.
  - **'L' (Highlighter)**: Cycle through bullet points/tiles with a gold glow.
  - **'C' (Confetti)**: Trigger a high-end gold/white celebratory burst.
- **Image Deep-Dive**: Images are hidden behind a "View Image" button and spring open into a full-screen high-res modal.
- **Asset Management**: Integrated image uploader supporting Drag & Drop, Clipboard Paste, and URL input.
- **Markdown Driven**: The entire presentation is driven by a single `slides.md` file.
- **Robust Persistence**: Uses IndexedDB for high-capacity local storage of image assets.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/dcanes/react-slideshow.git
   cd react-slideshow
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` / `Space` | Next Slide |
| `←` | Previous Slide |
| `B` | Toggle Blur Mode |
| `W` | Toggle Whiteboard Mode |
| `S` | Toggle Spotlight Mode |
| `L` | Cycle Tile Highlight |
| `C` | Trigger Confetti |
| `Z` | Toggle Zoom Mode (+20% font size) |

## 🛠 Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: Plain CSS (Modern Flexbox/Grid)
- **Database**: IndexedDB (via custom utility)
- **Effects**: [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti)

## 📝 Editing Content

Edit `src/slides.md` to update your presentation. The app uses a custom parser to convert standard Markdown into cinematic slides. Use the **Sync** button in the app to export your changes (including uploaded images) back to Markdown.

---
Designed for authoritative, empowering, and high-impact presentations.
