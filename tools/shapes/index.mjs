// All shape levels, chapter by chapter. Each file exports CHAPTERS: [{ theme, shapes: [{ name, pts, edges }] }].
import { CHAPTERS as ch01 } from './ch01-05.mjs';
import { CHAPTERS as ch06 } from './ch06-10.mjs';
import { CHAPTERS as ch11 } from './ch11-15.mjs';
import { CHAPTERS as ch16 } from './ch16-20.mjs';

export const SHAPE_CHAPTERS = [...ch01, ...ch06, ...ch11, ...ch16];
