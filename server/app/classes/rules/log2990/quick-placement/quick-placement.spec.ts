import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { QuickPlacement } from '@app/classes/rules/log2990/quick-placement/quick-placement';
import { Timer } from '@app/classes/timer/timer';
import { QUICK_PLACEMENT_BONUS } from '@app/constants/log2990';
import { BUFFER_TIME, ONE_SECOND } from '@app/constants/miscellaneous';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { stubPlayer1 } from '@app/test/classes-stubs/player-stub';
import { FAKE_PLACE_ACTION } from '@app/test/constants/fake-hints';
import { FAKE_RULE_RESPONSE_EMPTY } from '@app/test/constants/fake-words-find-constants';
import { expect } from 'chai';
import { restore, SinonStubbedInstance } from 'sinon';

describe('QuickPlacement', () => {
    let goal: QuickPlacement;
    let player: Player;
    let game: Game;
    let visitor: RulesVisitorResponse;
    const remainingTimeTarget = 58000;
    let timer: SinonStubbedInstance<Timer>;

    beforeEach(() => {
        player = stubPlayer1();
        game = stubGame();
        goal = new QuickPlacement([player], game);
        visitor = FAKE_RULE_RESPONSE_EMPTY();
        timer = game.timer as unknown as SinonStubbedInstance<Timer>;
    });

    afterEach(() => restore());

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(goal).to.exist;
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['remainingTimeTarget']).to.be.eql(remainingTimeTarget - BUFFER_TIME);
    });

    it('should be created with remaining time of config if time is less than 2 seconds', () => {
        game.gameConfig.turnTimer.minute = 0;
        game.gameConfig.turnTimer.second = 1;
        const otherGoal = new QuickPlacement([player], game);

        // eslint-disable-next-line dot-notation -- membre privé
        expect(otherGoal['remainingTimeTarget']).to.be.eql(ONE_SECOND);
    });

    it('isGoalCompleted should return true  when remaining placement was 1.999 seconds', () => {
        const offset = 1;

        timer.remainingTime.returns(remainingTimeTarget + offset);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return true when remaining placement was 2.001 seconds', () => {
        const offset = -1;

        timer.remainingTime.returns(remainingTimeTarget + offset);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return false when remaining placement was 2.201 seconds', () => {
        const offset = -201;

        timer.remainingTime.returns(remainingTimeTarget + offset);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(false);
    });

    it('isGoalCompleted should return false  when action was not placeAction', () => {
        const offset = 1;

        timer.remainingTime.returns(remainingTimeTarget + offset);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](new SkipTurn(), game, visitor)).to.be.eql(false);
    });

    it('should return the right score', () => {
        timer.remainingTime.returns(remainingTimeTarget + ONE_SECOND);
        goal.verify(FAKE_PLACE_ACTION(), game, visitor);
        expect(visitor.score).to.be.eql(QUICK_PLACEMENT_BONUS);
    });
});
