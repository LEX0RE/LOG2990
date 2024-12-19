import { ClassicMode } from '@app/classes/game-mode/classic-mode/classic-mode';
import { Game } from '@app/classes/game/game';
import { PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/constants/game';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { ConcreteGoalRuleStub } from '@app/test/classes-stubs/goal-rule-stub';
import { FAKE_PLACE_ACTION } from '@app/test/constants/fake-hints';
import { FAKE_RULE_RESPONSE_EMPTY } from '@app/test/constants/fake-words-find-constants';
import { expect } from 'chai';
import { assert, restore, SinonStubbedInstance } from 'sinon';

describe('GoalRule', () => {
    let rule: ConcreteGoalRuleStub;
    let game: Game;

    beforeEach(() => {
        game = stubGame();
        rule = new ConcreteGoalRuleStub();
    });

    afterEach(() => restore());

    it('should create an instance', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(rule).to.exist;
    });

    it('verify should remove rule when complete and concern player', () => {
        Object.defineProperty(game, 'activePlayer', { value: game.players[PLAYER_ONE_INDEX] });
        rule.isCompleted.returns(true);
        const result = rule.verify(FAKE_PLACE_ACTION(), game, FAKE_RULE_RESPONSE_EMPTY());

        expect(result.score).to.eql(rule.bonus);
        result.gameModification.forEach((modification: (game: Game) => void) => modification(game));
        assert.calledOnceWithExactly((game.gameMode as SinonStubbedInstance<ClassicMode>).removeRule, rule.name);
    });

    it('should do nothing if it is not right player', () => {
        Object.defineProperty(game, 'activePlayer', { value: game.players[PLAYER_TWO_INDEX] });
        rule.isCompleted.returns(true);
        const result = rule.verify(FAKE_PLACE_ACTION(), game, FAKE_RULE_RESPONSE_EMPTY());
        const expected = { score: 0, gameModification: [] };

        expect(result.score).to.eql(expected.score);
        expect(result.gameModification).be.be.eql(expected.gameModification);
    });

    it('should do nothing if goal is not achieved', () => {
        Object.defineProperty(game, 'activePlayer', { value: game.players[PLAYER_ONE_INDEX] });
        rule.isCompleted.returns(false);
        const result = rule.verify(FAKE_PLACE_ACTION(), game, FAKE_RULE_RESPONSE_EMPTY());
        const expected = { score: 0, gameModification: [] };

        expect(result.score).to.eql(expected.score);
        expect(result.gameModification).be.be.eql(expected.gameModification);
    });
});
