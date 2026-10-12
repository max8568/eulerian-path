// The difficulty plan from curve.json: the target for any level and the rules of each chapter.
import { readFileSync } from 'node:fs';

export const CURVE = JSON.parse(readFileSync(new URL('./curve.json', import.meta.url), 'utf8'));
export const LEVELS_PER_CHAPTER = 50, CHAPTERS = 20;

const inRange = (list, ch) => list.find(r => ch >= r.fromChapter && ch <= r.toChapter);

// target average lines drawn until cleared; grows geometrically inside a chapter,
// from (previous chapter end × startFactor) to this chapter's end
export function target(level) {
  const c = Math.ceil(level / LEVELS_PER_CHAPTER) - 1, k = level - c * LEVELS_PER_CHAPTER;
  const start = c ? CURVE.chapterEnd[c - 1] * CURVE.chapterStartFactor : CURVE.firstLevelTarget, end = CURVE.chapterEnd[c];
  return start * Math.pow(end / start, k / LEVELS_PER_CHAPTER);
}

export const isShapeLevel = level => level % CURVE.shapeLevels.every === 0;

// What a generated level must look like. k is the level's position inside its chapter (1–50).
// The fixed positions below spread each rule evenly over the chapter (see SPEC.md §6).
export function rulesFor(level) {
  const chapter = Math.ceil(level / LEVELS_PER_CHAPTER), k = level - (chapter - 1) * LEVELS_PER_CHAPTER;
  const grid = inRange(CURVE.grid, chapter).size;
  const share = inRange(CURVE.methodShare, chapter);
  const method = share.trail === 0 ? 'cycles' : [2, 5, 8].includes(k % 10) ? 'cycles' : 'trail';
  const oddShare = inRange(CURVE.twoOddPointsMaxShare, chapter).share;
  const odd = oddShare === 0 ? 'none' : oddShare >= 1 ? 'any' : (k % 5 === 0 ? 'two' : 'none');
  const cx = CURVE.crossings;
  const introCrossing = chapter === cx.fromChapter && k % 10 === 3;
  const crossing = chapter < cx.fromChapter ? 'none' : introCrossing ? 'some' : 'any';
  const t = target(level) * (introCrossing ? cx.firstLevelsTargetFactor : 1);
  return { chapter, k, grid, method, odd, crossing, target: t };
}
