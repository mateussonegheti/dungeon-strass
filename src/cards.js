export const MAX_HAND = 4;

// kind: attack | heal | buff | debuff ; stat: stat that scales the card
export const CARDS = {
  strike: { name: 'Golpe', kind: 'attack', power: 6, stat: 'str', range: 1 },
  shield_bash: { name: 'Escudada', kind: 'attack', power: 4, stat: 'str', range: 1, debuff: { stat: 'dex', amount: -2, turns: 2 } },
  power_blow: { name: 'Golpe Poderoso', kind: 'attack', power: 11, stat: 'str', range: 1 },
  guard: { name: 'Guarda', kind: 'buff', buff: { stat: 'armor', amount: 4, turns: 3 } },
  rally: { name: 'Fôlego', kind: 'heal', power: 8 },
  fireball: { name: 'Bola de Fogo', kind: 'attack', power: 9, stat: 'int', range: 4 },
  lightning: { name: 'Relâmpago', kind: 'attack', power: 8, stat: 'int', range: 4 },
  magic_arrow: { name: 'Flecha Mágica', kind: 'attack', power: 5, stat: 'int', range: 5 },
  heal: { name: 'Curar', kind: 'heal', power: 12 },
  weaken: { name: 'Enfraquecer', kind: 'debuff', debuff: { stat: 'str', amount: -3, turns: 3 }, range: 5 },
  arrow: { name: 'Flecha', kind: 'attack', power: 5, stat: 'dex', range: 5 },
  power_shot: { name: 'Tiro Certeiro', kind: 'attack', power: 10, stat: 'dex', range: 5 },
  poison_arrow: { name: 'Flecha Envenenada', kind: 'attack', power: 4, stat: 'dex', range: 5, debuff: { stat: 'armor', amount: -2, turns: 3 } },
  dodge: { name: 'Esquiva', kind: 'buff', buff: { stat: 'armor', amount: 3, turns: 3 } },
  stab: { name: 'Facada', kind: 'attack', power: 5, stat: 'dex', range: 1 },
  backstab: { name: 'Golpe Baixo', kind: 'attack', power: 10, stat: 'dex', range: 1 },
  poison_blade: { name: 'Lâmina Envenenada', kind: 'attack', power: 4, stat: 'dex', range: 1, debuff: { stat: 'str', amount: -2, turns: 3 } },
};

export function shuffle(arr, rnd = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Starts with 4 cards in hand.
export function createDeck(cardIds, rnd = Math.random) {
  const d = { draw: shuffle(cardIds, rnd), hand: [], discard: [], rnd };
  while (d.hand.length < MAX_HAND && drawCard(d)) { /* fill */ }
  return d;
}

// Draw one card; never exceeds MAX_HAND. Returns the card id or null.
export function drawCard(d) {
  if (d.hand.length >= MAX_HAND) return null;
  if (!d.draw.length) { d.draw = shuffle(d.discard, d.rnd); d.discard = []; }
  if (!d.draw.length) return null;
  const c = d.draw.pop();
  d.hand.push(c);
  return c;
}

export function playCard(d, index) {
  if (index < 0 || index >= d.hand.length) return null;
  const [c] = d.hand.splice(index, 1);
  d.discard.push(c);
  return c;
}
