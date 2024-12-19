import { Log2990Mode } from '@app/classes/game-mode/log2990/log2990';
import { FAKE_GOALS } from '@app/test/constants/fake-goals';
import { LOG2990 } from '@common/constants/game-modes';
import { createStubInstance } from 'sinon';

export const stubLog2990Mode = (): Log2990Mode => {
    const gameMode = createStubInstance(Log2990Mode);

    gameMode.goals = FAKE_GOALS();
    gameMode.mode = LOG2990;
    return gameMode as unknown as Log2990Mode;
};
