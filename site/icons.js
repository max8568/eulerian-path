// Inline SVG icons; they take the button's text colour.
const s = body => `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  undo: s('<path d="M14 10 6 18l8 8"/><path d="M6 18h18a10 10 0 0 1 0 20h-6"/>'),
  restart: s('<path d="M32 20a12 12 0 1 1-4-9"/><path d="M30 4v8h-8"/>'),
  hint: s('<path d="M14 27c0-4-5-6-5-13a11 11 0 0 1 22 0c0 7-5 9-5 13z"/><path d="M15 33h10M17 38h6"/>'),
  grid: s('<rect x="6" y="6" width="11" height="11" rx="2"/><rect x="23" y="6" width="11" height="11" rx="2"/><rect x="6" y="23" width="11" height="11" rx="2"/><rect x="23" y="23" width="11" height="11" rx="2"/>'),
  back: s('<path d="M24 8 12 20l12 12"/>'),
  skip: '<svg viewBox="0 0 28 28" fill="currentColor" aria-hidden="true"><path d="M4 5l10 9-10 9zM14 5l10 9-10 9z"/></svg>',
  gear: s('<circle cx="20" cy="20" r="5"/><path d="M20 4v5M20 31v5M4 20h5M31 20h5M8.7 8.7l3.5 3.5M27.8 27.8l3.5 3.5M8.7 31.3l3.5-3.5M27.8 12.2l3.5-3.5"/>'),
  lock: s('<rect x="9" y="18" width="22" height="16" rx="3"/><path d="M14 18v-5a6 6 0 0 1 12 0v5"/>'),
  star: '<svg class="star" viewBox="0 0 100 100" aria-label="過關"><path d="M50 6l13 28 30 3-23 20 7 30-27-16-27 16 7-30L7 37l30-3z" fill="#FFC93C" stroke="#4A3B52" stroke-width="4" stroke-linejoin="round"/></svg>',
};
