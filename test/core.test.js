import test from 'node:test';
import assert from 'node:assert/strict';
import { createCharacter, CLASSES } from '../src/classes.js';
import { createDeck, drawCard, playCard, MAX_HAND, CARDS } from '../src/cards.js';
import { calcDamage, resolveCard, tickBuffs, stat } from '../src/combat.js';
import { createLevel1, canWalk, tryCaptureRune, mobAt, serializeLevel, deserializeLevel } from '../src/dungeon.js';

test('4 classes with valid card decks', () => {
  assert.deepEqual(Object.keys(CLASSES), ['Guerreiro', 'Mago', 'Arqueiro', 'Tief']);
  for (const c of Object.values(CLASSES)) for (const id of c.deck) assert.ok(CARDS[id], id);
  assert.ok(createCharacter('a', 'Guerreiro').equipment.includes('platemail'));
  assert.ok(createCharacter('a', 'Arqueiro').equipment.includes('bow'));
});

test('hand starts with 4 and never exceeds 4', () => {
  const d = createDeck(CLASSES.Mago.deck);
  assert.equal(d.hand.length, 4);
  assert.equal(drawCard(d), null);
  playCard(d, 0);
  assert.ok(drawCard(d));
  assert.equal(d.hand.length, MAX_HAND);
});

test('damage depends on roll, stats and buffs', () => {
  const w = createCharacter('w', 'Guerreiro'), m = createCharacter('m', 'Mago');
  const card = CARDS.strike;
  assert.equal(calcDamage(w, m, card, 1), 0);
  assert.ok(calcDamage(w, m, card, 20) > calcDamage(w, m, card, 10));
  const before = calcDamage(w, m, card, 10);
  w.buffs.push({ stat: 'str', amount: 5, turns: 2 });
  assert.ok(calcDamage(w, m, card, 10) > before);
  tickBuffs(w); tickBuffs(w);
  assert.equal(stat(w, 'str'), 10);
  resolveCard(w, m, CARDS.shield_bash, 15);
  assert.ok(m.hp < m.maxHp);
});

test('dungeon: rune only capturable after boss dies', () => {
  const lvl = createLevel1();
  assert.equal(lvl.rooms.length, 5);
  assert.ok(canWalk(lvl, lvl.start.x, lvl.start.y));
  const rune = lvl.items[0], p = { x: rune.x, y: rune.y };
  assert.equal(tryCaptureRune(lvl, p), false);
  lvl.mobs.find(m => m.boss).hp = 0;
  assert.equal(tryCaptureRune(lvl, p), true);
  assert.ok(lvl.runeCaptured);
  assert.ok(!mobAt(lvl, 51, 4));
  assert.equal(deserializeLevel(serializeLevel(lvl)).name, lvl.name);
});
