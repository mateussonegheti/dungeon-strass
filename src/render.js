import { TILES } from './tiledata.js';
import { MOB_TYPES } from './dungeon.js';

export const TS = 32;
// Optional sprite atlas: window.SPRITES = { 'orc': 'img/orc.png', ... }; falls back to shapes.
const cache = {};
function sprite(key) {
  const src = globalThis.SPRITES?.[key];
  if (!src) return null;
  if (!cache[key]) { cache[key] = new Image(); cache[key].src = src; }
  return cache[key].complete && cache[key].naturalWidth ? cache[key] : null;
}

function drawEntity(ctx, key, x, y, color, label) {
  const img = sprite(key);
  if (img) ctx.drawImage(img, x * TS, y * TS, TS, TS);
  else {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x * TS + TS / 2, y * TS + TS / 2, TS / 2 - 4, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label[0], x * TS + TS / 2, y * TS + TS / 2 + 3);
  }
}

export function drawLevel(ctx, lvl, player) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let y = 0; y < lvl.height; y++) for (let x = 0; x < lvl.width; x++) {
    const id = lvl.tiles[y][x], t = TILES[id];
    const img = sprite('tile' + id);
    if (img) ctx.drawImage(img, x * TS, y * TS, TS, TS);
    else { ctx.fillStyle = t.color; ctx.fillRect(x * TS, y * TS, TS - 1, TS - 1); }
  }
  for (const it of lvl.items) drawEntity(ctx, it.kind, it.x, it.y, '#ffd700', it.name);
  for (const m of lvl.mobs) if (m.hp > 0) {
    drawEntity(ctx, m.type, m.x, m.y, MOB_TYPES[m.type].color, m.name);
    ctx.fillStyle = '#c00'; ctx.fillRect(m.x * TS, m.y * TS - 3, TS * m.hp / m.maxHp, 3);
  }
  if (player) drawEntity(ctx, player.cls, player.x, player.y, player.color || '#fff', player.name);
}
