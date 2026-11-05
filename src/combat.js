export const rollD20 = (rnd = Math.random) => 1 + Math.floor(rnd() * 20);

// Effective stat including buffs/debuffs.
export function stat(ch, name) {
  const base = ch[name] ?? 0;
  return base + (ch.buffs || []).filter(b => b.stat === name).reduce((s, b) => s + b.amount, 0);
}

export function addBuff(ch, b) { ch.buffs.push({ ...b }); }

export function tickBuffs(ch) {
  ch.buffs = (ch.buffs || []).map(b => ({ ...b, turns: b.turns - 1 })).filter(b => b.turns > 0);
}

// Damage from the d20 roll: 1 = fumble, 20 = critical (x2),
// otherwise scales 0.5x..1.45x. Reduced by target armor (min 1 on a hit).
export function calcDamage(attacker, defender, card, roll) {
  if (roll === 1) return 0;
  const raw = card.power + stat(attacker, card.stat);
  let dmg = Math.round(raw * (0.5 + roll / 20));
  if (roll === 20) dmg = raw * 2;
  return Math.max(1, dmg - Math.floor(stat(defender, 'armor') / 2));
}

export function resolveCard(attacker, defender, card, roll) {
  const res = { roll, damage: 0, heal: 0 };
  if (card.kind === 'attack') {
    res.damage = calcDamage(attacker, defender, card, roll);
    defender.hp = Math.max(0, defender.hp - res.damage);
    if (card.debuff && res.damage > 0) addBuff(defender, card.debuff);
  } else if (card.kind === 'heal') {
    res.heal = Math.min(card.power, attacker.maxHp - attacker.hp);
    attacker.hp += res.heal;
  } else if (card.kind === 'buff') addBuff(attacker, card.buff);
  else if (card.kind === 'debuff') addBuff(defender, card.debuff);
  return res;
}

// Mob basic attack uses the same d20 mechanic.
export function mobAttack(mob, target, roll) {
  return resolveCard(mob, target, { kind: 'attack', power: mob.dmg, stat: 'str' }, roll);
}
