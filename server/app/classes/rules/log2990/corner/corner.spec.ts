import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { Corner } from '@app/classes/rules/log2990/corner/corner';
import { MIDDLE_POSITION } from '@app/constants/game';
import { CORNER_BONUS } from '@app/constants/log2990';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { stubPlayer1 } from '@app/test/classes-stubs/player-stub';
import { FAKE_PLACE_ACTION } from '@app/test/constants/fake-hints';
import { FAKE_RULE_RESPONSE_EMPTY } from '@app/test/constants/fake-words-find-constants';
import { expect } from 'chai';
import { restore } from 'sinon';

describe('Corner', () => {
    let goal: Corner;
    let player: Player;
    let game: Game;
    let visitor: RulesVisitorResponse;

    beforeEach(() => {
        player = stubPlayer1();
        game = stubGame();
        goal = new Corner([player], game);
        visitor = FAKE_RULE_RESPONSE_EMPTY();
    });

    afterEach(() => restore());

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(goal).to.exist;
    });

    it('isGoalCompleted should return true  top right corner is include in placePosition', () => {
        visitor.placedPosition = [{ x: 14, y: 0 }];
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return true  top left corner is include in placePosition', () => {
        visitor.placedPosition = [{ x: 0, y: 0 }];
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return true  bottom left corner is include in placePosition', () => {
        visitor.placedPosition = [{ x: 0, y: 14 }];
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return true  bottom right corner is include in placePosition', () => {
        visitor.placedPosition = [{ x: 14, y: 14 }];
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return false  position is not a corner', () => {
        visitor.placedPosition = [MIDDLE_POSITION];
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(false);
    });

    it('should return the right score', () => {
        visitor.placedPosition = [{ x: 14, y: 14 }];
        goal.verify(FAKE_PLACE_ACTION(), game, visitor);
        expect(visitor.score).to.be.eql(CORNER_BONUS);
    });
});
