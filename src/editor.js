import { TILES } from './tiledata.js';
import { MOB_TYPES, spawnMob, serializeLevel, deserializeLevel } from './dungeon.js';
import { drawLevel, TS } from './render.js';

// Shared editor panel: pick a brush (tile / mob / rune / erase) and paint on the canvas.
// onChange fires after every edit so the game view updates in real time.
export function mountEditor(panel, canvas, getLevel, setLevel, onChange) {
  let brush = { type: 'tile', id: 1 };
  panel.innerHTML = '<h3>Editor</h3><div id="brushes"></div><button id="save">Salvar</button> <button id="load">Carregar</button>';
  const box = panel.querySelector('#brushes');
  const add = (label, b) => {
    const btn = document.createElement('button'); btn.textContent = label; btn.onclick = () => (brush = b); box.appendChild(btn);
  };
  for (const id of Object.keys(TILES)) add('Tile: ' + TILES[id].name, { type: 'tile', id: +id });
  for (const k of Object.keys(MOB_TYPES)) add('Mob: ' + MOB_TYPES[k].name, { type: 'mob', id: k });
  add('Runa', { type: 'rune' }); add('Apagar', { type: 'erase' });
  panel.querySelector('#save').onclick = () => localStorage.setItem('dungeon-strass-level', serializeLevel(getLevel()));
  panel.querySelector('#load').onclick = () => {
    const s = localStorage.getItem('dungeon-strass-level');
    if (s) { setLevel(deserializeLevel(s)); onChange(); }
  };
  canvas.addEventListener('mousedown', e => {
    const r = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) / TS), y = Math.floor((e.clientY - r.top) / TS), lvl = getLevel();
    if (x < 0 || y < 0 || x >= lvl.width || y >= lvl.height) return;
    lvl.mobs = lvl.mobs.filter(m => !(m.x === x && m.y === y));
    lvl.items = lvl.items.filter(i => !(i.x === x && i.y === y));
    if (brush.type === 'tile') lvl.tiles[y][x] = brush.id;
    else if (brush.type === 'mob') lvl.mobs.push(spawnMob(brush.id, x, y));
    else if (brush.type === 'rune') lvl.items.push({ kind: 'rune', x, y, name: 'Runa' });
    onChange();
  });
}
export { drawLevel };
