// UO-style TileData flags (subset). Real tiledata.mul can be converted into this format.
export const FLAGS = { Impassable: 1, Wall: 2, Door: 4, Surface: 8, Wet: 16, Bridge: 32 };

export const TILES = {
  0: { name: 'void', flags: FLAGS.Impassable, color: '#000' },
  1: { name: 'stone floor', flags: FLAGS.Surface, color: '#6b6b6b' },
  2: { name: 'stone wall', flags: FLAGS.Impassable | FLAGS.Wall, color: '#3a3a44' },
  3: { name: 'door', flags: FLAGS.Door | FLAGS.Surface, color: '#8b5a2b' },
  4: { name: 'water', flags: FLAGS.Wet | FLAGS.Impassable, color: '#2a5d9f' },
  5: { name: 'wooden floor', flags: FLAGS.Surface, color: '#9c7a4a' },
};

export const isPassable = id => !!TILES[id] && !(TILES[id].flags & FLAGS.Impassable);
