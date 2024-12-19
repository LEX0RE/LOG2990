import { FAKE_PLAYER_1_NAME, FAKE_PLAYER_2_NAME, FAKE_SCORE_PLAYER_1, FAKE_SCORE_PLAYER_2 } from '@app/test/constants/fake-player';
import { CLASSIC } from '@common/constants/game-modes';
import { GameInfoHistory } from '@common/interfaces/game-information';

export const FAKE_GAME_HISTORY: GameInfoHistory = {
    beginningDate: new Date('March 21, 2022 03:24:00'),
    duration: 1500,
    player1: {
        name: FAKE_PLAYER_1_NAME,
        score: FAKE_SCORE_PLAYER_1,
    },
    player2: {
        name: FAKE_PLAYER_2_NAME,
        score: FAKE_SCORE_PLAYER_2,
    },
    gameModeName: CLASSIC,
    isSurrendered: false,
};
