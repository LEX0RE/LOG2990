import { Vector2D } from '@app/interface/vector-2d-interface';
import { BOARD_MAX_INDEX, BOARD_MIN_INDEX } from '@common/constants/board';

export const GOAL_COUNT = 4;

export const BASE_POINT = 4;
export const MAX_BONUS_TILE = 3;
export const MIN_BONUS_TILE = 2;
export const CORNER_BONUS = 25;
export const CORNER_DESCRIPTION = 'Placer une lettre dans un des coins du tableau';

export const CORNERS: Vector2D[] = [
    { x: BOARD_MIN_INDEX, y: BOARD_MIN_INDEX },
    { x: BOARD_MIN_INDEX, y: BOARD_MAX_INDEX },
    { x: BOARD_MAX_INDEX, y: BOARD_MIN_INDEX },
    { x: BOARD_MAX_INDEX, y: BOARD_MAX_INDEX },
];

export const MIN_WORD_LENGTH = 6;
export const MAX_WORD_LENGTH = 15;

export const LETTERS_3_BONUS = 24;
export const DEFAULT_LETTER_TRIO = 'e';
export const TARGET_MINIMUM_QUANTITY = 6;
export const THREE_LETTERS = 3;

export const QUICK_PLACEMENT_DESCRIPTION = 'Placer en moins de 2 secondes';
export const QUICK_PLACEMENT_BONUS = 15;

export const RAGE_TIME_DESCRIPTION = 'Placer 3 secondes avant la fin du chronomètre 3 tours de suite';
export const RAGE_TIME_BONUS = 15;
export const RAGE_TIME_N_TURNS = 3;
export const RAGE_TIME_DEFAULT = 1;

export const SCORE_ONE_POINT_DESCRIPTION = "Obtenir qu'un seul point pendant votre tour";
export const SCORE_ONE_POINT_BONUS = 30;

export const SKIP_TRADE_DESCRIPTION = "Passer son tour, puis échanger toutes vos lettres le tour d'après";
export const SKIP_TRADE_BONUS = 20;

export const WORD_LENGTH_X_DESCRIPTION = (targetLength: number) => `Formez un mot de ${targetLength.toString()} lettres`;
export const LETTER_TRIO_DESCRIPTION = (letter: string) => `Forme un mot contenant 3 fois la lettre ${letter.toUpperCase()}`;
