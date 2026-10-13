// Screens and navigation: pick an avatar → chapters → levels → game, plus the parent settings (SPEC.md §3).
import { gameScreen } from './game.js';
import * as store from './store.js';
import { chapterColor, chapterName, chapterEmoji, ANIMALS, LEVELS_PER_CHAPTER, LAST_LEVEL, THEMES } from './theme.js';
import { ICONS } from './icons.js';
import { VERSION } from './version.js';

const root = document.getElementById('app');
// the version in the bottom-left corner, so it is easy to see whether the device has the latest one
document.body.insertAdjacentHTML('beforeend', `<div class="version">${VERSION === 'dev' ? 'dev' : 'v' + VERSION}</div>`);
let LEVELS = null, cleanup = null;

const nav = {
  play(level) {
    if (level < 1 || level > LAST_LEVEL || !store.isUnlocked(level)) return nav.chapters();
    show(() => gameScreen(root, LEVELS[level - 1], nav));
  },
  levels: chapter => show(() => levelsScreen(chapter)),
  chapters: () => show(chaptersScreen),
  avatars: () => show(avatarsScreen),
  // opening the game: straight into the newest level, or the chapters once everything is done
  start() { const n = store.newestLevel(); n ? nav.play(n) : nav.chapters(); },
};
function show(build) {
  if (cleanup) cleanup();
  cleanup = null; window.__game = undefined;
  const c = build();
  if (typeof c === 'function') cleanup = c;
  window.scrollTo(0, 0);
}

const firstLevel = chapter => (chapter - 1) * LEVELS_PER_CHAPTER + 1;
const starsIn = chapter => store.profile().cleared.filter(l => l >= firstLevel(chapter) && l < firstLevel(chapter) + LEVELS_PER_CHAPTER).length;

// ---- avatars: only shown when there is more than one
function avatarsScreen() {
  root.innerHTML = `
    <div class="screen menu avatars-screen">
      <div class="avatar-pick">${store.profiles().map(p => `<button class="avatar-big" data-id="${p.id}" aria-label="${p.animal}">${p.animal}</button>`).join('')}</div>
    </div>`;
  root.querySelectorAll('.avatar-big').forEach(b => b.onclick = () => { store.setActiveProfile(b.dataset.id); nav.start(); });
}

// ---- chapters
function chaptersScreen() {
  const many = store.profiles().length > 1;
  root.innerHTML = `
    <div class="screen menu">
      <header class="m-top">
        <button class="round avatar-btn" data-act="avatar" aria-label="Switch player" ${many ? '' : 'disabled'}>${store.profile().animal}</button>
        <h1>eulerian-path</h1>
        <button class="round" data-act="parent" aria-label="Parent settings">${ICONS.gear}</button>
      </header>
      <div class="chapters">${THEMES.map((_, i) => {
        const ch = i + 1, open = store.isUnlocked(firstLevel(ch));
        return `<button class="chapter${open ? '' : ' locked'}" data-ch="${ch}" style="--c:${chapterColor(ch)}" ${open ? '' : 'disabled'} aria-label="Chapter ${ch} ${chapterName(ch)}">
          <span class="emo">${open ? chapterEmoji(ch) : ICONS.lock}</span>
          <span class="ch-name">${ch}. ${chapterName(ch)}</span>
          <span class="ch-stars">★ ${starsIn(ch)}/${LEVELS_PER_CHAPTER}</span>
        </button>`;
      }).join('')}</div>
    </div>`;
  root.querySelector('[data-act="avatar"]').onclick = () => many && nav.avatars();
  root.querySelector('[data-act="parent"]').onclick = () => parentPanel(() => nav.chapters());
  root.querySelectorAll('.chapter:not(.locked)').forEach(b => b.onclick = () => nav.levels(+b.dataset.ch));
}

