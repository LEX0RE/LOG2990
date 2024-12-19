import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { RageTime } from '@app/classes/rules/log2990/rage-time/rage-time';
import { Timer } from '@app/classes/timer/timer';
import { PLAYER_ONE_INDEX } from '@app/constants/game';
import { RAGE_TIME_BONUS } from '@app/constants/log2990';
import { THREE_SECOND } from '@app/constants/miscellaneous';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { stubPlayer1 } from '@app/test/classes-stubs/player-stub';
import { FAKE_PLACE_ACTION } from '@app/test/constants/fake-hints';
import { FAKE_RULE_RESPONSE_EMPTY } from '@app/test/constants/fake-words-find-constants';
import { expect } from 'chai';
import { restore, SinonStubbedInstance } from 'sinon';

describe('RageTime', () => {
    let goal: RageTime;
    let player: Player;
    let game: Game;
    let visitor: RulesVisitorResponse;
    let timer: SinonStubbedInstance<Timer>;
    const executeModifications = (modifications: ((game: Game) => void)[]) =>
        modifications.forEach((modification: (game: Game) => void) => modification(game));
    const visitorExecute = (ruleVisitor: RulesVisitorResponse) => {
        executeModifications(ruleVisitor.gameModification);
        ruleVisitor.gameModification = [];
    };
    const executeTurn = (time: number) => {
        timer.remainingTime.returns(time);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(false);
        visitorExecute(visitor);
    };
    const underThreeSeconds = THREE_SECOND - 1;
    const overThreeSeconds = THREE_SECOND + 1;

    beforeEach(() => {
        player = stubPlayer1();
        game = stubGame();
        goal = new RageTime([player], game);
        visitor = FAKE_RULE_RESPONSE_EMPTY();
        timer = game.timer as unknown as SinonStubbedInstance<Timer>;
        game.actionChoose = true;
    });

    afterEach(() => restore());

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(goal).to.exist;
    });

    it('isGoalCompleted should return true  when 3 turn with remaining time below 3 seconds', () => {
        executeTurn(underThreeSeconds);
        executeTurn(overThreeSeconds);
        executeTurn(underThreeSeconds);
        executeTurn(underThreeSeconds);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return false when 3 turn with remaining time but last was above 3 seconds', () => {
        executeTurn(underThreeSeconds);
        executeTurn(overThreeSeconds);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(false);
    });

    it('isGoalCompleted should return false when 3 turn with remaining time but last was a skipAction', () => {
        executeTurn(underThreeSeconds);
        executeTurn(underThreeSeconds);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](new SkipTurn(), game, visitor)).to.be.eql(false);
    });

    it('should return the right score', () => {
        executeTurn(underThreeSeconds);
        executeTurn(underThreeSeconds);
        expect(goal.verify(FAKE_PLACE_ACTION(), game, visitor).score).to.be.eql(RAGE_TIME_BONUS);
    });

    it('isGoalCompleted should return true when 3 turn with remaining time even if the player has not choose', () => {
        game.actionChoose = false;
        executeTurn(underThreeSeconds);
        executeTurn(underThreeSeconds);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(false);
    });

    it('isGoalCompleted should not reset the value of turns if the player has not choose the action', () => {
        game.actionChoose = false;
        const expectedValue = 2;

        goal.nTurns.set(PLAYER_ONE_INDEX, expectedValue);
        // eslint-disable-next-line dot-notation -- membre privé
        goal['isCompleted'](new SkipTurn(), game, visitor);
        expect(goal.nTurns.get(PLAYER_ONE_INDEX)).to.be.eql(expectedValue);
    });

    it('isGoalCompleted should return false if the player doesn"t exist in array and it does not choose action', () => {
        game.actionChoose = false;
        goal.nTurns = new Map<number, number>();

        timer.remainingTime.returns(underThreeSeconds);
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(false);
        expect(goal.nTurns.has(PLAYER_ONE_INDEX)).to.be.equal(false);
    });

    it('isGoalCompleted should create a player if it is not in the array', () => {
        goal.nTurns = new Map<number, number>();

        executeTurn(underThreeSeconds);
        expect(goal.nTurns.has(PLAYER_ONE_INDEX)).to.be.equal(true);
    });
});
