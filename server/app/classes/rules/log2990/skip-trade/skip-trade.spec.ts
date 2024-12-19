/* eslint-disable dot-notation -- Membre privé */
import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { SkipTrade } from '@app/classes/rules/log2990/skip-trade/skip-trade';
import { PLAYER_ONE_INDEX } from '@app/constants/game';
import { SKIP_TRADE_BONUS } from '@app/constants/log2990';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { stubPlayer1 } from '@app/test/classes-stubs/player-stub';
import { FAKE_FULL_TRADE_ACTION, FAKE_PARTIAL_TRADE_ACTION } from '@app/test/constants/fake-goals';
import { FAKE_PLACE_ACTION } from '@app/test/constants/fake-hints';
import { FAKE_RULE_RESPONSE_EMPTY } from '@app/test/constants/fake-words-find-constants';
import { expect } from 'chai';
import { restore } from 'sinon';

describe('SkipTrade', () => {
    let goal: SkipTrade;
    let player: Player;
    let game: Game;
    let visitor: RulesVisitorResponse;
    const executeModifications = (modifications: ((game: Game) => void)[]) =>
        modifications.forEach((modification: (game: Game) => void) => modification(game));

    beforeEach(() => {
        player = stubPlayer1();
        game = stubGame();
        goal = new SkipTrade([player], game);
        visitor = FAKE_RULE_RESPONSE_EMPTY();
        game.actionChoose = true;
    });

    afterEach(() => restore());

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(goal).to.exist;
    });

    it('isGoalCompleted should return true  when skip turn then trade all letters', () => {
        expect(goal['isCompleted'](new SkipTurn(), game, visitor)).to.be.eql(false);
        executeModifications(visitor.gameModification);
        visitor.gameModification = [];
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(false);
        executeModifications(visitor.gameModification);
        visitor.gameModification = [];
        expect(goal['isCompleted'](new SkipTurn(), game, visitor)).to.be.eql(false);
        executeModifications(visitor.gameModification);
        visitor.gameModification = [];
        expect(goal['isCompleted'](FAKE_FULL_TRADE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return false when skip turn then trade 6 letters', () => {
        expect(goal['isCompleted'](new SkipTurn(), game, visitor)).to.be.eql(false);
        executeModifications(visitor.gameModification);
        visitor.gameModification = [];
        expect(goal['isCompleted'](FAKE_PARTIAL_TRADE_ACTION(), game, visitor)).to.be.eql(false);
    });

    it('should return the right score', () => {
        expect(goal['isCompleted'](new SkipTurn(), game, visitor)).to.be.eql(false);
        executeModifications(visitor.gameModification);
        visitor.gameModification = [];
        expect(goal.verify(FAKE_FULL_TRADE_ACTION(), game, visitor).score).to.be.eql(SKIP_TRADE_BONUS);
    });

    it('should not change the value to true from skipTurnHasOccurred if the player has not choose ', () => {
        game.actionChoose = false;
        const expectedValue = goal.skipTurnHasOccurred.get(PLAYER_ONE_INDEX);

        // eslint-disable-next-line dot-notation -- membre privé
        goal['isCompleted'](new SkipTurn(), game, visitor);
        executeModifications(visitor.gameModification);
        visitor.gameModification = [];
        expect(goal.skipTurnHasOccurred.get(PLAYER_ONE_INDEX)).to.be.eql(expectedValue);
    });

    it('should not change the value to false from skipTurnHasOccurred if the player has not choose ', () => {
        game.actionChoose = false;
        const expectedValue = true;

        goal.skipTurnHasOccurred.set(PLAYER_ONE_INDEX, expectedValue);
        // eslint-disable-next-line dot-notation -- membre privé
        goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor);
        executeModifications(visitor.gameModification);
        visitor.gameModification = [];
        expect(goal.skipTurnHasOccurred.get(PLAYER_ONE_INDEX)).to.be.eql(expectedValue);
    });

    it('should send false if the player doesn"t exist ', () => {
        goal.skipTurnHasOccurred = new Map<number, boolean>();

        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PARTIAL_TRADE_ACTION(), game, visitor)).to.be.eql(false);
    });
});
