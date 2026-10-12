// Xylophone-like sounds made in the browser — no sound files (SPEC.md §4).
import { soundOn } from './store.js';

let ac = null;
function tone(freq, at, dur, vol = 0.25) {
  if (!soundOn()) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t); o.stop(t + dur + 0.02);
  } catch (e) { /* no audio on this device */ }
}

// pentatonic scale C D E G A, starting at C5 and going up
const PENTA = [0, 2, 4, 7, 9];
const note = step => 523.25 * Math.pow(2, (PENTA[step % 5] + 12 * Math.floor(step / 5)) / 12);

export const sounds = {
  // n = how many lines were already drawn in this level before this one
  line: n => tone(note(Math.min(n, 9)), 0, 0.25),
  win: () => [0, 2, 4, 5, 7].forEach((s, i) => tone(note(s), i * 0.11, i === 4 ? 0.6 : 0.2)),
  hint: () => { tone(1318.5, 0, 0.35, 0.15); tone(1760, 0.15, 0.45, 0.15); },
  stuck: () => { tone(220, 0, 0.22, 0.2); tone(174.6, 0.18, 0.35, 0.2); },
};
