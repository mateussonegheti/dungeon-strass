import { CLASSES, createCharacter } from './classes.js';
import { CARDS, createDeck, drawCard, playCard } from './cards.js';
import { rollD20, resolveCard, mobAttack, tickBuffs } from './combat.js';
import { createLevel1, canWalk, mobAt, mobStep, chebyshev, tryCaptureRune, deserializeLevel } from './dungeon.js';
import { drawLevel, TS } from './render.js';
import { mountEditor } from './editor.js';

const $ = id => document.getElementById(id);
const canvas = $('map'), ctx = canvas.getContext('2d');
let level, player, deck, busy = false, target = null;

const log = t => { const l = $('log'); l.textContent = t + '\n' + l.textContent; };

function start(cls, admin) {
  level = createLevel1(); player = createCharacter(admin ? 'Admin' : 'Herói', cls, admin);
  player.color = CLASSES[cls].color; player.x = level.start.x; player.y = level.start.y;
  deck = createDeck(CLASSES[cls].deck);
  canvas.width = level.width * TS; canvas.height = level.height * TS;
  $('menu').hidden = true; $('game').hidden = false; $('editor').hidden = !admin;
  if (admin) mountEditor($('editor'), canvas, () => level, l => (level = l), redraw);
  redraw(); log('Você entra no calabouço.');
}

function redraw() {
  drawLevel(ctx, level, player);
  $('stats').textContent = `${player.name} (${player.cls})  HP ${player.hp}/${player.maxHp}  STR ${player.str} DEX ${player.dex} INT ${player.int}  Armor ${player.armor}` +
    (target ? `  | Alvo: ${target.name} ${target.hp}/${target.maxHp}` : '') + (level.runeCaptured ? '  | RUNA CAPTURADA!' : '');
  const h = $('hand'); h.innerHTML = '';
  deck.hand.forEach((id, i) => {
    const b = document.createElement('button'); b.className = 'card'; b.textContent = CARDS[id].name;
    b.onclick = () => useCard(i); h.appendChild(b);
  });
  $('draw').disabled = deck.hand.length >= 4;
}

// Animated, visible d20 roll.
function rollDice() {
  return new Promise(res => {
    const el = $('dice'); el.hidden = false; el.classList.add('rolling');
    const final = rollD20(); let n = 0;
    const t = setInterval(() => {
      el.textContent = 1 + Math.floor(Math.random() * 20);
      if (++n > 12) { clearInterval(t); el.textContent = final; el.classList.remove('rolling'); setTimeout(() => res(final), 500); }
    }, 60);
  });
}

function nearestMob(range) {
  return level.mobs.filter(m => m.hp > 0 && chebyshev(m, player) <= range).sort((a, b) => chebyshev(a, player) - chebyshev(b, player))[0];
}

async function useCard(i) {
  if (busy) return; const card = CARDS[deck.hand[i]];
  const mob = card.kind === 'attack' || card.kind === 'debuff' ? nearestMob(card.range) : null;
  if ((card.kind === 'attack' || card.kind === 'debuff') && !mob) return log('Nenhum alvo ao alcance.');
  busy = true; target = mob;
  const roll = await rollDice(); playCard(deck, i);
  const r = resolveCard(player, mob || player, card, roll);
  log(`${card.name}: d20=${roll} dano ${r.damage} cura ${r.heal}`);
  if (mob && mob.hp <= 0) log(`${mob.name} derrotado!`);
  await endTurn(); busy = false;
}

async function endTurn() {
  tickBuffs(player);
  for (const m of level.mobs.filter(m => m.hp > 0)) {
    if (chebyshev(m, player) <= 1) {
      const roll = await rollDice(), r = mobAttack(m, player, roll);
      log(`${m.name} ataca: d20=${roll} dano ${r.damage}`);
      if (player.hp <= 0) { log('Você morreu. Recarregue a página.'); busy = true; break; }
    } else mobStep(level, m, player);
    tickBuffs(m);
  }
  redraw();
}

addEventListener('keydown', async e => {
  const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
  if (!d || busy || !player) return; e.preventDefault();
  const nx = player.x + d[0], ny = player.y + d[1];
  if (!canWalk(level, nx, ny)) return;
  busy = true; player.x = nx; player.y = ny;
  if (tryCaptureRune(level, player)) log('Runa capturada! A próxima fase está liberada.');
  await endTurn(); busy = false;
});

$('draw').onclick = () => { if (drawCard(deck)) redraw(); };
for (const c of Object.keys(CLASSES)) {
  const b = document.createElement('button'); b.textContent = c; b.onclick = () => start(c, $('admin').checked); $('classes').appendChild(b);
}
