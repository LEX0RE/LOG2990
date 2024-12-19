import { CommonLetter } from '@common/interfaces/game-view-related/common-letter';

export const FAKE_LETTERS = (): CommonLetter[] => {
    return [
        { letter: '*', point: 0 },
        { letter: 'J', point: 3 },
        { letter: 'A', point: 3 },
        { letter: 'M', point: 10 },
        { letter: 'E', point: 3 },
        { letter: 'S', point: 3 },
        { letter: '*', point: 0 },
    ];
};
