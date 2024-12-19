/* eslint-disable @typescript-eslint/no-explicit-any, dot-notation -- Propriété/Méthode privée et mock des méthodes */
import { PlaceLetters } from '@app/classes/actions/place-letters/places-letter';
import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { TradeLetter } from '@app/classes/actions/trade-letters/trade-letters';
import { Letter } from '@app/classes/letters/letter/letter';
import { BeginnerPlayer } from '@app/classes/players/virtual-player/beginner-player/beginner-player';
import { VirtualPlayer } from '@app/classes/players/virtual-player/virtual-player-abstract';
import { TURN_DELAY } from '@app/constants/beginner-player';
import { Action } from '@app/interface/action-interface';
import { Chat } from '@app/interface/chat-room';
import { stubVirtualPlayer } from '@app/test/classes-stubs/virtual-player-stub';
import { delay } from '@app/test/delay';
import { doNothing } from '@app/test/do-nothing-function';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { ActionType } from '@common/enums/action-type';
import { Orientation } from '@common/enums/orientation';
import { expect } from 'chai';
import { describe } from 'mocha';
import { assert, restore, spy, stub, useFakeTimers } from 'sinon';

describe('VirtualPlayer', () => {
    let stubs: ServiceStubHelper;
    let abstractPlayer: VirtualPlayer;
    let player: BeginnerPlayer;

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        abstractPlayer = stubVirtualPlayer();

        player = new BeginnerPlayer(abstractPlayer.name, abstractPlayer.id);

        player['game'] = abstractPlayer['game'];

        player['chat'] = abstractPlayer['chat'];

        stubs.gameManager.getGameByPlayerId.returns(abstractPlayer['game']);
        stubs.chatManager.sendToOthersInChat.callsFake(doNothing);
    });

    afterEach(() => restore());

    it('getGameIfDontHave should get game from gameManager', () => {
        const game = player['game'];

        player['game'] = undefined;

        player['setGame']();

        expect(player['game']).to.equal(game);
        assert.calledOnce(stubs.gameManager.getGameByPlayerId);
    });

    it('getGameIfDontHave should not change game if it already has', () => {
        const expctedGame = player['game'];

        player['setGame']();
        assert.notCalled(stubs.gameManager.getGameByPlayerId);

        expect(player['game']).to.equal(expctedGame);
    });

    it('getGameIfDontHave should change chat if he found game', () => {
        const expectedChat: Chat = { userMessages: new Map(), id: 'test' };

        player['game'] = undefined;
        stubs.chatManager.getChatIfExist.returns(expectedChat);

        player['setGame']();

        expect(player['chat']).to.equal(expectedChat);
    });

    it('getGameIfDontHave should not change chat if he not found game', () => {
        const expectedChat: Chat = player['chat'];

        player['game'] = undefined;

        stubs.gameManager.getGameByPlayerId.returns(undefined);

        player['setGame']();

        expect(player['chat']).to.equal(expectedChat);
    });

    it('trade should return tradeLetter if smaller or equal than letter in stash', () => {
        const expectedNbToChange = 5;
        const letter = new Letter('test', 0);
        const letters = [letter, letter, letter, letter, letter];
        const expectedAction = ActionType.Trade;

        player.easel.letters = letters;

        stub(player, 'chooseAction' as any).callsFake(() => {
            return letters;
        });
        player.trade(expectedNbToChange).then((action: Action) => {
            expect((action as TradeLetter).letters.length).to.equal(letters.length);
            expect(action.actionType).to.equal(expectedAction);
        });
    });

    it('trade should return skipTurn if bigger than letter in stash', () => {
        const nbToChange = 999;
        const skipTurn = ActionType.SkipTurn;

        player.trade(nbToChange).then((action: Action) => {
            expect(action.actionType).to.equal(skipTurn);
        });
    });

    it('setMessage should call sendMessage with the string from placeLetter if action is placeLetter', () => {
        const fakePosition = { x: 0, y: 0 };
        const action: PlaceLetters = new PlaceLetters([], fakePosition, Orientation.Horizontal);
        const expectedValue = action.toString();
        const spyMessage = spy(player, 'sendMessage' as any);

        player.setMessage(action);
        assert.calledOnceWithExactly(spyMessage, expectedValue);
    });

    it('setMessage should call sendMessage with the string from skipTurn if action is placeLetter', () => {
        const action: SkipTurn = new SkipTurn();
        const expectedValue = action.toString();

        const spyMessage = spy(player, 'sendMessage' as any);

        player.setMessage(action);
        assert.calledOnceWithExactly(spyMessage, expectedValue);
    });

    it('setMessage should call sendMessage with the string from TradeLetter if action is placeLetter', () => {
        const action: TradeLetter = new TradeLetter([]);
        const expectedValue = action.toString();
        const spyMessage = spy(player, 'sendMessage' as any);

        player.setMessage(action);
        assert.calledOnceWithExactly(spyMessage, expectedValue);
    });

    it('nextAction should return a skipPromise after the time limit ', async () => {
        const secondsToWait = 21;
        const expectedAction = ActionType.SkipTurn;

        player.timeLimit = 20;

        stub(player, 'handleAction' as any).callsFake(async () => {
            await delay(secondsToWait);
            return ActionType.PlaceLetters;
        });
        await player.nextAction().then((actionValue) => {
            expect(actionValue.actionType).to.eql(expectedAction);
        });
    });

    it('nextAction should return a PlaceLetterPromise before the time limit ', (done: Mocha.Done) => {
        const fakeTimer = useFakeTimers();
        const expectedAction = ActionType.PlaceLetters;
        const secondsToWait = 1000;

        player.timeLimit = TURN_DELAY + secondsToWait;
        stub(player, 'handleAction' as any).callsFake(() => {
            return ActionType.PlaceLetters;
        });
        const promise = player.nextAction();

        fakeTimer.tick(TURN_DELAY);
        promise.then((actionValue) => {
            expect(actionValue).to.eql(expectedAction);
            done();
        });
        fakeTimer.restore();
    });
});
