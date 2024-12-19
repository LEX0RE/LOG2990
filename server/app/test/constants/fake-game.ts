import { GameFlags } from '@app/interface/game-flags';
import { FAKE_PLAYER_1_NAME, FAKE_SOCKET_ID_PLAYER_1 } from '@app/test/constants/fake-player';
import { CLASSIC } from '@common/constants/game-modes';
import { CommonGameConfig } from '@common/interfaces/common-game-config';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';

export const FAKE_GAME_ID = 'game_id';
export const FAKE_DICTIONARY_TITLE = 'fake_dictionary_title';
export const FAKE_DICTIONARY_ID = 10;
export const FAKE_COMMON_TIMER = (): CommonTimer => {
    return { minute: 1, second: 0 };
};
export const FAKE_GAME_CONFIG = (): CommonGameConfig => {
    return {
        dictionaryTitle: FAKE_DICTIONARY_TITLE,
        dictionaryId: FAKE_DICTIONARY_ID,
        gameId: FAKE_GAME_ID,
        gameModeName: CLASSIC,
        player1Name: FAKE_PLAYER_1_NAME,
        player1SocketId: FAKE_SOCKET_ID_PLAYER_1,
        turnTimer: FAKE_COMMON_TIMER(),
    };
};
export const FAKE_GAME_FLAGS = (): GameFlags => {
    return { firstTimePlacingLetter: true, isGameOver: false, isPlayerOneTurn: true };
};
