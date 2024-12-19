import { Log2990Mode } from '@app/classes/game-mode/log2990/log2990';
import { Game } from '@app/classes/game/game';
import { PLAYER_ONE_INDEX, PLAYER_TWO_INDEX, START_EVENT } from '@app/constants/game';
import { Goal } from '@app/interface/goal';
import { Rule } from '@app/interface/rule-interface';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { FAKE_GOALS, FAKE_GOAL_NAME, FAKE_GOAL_UPDATE_1, FAKE_GOAL_UPDATE_2 } from '@app/test/constants/fake-goals';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { GOAL_UPDATE, RECONNECTION } from '@common/constants/communication';
import { expect } from 'chai';
import { assert, restore, stub } from 'sinon';

describe('Log2990Mode', () => {
    let mode: Log2990Mode;
    let game: Game;
    let stubs: ServiceStubHelper;

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        stubs.goalFactory.createGoals.returns(FAKE_GOALS());
        game = stubGame();
        mode = new Log2990Mode(game);
        game.gameMode = mode;
    });

    afterEach(() => restore());

    it('should create an instance', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(mode).to.exist;
        assert.calledOnce(stubs.goalFactory.createGoals);
    });

    it('should send goals on events start and reconnection', () => {
        const spySendGoals = stub(mode, 'sendGoals');

        game.events.emit(START_EVENT, game);
        assert.calledOnce(spySendGoals);
        game.events.emit(RECONNECTION, game);
        assert.calledTwice(spySendGoals);
    });

    it('sendGoals should send right goals player 1', () => {
        const sendSpy = stub(stubs.socketManager, 'sendPrivate');

        mode.sendGoals(game);
        assert.calledWithExactly(sendSpy, GOAL_UPDATE, game.players[PLAYER_ONE_INDEX].id, FAKE_GOAL_UPDATE_1());
    });

    it('sendGoals should send right goals player 2', () => {
        const sendSpy = stub(stubs.socketManager, 'sendPrivate');

        game.players[PLAYER_TWO_INDEX].requiredUpdates = true;
        mode.sendGoals(game);
        assert.calledWithExactly(sendSpy, GOAL_UPDATE, game.players[PLAYER_TWO_INDEX].id, FAKE_GOAL_UPDATE_2());
    });

    it('removeRule should remove rule and set goal to complete', () => {
        expect(mode.goals.find((goal: Goal) => goal.rule.name === FAKE_GOAL_NAME)?.isCompleted).to.eql(false);
        mode.removeRule(FAKE_GOAL_NAME);
        // eslint-disable-next-line no-undefined -- sert de valeur limite
        expect(mode.rules.find((rule: Rule) => rule.name === FAKE_GOAL_NAME)).to.eql(undefined);
        expect(mode.goals.find((goal: Goal) => goal.rule.name === FAKE_GOAL_NAME)?.isCompleted).to.eql(true);
    });

    it('removeRule should remove rule and not set goal to complete', () => {
        const ruleName = 'fake-rule-name';

        expect(mode.goals.find((goal: Goal) => goal.rule.name === FAKE_GOAL_NAME)?.isCompleted).to.eql(false);
        mode.removeRule(ruleName);
        expect(mode.goals.find((goal: Goal) => goal.rule.name === FAKE_GOAL_NAME)?.isCompleted).to.eql(false);
    });
});
