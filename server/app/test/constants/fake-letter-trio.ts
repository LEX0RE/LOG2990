import { StandardTile } from '@app/classes/tiles/standard-tile/standard-tile';
import { Tile } from '@app/classes/tiles/tile';

export const FAKE_LETTERS_OVER_6 = (): string[] => ['e', 'a', 'e', 'i', 'n', 'o', 'r', 's', 't', 'u'];

export const FAKE_WORD_WITH_3_E = (): Tile[][] => [
    [
        new StandardTile({ letter: 'a', point: 1 }),
        new StandardTile({ letter: 'e', point: 1 }),
        new StandardTile({ letter: 'e', point: 1 }),
        new StandardTile({ letter: 'b', point: 1 }),
        new StandardTile({ letter: 'e', point: 1 }),
    ],
    [new StandardTile({ letter: 'a', point: 1 }), new StandardTile({ letter: 'e', point: 1 })],
];

export const FAKE_WORD_WITH_3_E_AND_BLANKS = (): Tile[][] => [
    [
        new StandardTile({ letter: 'a', point: 1 }),
        new StandardTile({ letter: 'E', point: 1 }),
        new StandardTile({ letter: 'E', point: 1 }),
        new StandardTile({ letter: 'b', point: 1 }),
        new StandardTile({ letter: 'e', point: 1 }),
    ],
    [new StandardTile({ letter: 'a', point: 1 }), new StandardTile({ letter: 'e', point: 1 })],
];

export const FAKE_WORD_WITH_2_E = (): Tile[][] => [
    [
        new StandardTile({ letter: 'a', point: 1 }),
        new StandardTile({ letter: 'e', point: 1 }),
        new StandardTile({ letter: 'e', point: 1 }),
        new StandardTile({ letter: 'b', point: 1 }),
    ],
    [new StandardTile({ letter: 'a', point: 1 }), new StandardTile({ letter: 'e', point: 1 })],
];
