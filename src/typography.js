// Keep Canvas exports and the editor's text selection in the same font.
export function letteringFont(size, style='glam') {
  if(style==='mono') return `400 ${size}px "Courier New", monospace`;
  if(style==='clean') return `500 ${size}px "Bai Jamjuree", sans-serif`;
  return `400 ${size}px "Great Vibes", "Charm", cursive`;
}

export const fontsReady=Promise.allSettled([
  document.fonts.load('48px "Great Vibes"'),
  document.fonts.load('32px "Charm"'),
  document.fonts.load('500 24px "Bai Jamjuree"'),
]);
