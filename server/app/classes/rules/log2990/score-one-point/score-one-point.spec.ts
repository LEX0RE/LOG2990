import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { ScoreOnePoint } from '@app/classes/rules/log2990/score-one-point/score-one-point';
import { ONE_POINT, TWO_POINTS } from '@app/constants/default/default-letter';
import { SCORE_ONE_POINT_BONUS } from '@app/constants/log2990';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { stubPlayer1 } from '@app/test/classes-stubs/player-stub';
import { FAKE_PLACE_ACTION } from '@app/test/constants/fake-hints';
import { FAKE_RULE_RESPONSE_EMPTY } from '@app/test/constants/fake-words-find-constants';
import { expect } from 'chai';
import { restore } from 'sinon';

describe('ScoreOnePoint', () => {
    let goal: ScoreOnePoint;
    let player: Player;
    let game: Game;
    let visitor: RulesVisitorResponse;

    beforeEach(() => {
        player = stubPlayer1();
        game = stubGame();
        goal = new ScoreOnePoint([player], game);
        visitor = FAKE_RULE_RESPONSE_EMPTY();
    });

    afterEach(() => restore());

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(goal).to.exist;
    });

    it('isGoalCompleted should return true  when points is 1', () => {
        visitor.score = ONE_POINT;
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return false  when points is 2', () => {
        visitor.score = TWO_POINTS;
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](new SkipTurn(), game, visitor)).to.be.eql(false);
    });

    it('isGoalCompleted should return false  when points is 0', () => {
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](new SkipTurn(), game, visitor)).to.be.eql(false);
    });

    it('should return the right score', () => {
        visitor.score = ONE_POINT;
        expect(goal.verify(FAKE_PLACE_ACTION(), game, visitor).score).to.be.eql(SCORE_ONE_POINT_BONUS + ONE_POINT);
    });
});
