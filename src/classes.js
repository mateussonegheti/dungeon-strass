// Classes (Ultima Online style): stats + starting equipment. Sprite ids are
// placeholders until the UO art (browseruo2/public) is supplied.
export const CLASSES = {
  Guerreiro: { hp: 60, str: 10, dex: 5, int: 2, armor: 6, equipment: ['platemail', 'longsword', 'heater shield'], color: '#9aa7b5',
    deck: ['strike', 'strike', 'shield_bash', 'power_blow', 'guard', 'rally', 'strike', 'guard'] },
  Mago: { hp: 35, str: 2, dex: 4, int: 11, armor: 1, equipment: ['robe', 'spellbook', 'wizard hat'], color: '#6a5acd',
    deck: ['fireball', 'fireball', 'lightning', 'magic_arrow', 'heal', 'weaken', 'magic_arrow', 'lightning'] },
  Arqueiro: { hp: 42, str: 5, dex: 10, int: 3, armor: 3, equipment: ['studded leather', 'bow', 'quiver'], color: '#3c9d4e',
    deck: ['arrow', 'arrow', 'arrow', 'power_shot', 'dodge', 'poison_arrow', 'arrow', 'dodge'] },
  Tief: { hp: 38, str: 4, dex: 11, int: 4, armor: 2, equipment: ['leather', 'dagger', 'dagger'], color: '#444',
    deck: ['stab', 'stab', 'backstab', 'poison_blade', 'dodge', 'stab', 'backstab', 'dodge'] },
};

export function createCharacter(name, cls, isAdmin = false) {
  const c = CLASSES[cls];
  if (!c) throw new Error(`Classe desconhecida: ${cls}`);
  return { id: 0, name, cls, admin: isAdmin, maxHp: c.hp, hp: c.hp, str: c.str, dex: c.dex, int: c.int,
    armor: c.armor, equipment: [...c.equipment], buffs: [], x: 0, y: 0 };
}
