import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { stubBoard } from '@app/test/classes-stubs/board-stub';

export const FAKE_VISITOR_2_BONUS = (): RulesVisitorResponse => {
    return {
        score: 0,
        gameModification: [],
        newlyFormedWordAsTile: [],
        newBoard: stubBoard(),
        placedPosition: [
            { x: 0, y: 0 },
            { x: 3, y: 1 },
        ],
    };
};
