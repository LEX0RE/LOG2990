import { EventEmitter } from '@angular/core';
import {
    FAKE_BOARD_UPDATE,
    FAKE_EASEL_UPDATE,
    FAKE_GAME_UPDATE,
    FAKE_OTHER_PRIVATE_GOAL,
    FAKE_PRIVATE_GOAL,
    FAKE_PUBLIC_GOAL,
} from '@app/test/constants/fake-game-update';

export const gameUpdaterStub = () =>
    jasmine.createSpyObj('GameUpdaterService', ['reset'], {
        easelUpdateEvent: new EventEmitter(),
        board: FAKE_BOARD_UPDATE().board,
        easel: FAKE_EASEL_UPDATE().easel,
        playerInfo: FAKE_GAME_UPDATE().playerInfo,
        otherPlayerInfo: FAKE_GAME_UPDATE().otherInfo,
        stash: FAKE_GAME_UPDATE().stash,
        myGoal: FAKE_PRIVATE_GOAL(),
        otherGoal: FAKE_OTHER_PRIVATE_GOAL(),
        publicGoals: FAKE_PUBLIC_GOAL(),
        isLoading: true,
    });
