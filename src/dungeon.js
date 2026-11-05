import { isPassable } from './tiledata.js';

export const MOB_TYPES = {
  skeleton: { name: 'Esqueleto', hp: 20, str: 4, dex: 3, int: 0, armor: 2, dmg: 4, color: '#e8e8d0' },
  orc: { name: 'Orc', hp: 30, str: 6, dex: 3, int: 0, armor: 3, dmg: 6, color: '#4a7a3a' },
  lich: { name: 'Lich (Boss)', hp: 70, str: 8, dex: 4, int: 8, armor: 4, dmg: 9, color: '#a03cc8' },
};

// Entrance + 3 rooms + boss room, chained by doors. 56x9 grid.
export function createLevel1() {
  const W = 56, H = 9;
  const tiles = Array.from({ length: H }, () => Array(W).fill(0));
  const rooms = [];
  const carve = (x0, name) => {
    for (let y = 1; y < H - 1; y++) for (let x = x0; x < x0 + 8; x++) tiles[y][x] = 1;
    rooms.push({ name, x: x0, y: 1, w: 8, h: H - 2 });
  };
  ['Entrada', 'Sala 1', 'Sala 2', 'Sala 3', 'Sala do Boss'].forEach((n, i) => {
    carve(i * 11 + 1, n);
    if (i < 4) { for (let x = i * 11 + 9; x < i * 11 + 12; x++) tiles[4][x] = 1; tiles[4][i * 11 + 10] = 3; }
  });
  // walls around floors
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (tiles[y][x] === 0) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (tiles[y + dy]?.[x + dx] && tiles[y + dy][x + dx] !== 2 && tiles[y + dy][x + dx] !== 0) tiles[y][x] = 2;
  }
  const mobs = [
    { type: 'skeleton', x: 15, y: 3 }, { type: 'skeleton', x: 17, y: 6 },
    { type: 'orc', x: 27, y: 3 }, { type: 'skeleton', x: 29, y: 5 },
    { type: 'orc', x: 38, y: 2 }, { type: 'orc', x: 40, y: 6 },
    { type: 'lich', x: 51, y: 4 },
  ].map(m => spawnMob(m.type, m.x, m.y));
  const items = [{ kind: 'rune', x: 53, y: 4, name: 'Runa' }];
  return { name: 'Calabouço 1', width: W, height: H, tiles, rooms, mobs, items, start: { x: 2, y: 4 }, next: 'level2' };
}

export function spawnMob(type, x, y) {
  const t = MOB_TYPES[type];
  return { type, name: t.name, maxHp: t.hp, hp: t.hp, str: t.str, dex: t.dex, int: t.int, armor: t.armor, dmg: t.dmg, buffs: [], x, y, boss: type === 'lich' };
}

export const mobAt = (lvl, x, y) => lvl.mobs.find(m => m.hp > 0 && m.x === x && m.y === y);
export const canWalk = (lvl, x, y) => isPassable(lvl.tiles[y]?.[x] ?? 0) && !mobAt(lvl, x, y);

// Boss defeated + rune captured => next phase unlocked.
export function tryCaptureRune(lvl, player) {
  const i = lvl.items.findIndex(it => it.kind === 'rune' && it.x === player.x && it.y === player.y);
  const bossAlive = lvl.mobs.some(m => m.boss && m.hp > 0);
  if (i < 0 || bossAlive) return false;
  lvl.items.splice(i, 1);
  lvl.runeCaptured = true;
  return true;
}

export const chebyshev = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

// Simple mob AI: step toward player if within 6 tiles and not adjacent.
export function mobStep(lvl, mob, player) {
  if (chebyshev(mob, player) > 6 || chebyshev(mob, player) <= 1) return;
  const sx = Math.sign(player.x - mob.x), sy = Math.sign(player.y - mob.y);
  for (const [dx, dy] of [[sx, sy], [sx, 0], [0, sy]]) {
    const nx = mob.x + dx, ny = mob.y + dy;
    if ((dx || dy) && canWalk(lvl, nx, ny) && !(nx === player.x && ny === player.y)) { mob.x = nx; mob.y = ny; return; }
  }
}

export const serializeLevel = lvl => JSON.stringify(lvl);
export const deserializeLevel = s => JSON.parse(s);
