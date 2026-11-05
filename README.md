# dungeon-strass

RPG por turnos com cartas e dados (d20) com estética Ultima Online. Sem dependências.

- `npm start` e abra http://localhost:8080 — escolha Guerreiro/Mago/Arqueiro/Tief; setas movem; clique nas cartas (mão máx. 4, "Comprar carta" repõe).
- Marque "Personagem 0 (admin)" para o editor lateral em tempo real; `studio.html` é o Studio fora do jogo.
- Fase 1: entrada, 3 salas e sala do boss (Lich); derrote-o e capture a runa.
- Sprites: defina `window.SPRITES = { orc: 'url', tile1: 'url', Guerreiro: 'url', rune: 'url' }` (de browseruo2/public); sem eles usa formas placeholder.
- `src/tiledata.js` usa flags no estilo TileData do UO.
- Testes: `npm test`.
