import { CommonPlayerInfo } from '@app/interface/common-player-info';
import { FAKE_LETTERS } from '@app/test/constants/fake-letters';
import { scenarioBoard } from '@common/constants/board-scenario';
import { GoalType } from '@common/enums/goal-type';
import { BoardUpdate } from '@common/interfaces/board-update';
import { EaselUpdate } from '@common/interfaces/easel-update';
import { GameUpdate } from '@common/interfaces/game-update';
import { CommonGoal } from '@common/interfaces/goal';
import { GoalUpdate } from '@common/interfaces/goal-update';

export const FAKE_OTHER_PLAYER_INFO = (): CommonPlayerInfo => {
    return { nLetterLeft: 2, name: 'james', score: 100, turn: true };
};

export const FAKE_PLAYER_INFO = (): CommonPlayerInfo => {
    return { nLetterLeft: 3, name: 'nicolas', score: 10, turn: false };
};

export const FAKE_N_LETTER_LEFT_STASH = 15;

export const FAKE_GAME_UPDATE = (): GameUpdate => {
    return {
        otherInfo: FAKE_OTHER_PLAYER_INFO(),
        playerInfo: FAKE_PLAYER_INFO(),
        stash: { nLettersLeft: FAKE_N_LETTER_LEFT_STASH },
    };
};

export const FAKE_BOARD_UPDATE = (): BoardUpdate => {
    return { board: scenarioBoard };
};

export const FAKE_EASEL_UPDATE = (): EaselUpdate => {
    return { easel: { letters: FAKE_LETTERS() } };
};

export const FAKE_LONG_DESCRIPTION_GOAL = ' reussir a faire decoller le jeu de scrabble sur la lune';

export const FAKE_DESCRIPTION_GOAL = 'Activer X nombre de cases bonus';

export const FAKE_GOAL_UPDATE = (): GoalUpdate => {
    return {
        goals: [
            { description: 'private goal' + FAKE_LONG_DESCRIPTION_GOAL, isCompleted: false, type: GoalType.Private, bonus: 15 },
            { description: 'public goal' + FAKE_LONG_DESCRIPTION_GOAL, isCompleted: false, type: GoalType.Public, bonus: 40 },
            { description: 'public goal' + FAKE_DESCRIPTION_GOAL, isCompleted: true, type: GoalType.Public, bonus: 12 },
            { description: ' other private goal' + FAKE_LONG_DESCRIPTION_GOAL, isCompleted: false, type: GoalType.OtherPrivate, bonus: 15 },
        ],
    };
};

export const FAKE_PRIVATE_GOAL = (): CommonGoal[] => [
    { description: 'private goal' + FAKE_LONG_DESCRIPTION_GOAL, isCompleted: false, type: GoalType.Private, bonus: 15 },
];
export const FAKE_PUBLIC_GOAL = (): CommonGoal[] => [
    { description: 'public goal' + FAKE_LONG_DESCRIPTION_GOAL, isCompleted: false, type: GoalType.Public, bonus: 40 },
    { description: 'public goal' + FAKE_DESCRIPTION_GOAL, isCompleted: true, type: GoalType.Public, bonus: 12 },
];
export const FAKE_OTHER_PRIVATE_GOAL = (): CommonGoal[] => [
    { description: ' other private goal' + FAKE_LONG_DESCRIPTION_GOAL, isCompleted: false, type: GoalType.OtherPrivate, bonus: 15 },
];

export const FAKE_HIDDEN_OTHER_GOAL = (): GoalUpdate => {
    return {
        goals: [
            { description: 'private goal' + FAKE_LONG_DESCRIPTION_GOAL, isCompleted: false, type: GoalType.Private, bonus: 15 },
            { description: 'public goal' + FAKE_LONG_DESCRIPTION_GOAL, isCompleted: false, type: GoalType.Public, bonus: 40 },
            { description: 'public goal' + FAKE_LONG_DESCRIPTION_GOAL, isCompleted: true, type: GoalType.Public, bonus: 999 },
        ],
    };
};
