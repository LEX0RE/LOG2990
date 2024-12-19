import { Log2990Mode } from '@app/classes/game-mode/log2990/log2990';
import { Game } from '@app/classes/game/game';
import { MustSendGoals } from '@app/classes/rules/log2990/must-send-goals/must-send-goals';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { stubLog2990Mode } from '@app/test/classes-stubs/log2990-mode-stub';
import { FAKE_PLACE_ACTION } from '@app/test/constants/fake-hints';
import { FAKE_RULE_RESPONSE_EMPTY } from '@app/test/constants/fake-words-find-constants';
import { expect } from 'chai';
import { assert, restore, SinonStubbedInstance } from 'sinon';

describe('MustSendGoals', () => {
    let rule: MustSendGoals;
    let game: Game;
    let mode: Log2990Mode;
    let visitor: RulesVisitorResponse;

    beforeEach(() => {
        mode = stubLog2990Mode();
        game = stubGame();
        game.gameMode = mode;
        rule = new MustSendGoals();
        visitor = FAKE_RULE_RESPONSE_EMPTY();
    });

    afterEach(() => restore());

    it('should created instance ', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(rule).to.exist;
    });

    it('should add handler for send goals on gameMode', () => {
        rule.verify(FAKE_PLACE_ACTION(), game, visitor);
        visitor.gameModification.forEach((modification: (game: Game) => void) => modification(game));
        assert.called((game.gameMode as SinonStubbedInstance<Log2990Mode>).sendGoals);
    });
});
