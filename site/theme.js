// Chapter themes, colours and avatar animals (SPEC.md §4).
export const THEMES = [
  ['形狀', '🔺'], ['動物', '🐸'], ['家裡的東西', '🏠'], ['大自然', '🌳'], ['交通工具', '🚗'],
  ['海洋', '🐳'], ['食物', '🍎'], ['昆蟲', '🐞'], ['建築', '🏰'], ['樂器', '🎸'],
  ['運動', '⚽'], ['天氣', '🌈'], ['恐龍', '🦕'], ['農場', '🐮'], ['衣服', '👕'],
  ['廚房', '🍳'], ['節日', '🎄'], ['太空', '🚀'], ['遊樂園', '🎡'], ['綜合', '👑'],
];

// chapter is 1-based
export const chapterColor = chapter => `hsl(${((chapter - 1) * 37 + 8) % 360} 62% 52%)`;
export const chapterName = chapter => THEMES[chapter - 1][0];
export const chapterEmoji = chapter => THEMES[chapter - 1][1];

export const ANIMALS = ['🐶', '🐱', '🐰', '🐻', '🐼', '🦊', '🐯', '🐸', '🐵', '🐧', '🐨', '🦁'];

export const LEVELS_PER_CHAPTER = 50;
export const LAST_LEVEL = 1000;
export const chapterOf = level => Math.ceil(level / LEVELS_PER_CHAPTER);
