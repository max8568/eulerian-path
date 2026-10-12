// Progress, avatars and play records, kept in this browser's localStorage (SPEC.md §5, §7).
// Progress is stored by level number, so regenerating the levels never loses a child's stars.
import { ANIMALS, LAST_LEVEL } from './theme.js';

const KEY = 'yibihua-v1';
const MAX_RECORDS = 2000;
export const MAX_PROFILES = 3;

const newProfile = animal => ({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), animal, cleared: [], skipped: [], records: [] });

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.profiles) && s.profiles.length) return s;
  } catch (e) { /* fall through to a fresh start */ }
  const p = newProfile('🐰');
  return { activeProfile: p.id, sound: true, profiles: [p] };
}

let state = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked: keep playing */ }
}

export const profiles = () => state.profiles;
export const profile = () => state.profiles.find(p => p.id === state.activeProfile) || state.profiles[0];
export function setActiveProfile(id) { state.activeProfile = id; save(); }

export const soundOn = () => state.sound !== false;
export function setSound(on) { state.sound = on; save(); }

export const isCleared = level => profile().cleared.includes(level);
export const isSkipped = level => profile().skipped.includes(level);
const furthest = p => Math.max(0, ...p.cleared, ...p.skipped);
export const isUnlocked = level => level <= furthest(profile()) + 1;
// the unlocked level that is neither cleared nor skipped; null once all 1000 are done
export function newestLevel(p = profile()) {
  const n = furthest(p) + 1;
  return n <= LAST_LEVEL ? n : null;
}

export function markCleared(level) {
  const p = profile();
  if (!p.cleared.includes(level)) p.cleared.push(level);
  p.skipped = p.skipped.filter(l => l !== level);
  save();
}
export function markSkipped(level) {
  const p = profile();
  if (!p.cleared.includes(level) && !p.skipped.includes(level)) p.skipped.push(level);
  save();
}
export function addRecord(rec) {
  const p = profile();
  p.records.push(rec);
  if (p.records.length > MAX_RECORDS) p.records.splice(0, p.records.length - MAX_RECORDS);
  save();
}

export function addProfile(animal) {
  if (state.profiles.length >= MAX_PROFILES) return null;
  const p = newProfile(animal);
  state.profiles.push(p); save();
  return p;
}
export function removeProfile(id) {
  if (state.profiles.length <= 1) return;
  state.profiles = state.profiles.filter(p => p.id !== id);
  if (!state.profiles.some(p => p.id === state.activeProfile)) state.activeProfile = state.profiles[0].id;
  save();
}
export function setAnimal(id, animal) {
  const p = state.profiles.find(x => x.id === id);
  if (p && ANIMALS.includes(animal)) { p.animal = animal; save(); }
}
export function resetProgress(id = state.activeProfile) {
  const p = state.profiles.find(x => x.id === id);
  if (p) { p.cleared = []; p.skipped = []; save(); }
}
