import { Board } from '@app/classes/board/board';
import { Game } from '@app/classes/game/game';
import { emptyLetter } from '@app/classes/letters/letterFactory/letter-factory';
import { Player } from '@app/classes/players/player-abstract';
import { BonusMaster } from '@app/classes/rules/log2990/bonus-master/bonus-master';
import { Tile } from '@app/classes/tiles/tile';
import { WordTimes2 } from '@app/classes/tiles/word-times-2/word-times-2';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { stubPlayer1 } from '@app/test/classes-stubs/player-stub';
import { FAKE_VISITOR_2_BONUS } from '@app/test/constants/fake-bonus-master';
import { FAKE_PLACE_ACTION } from '@app/test/constants/fake-hints';
import { expect } from 'chai';
import { restore, SinonStubbedInstance, stub } from 'sinon';

describe('BonusMaster', () => {
    let goal: BonusMaster;
    let player: Player;
    let game: Game;
    const nBonus = 2;
    const bonusPoints = 16;

    beforeEach(() => {
        player = stubPlayer1();
        game = stubGame();
        stub(MathUtils, 'randomNumberInInterval').returns(nBonus);
        goal = new BonusMaster([player], game);
    });

    afterEach(() => restore());

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(goal).to.exist;
    });

    it('isGoalCompleted should return true when two bonus was activated', () => {
        const visitor = FAKE_VISITOR_2_BONUS();
        const fakeTile: Tile = new WordTimes2(emptyLetter());

        fakeTile.isBonusActive = true;
        (game.board as SinonStubbedInstance<Board>).getTile.returns(fakeTile);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return false when one bonus was activated', () => {
        const visitor = FAKE_VISITOR_2_BONUS();
        const fakeTile: Tile = new WordTimes2(emptyLetter());

        visitor.placedPosition.pop();
        fakeTile.isBonusActive = true;
        (game.board as SinonStubbedInstance<Board>).getTile.returns(fakeTile);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(false);
    });

    it('should return the right score', () => {
        const visitor = FAKE_VISITOR_2_BONUS();
        const fakeTile: Tile = new WordTimes2(emptyLetter());

        fakeTile.isBonusActive = true;
        (game.board as SinonStubbedInstance<Board>).getTile.returns(fakeTile);
        goal.verify(FAKE_PLACE_ACTION(), game, visitor);
        expect(visitor.score).to.be.eql(bonusPoints);
    });

    it('isGoalCompleted should return false when no bonus was activated', () => {
        const visitor = FAKE_VISITOR_2_BONUS();
        const fakeTile: Tile = new WordTimes2(emptyLetter());

        fakeTile.isBonusActive = false;
        (game.board as SinonStubbedInstance<Board>).getTile.returns(fakeTile);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(false);
    });
});
