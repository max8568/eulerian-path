// Chapter themes, colours and avatar animals (SPEC.md §4).
export const THEMES = [
  ['Shapes', '🔺'], ['Animals', '🐸'], ['At Home', '🏠'], ['Nature', '🌳'], ['Vehicles', '🚗'],
  ['Ocean', '🐳'], ['Food', '🍎'], ['Bugs', '🐞'], ['Buildings', '🏰'], ['Music', '🎸'],
  ['Sports', '⚽'], ['Weather', '🌈'], ['Dinosaurs', '🦕'], ['Farm', '🐮'], ['Clothes', '👕'],
  ['Kitchen', '🍳'], ['Holidays', '🎄'], ['Space', '🚀'], ['Theme Park', '🎡'], ['Mixed', '👑'],
];

// chapter is 1-based
export const chapterColor = chapter => `hsl(${((chapter - 1) * 37 + 8) % 360} 62% 52%)`;
export const chapterName = chapter => THEMES[chapter - 1][0];
export const chapterEmoji = chapter => THEMES[chapter - 1][1];

export const ANIMALS = ['🐶', '🐱', '🐰', '🐻', '🐼', '🦊', '🐯', '🐸', '🐵', '🐧', '🐨', '🦁'];

export const LEVELS_PER_CHAPTER = 50;
export const LAST_LEVEL = 1000;
export const chapterOf = level => Math.ceil(level / LEVELS_PER_CHAPTER);