// a small drawing of the level's figure, so the level can be told apart by its picture;
// like the game, it is centred on the figure's own extent (curves included) and fills the space
function thumb(fig) {
  const xs = [], ys = [];
  const add = ([x, y]) => { xs.push(x); ys.push(y); };
  fig.pts.forEach(add);
  const d = fig.edges.map(([a, b, bulge = 0]) => {
    const A = fig.pts[a], B = fig.pts[b];
    if (!bulge) return `M${A}L${B}`;
    const C = [(A[0] + B[0]) / 2 - (B[1] - A[1]) * bulge, (A[1] + B[1]) / 2 + (B[0] - A[0]) * bulge];
    for (let i = 1; i < 8; i++) { const t = i / 8, u = 1 - t; add([u*u*A[0] + 2*u*t*C[0] + t*t*B[0], u*u*A[1] + 2*u*t*C[1] + t*t*B[1]]); }
    return `M${A}Q${C} ${B}`;
  }).join('');
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const side = Math.max(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return `<svg class="thumb" viewBox="${cx - side / 2} ${cy - side / 2} ${side} ${side}" aria-hidden="true"><path d="${d}"/></svg>`;
}

// ---- levels of one chapter: 5 columns × 10 rows
function levelsScreen(chapter) {
  const first = firstLevel(chapter), newest = store.newestLevel();
  const cells = Array.from({ length: LEVELS_PER_CHAPTER }, (_, i) => {
    const l = first + i;
    const state = store.isCleared(l) ? 'cleared' : store.isSkipped(l) ? 'skipped' : l === newest ? 'newest' : store.isUnlocked(l) ? 'open' : 'locked';
    const mark = state === 'cleared' ? '★' : state === 'skipped' ? '☆' : state === 'locked' ? ICONS.lock : '';
    return `<button class="cell ${state}" data-level="${l}" ${state === 'locked' ? 'disabled' : ''} aria-label="Level ${l}">${thumb(LEVELS[l - 1])}<span class="num">${l}</span><span class="mark">${mark}</span></button>`;
  }).join('');
  root.innerHTML = `
    <div class="screen menu" style="--chapter:${chapterColor(chapter)}">
      <header class="m-top">
        <button class="round" data-act="back" aria-label="Back to chapters">${ICONS.back}</button>
        <h1><span class="chip"><span class="emo">${chapterEmoji(chapter)}</span>${chapterName(chapter)}</span></h1>
        <span class="round-space"></span>
      </header>
      <div class="cells">${cells}</div>
    </div>`;
  root.querySelector('[data-act="back"]').onclick = () => nav.chapters();
  root.querySelectorAll('.cell:not(.locked)').forEach(b => b.onclick = () => nav.play(+b.dataset.level));
  root.querySelector('.cell.newest')?.scrollIntoView({ block: 'center' });
}

// ---- parent settings
function parentPanel(onClose) {
  const panel = document.createElement('div');
  panel.className = 'panel-back';
  document.body.appendChild(panel);
  let picking = null; // profile id whose animal is being changed, or 'new'

  function render() {
    const ps = store.profiles(), active = store.profile();
    const recs = active.records.slice(-40).reverse();
    panel.innerHTML = `
      <div class="panel" role="dialog" aria-label="家長設定">
        <h2>家長設定</h2>
        <section>
          <h3>頭像（最多 ${store.MAX_PROFILES} 個，各有自己的進度）</h3>
          <div class="profiles">${ps.map(p => `
            <div class="profile${p.id === active.id ? ' active' : ''}">
              <button class="animal" data-pick="${p.id}" aria-label="換動物">${p.animal}</button>
              <span>${p.cleared.length} 顆星${p.id === active.id ? '・目前' : ''}</span>
              ${p.id !== active.id ? `<button class="text" data-use="${p.id}">換成這個</button>` : ''}
              ${ps.length > 1 ? `<button class="text danger" data-remove="${p.id}">刪除</button>` : ''}
            </div>`).join('')}
            ${ps.length < store.MAX_PROFILES ? '<button class="text" data-pick="new">＋ 新增頭像</button>' : ''}
          </div>
          ${picking ? `<div class="animals">${ANIMALS.map(a => `<button class="animal" data-animal="${a}">${a}</button>`).join('')}</div>` : ''}
        </section>
        <section class="row">
          <h3>聲音</h3>
          <button class="toggle" data-act="sound" aria-pressed="${store.soundOn()}">${store.soundOn() ? '開' : '關'}</button>
        </section>
        <section>
          <h3>重設 ${active.animal} 的進度</h3>
          <button class="hold danger" data-act="reset"><span class="fill"></span><span class="label">按住 2 秒</span></button>
        </section>
        <section>
          <h3>試玩紀錄（${active.animal}，最近 ${recs.length} 筆，共 ${active.records.length} 筆）</h3>
          <button class="text" data-act="copy">複製全部紀錄</button>
          <span class="copied" hidden>已複製</span>
          <textarea class="copy-fallback" hidden readonly></textarea>
          <div class="table-wrap"><table>
            <thead><tr><th>關卡</th><th>結果</th><th>秒</th><th>退一步</th><th>重來</th><th>提示</th><th>選對起點</th></tr></thead>
            <tbody>${recs.map(r => `<tr><td>${r.level}</td><td>${{ cleared: '過關', skipped: '跳過', left: '離開' }[r.result]}</td><td>${r.seconds}</td><td>${r.undo}</td><td>${r.restart}</td><td>${r.hint}</td><td>${r.goodStarts}/${r.starts}</td></tr>`).join('') || '<tr><td colspan="7">還沒有紀錄</td></tr>'}</tbody>
          </table></div>
        </section>
        <button class="big" data-act="close">好了</button>
      </div>`;
  }
  render();

  panel.addEventListener('click', ev => {
    const t = ev.target.closest('button');
    if (!t) return;
    if (t.dataset.pick) { picking = picking === t.dataset.pick ? null : t.dataset.pick; render(); return; }
    if (t.dataset.animal) {
      if (picking === 'new') store.addProfile(t.dataset.animal); else store.setAnimal(picking, t.dataset.animal);
      picking = null; render(); return;
    }
    if (t.dataset.use) { store.setActiveProfile(t.dataset.use); render(); return; }
    if (t.dataset.remove) { store.removeProfile(t.dataset.remove); render(); return; }
    const act = t.dataset.act;
    if (act === 'sound') { store.setSound(!store.soundOn()); render(); }
    else if (act === 'copy') copyRecords();
    else if (act === 'close') { panel.remove(); onClose(); }
  });

  // reset only after holding the button for 2 seconds
  let holdTimer = null;
  panel.addEventListener('pointerdown', ev => {
    const b = ev.target.closest('[data-act="reset"]');
    if (!b) return;
    b.classList.add('holding');
    holdTimer = setTimeout(() => { store.resetProgress(); render(); }, 2000);
  });
  const cancelHold = () => { clearTimeout(holdTimer); panel.querySelector('[data-act="reset"]')?.classList.remove('holding'); };
  panel.addEventListener('pointerup', cancelHold);
  panel.addEventListener('pointerleave', cancelHold);
  panel.addEventListener('pointercancel', cancelHold);

  function copyRecords() {
    const p = store.profile();
    const text = JSON.stringify({ animal: p.animal, exportedAt: new Date().toISOString(), records: p.records });
    const ok = () => { panel.querySelector('.copied').hidden = false; };
    const fallback = () => { const ta = panel.querySelector('.copy-fallback'); ta.hidden = false; ta.value = text; ta.select(); };
    try { navigator.clipboard.writeText(text).then(ok, fallback); } catch (e) { fallback(); }
  }
}

// ---- boot
(async () => {
  root.innerHTML = '<div class="screen loading">eulerian-path</div>';
  try {
    LEVELS = await (await fetch('levels.json')).json();
  } catch (e) {
    root.innerHTML = '<div class="screen loading">Could not load the levels. Connect to the internet and open the game again.</div>';
    return;
  }
  window.__app = { nav, store, levels: LEVELS };
  store.profiles().length > 1 ? nav.avatars() : nav.start();
})();

// ?nosw skips the offline copy, so a page under development always loads the latest files
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !location.search.includes('nosw')) {
  // a new version took over while this page was opening: reload once so the new files are used now
  if (navigator.serviceWorker.controller) {
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
  }
  navigator.serviceWorker.register('sw.js').catch(() => { /* still playable online */ });
}
