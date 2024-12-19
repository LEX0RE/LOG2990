import { Game } from '@app/classes/game/game';
import { Letter } from '@app/classes/letters/letter/letter';
import { BeginnerPlayer } from '@app/classes/players/virtual-player/beginner-player/beginner-player';
import { PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/constants/game';
import { BEGINNER_ID } from '@app/constants/id-virtual-player';
import { Chat } from '@app/interface/chat-room';
import { EndGameManager } from '@app/services/end-game-manager/end-game-manager.service';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { FAKE_CHAT } from '@app/test/constants/fake-chat-message';
import { FAKE_PLAYER_1_NAME, FAKE_PLAYER_2_NAME, FAKE_SOCKET_ID_PLAYER_1, FAKE_SOCKET_ID_PLAYER_2 } from '@app/test/constants/fake-player';
import { ROOM_ONE } from '@app/test/constants/fake-room-id';
import { delay, RESPONSE_DELAY } from '@app/test/delay';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { END_GAME, GET_EASEL, SURRENDER_EVENT } from '@common/constants/communication';
import { GamePossibility } from '@common/enums/game-possibility';
import { EaselPlayer } from '@common/interfaces/easel-player';
import { Message } from '@common/interfaces/message';
import { expect } from 'chai';
import { afterEach } from 'mocha';
import { assert, restore, SinonStubbedInstance, spy } from 'sinon';

describe('EndGameManager', () => {
    let stubs: ServiceStubHelper;
    let endGameManager: EndGameManager;
    let game: Game;
    let gameStub: SinonStubbedInstance<Game>;
    const helloWorld = 'hello World!';

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        endGameManager = new EndGameManager();
        game = stubGame();
        gameStub = game as unknown as SinonStubbedInstance<Game>;
        stubs.chatManager.getChatIfExist.returns(FAKE_CHAT());
        gameStub.findIndexPlayer.returns(PLAYER_ONE_INDEX);
    });

    afterEach(() => restore());

    it('should create endGameManager', () => {
        expect(endGameManager).to.not.be.eql(undefined);
    });

    it('should handle player 1 surrender  with beginner player if the mode is multiplayer', async () => {
        const messageSent: Message = { content: helloWorld, senderId: FAKE_SOCKET_ID_PLAYER_1, senderName: FAKE_PLAYER_1_NAME, time: new Date() };
        const expectedNewId = game.players[PLAYER_TWO_INDEX].id + BEGINNER_ID;
        const expectedScore = game.players[PLAYER_ONE_INDEX].score;
        const expectedEasel = game.players[PLAYER_ONE_INDEX].easel;

        stubs.gameManager.getGameByPlayerId.returns(game);
        stubs.clientSocket.emit(SURRENDER_EVENT, messageSent);
        await delay(RESPONSE_DELAY);

        assert.calledWith(stubs.gameManager.getGameByPlayerId, FAKE_SOCKET_ID_PLAYER_1);
        assert.calledOnceWithExactly(stubs.reconnectionManager.removeUser, FAKE_SOCKET_ID_PLAYER_1);
        expect(game.players[PLAYER_ONE_INDEX].id).to.equal(expectedNewId);
        expect(game.players[PLAYER_ONE_INDEX].score).to.equal(expectedScore);
        expect(game.players[PLAYER_ONE_INDEX].easel).to.equal(expectedEasel);
        assert.calledOnce(stubs.chatManager.sendToChat);
        assert.called(stubs.gameplay.endPlayerTurn);
    });

    it('should handle player 1 surrender  with endGame if the mode is solo', async () => {
        const messageSent: Message = { content: helloWorld, senderId: FAKE_SOCKET_ID_PLAYER_1, senderName: FAKE_PLAYER_1_NAME, time: new Date() };

        game.players[PLAYER_TWO_INDEX] = new BeginnerPlayer(FAKE_PLAYER_2_NAME, FAKE_SOCKET_ID_PLAYER_2);

        stubs.gameManager.getGameByPlayerId.returns(game);
        stubs.clientSocket.emit(SURRENDER_EVENT, messageSent);
        await delay(RESPONSE_DELAY);

        assert.calledWith(stubs.gameManager.getGameByPlayerId, FAKE_SOCKET_ID_PLAYER_1);
        assert.calledOnceWithExactly(stubs.reconnectionManager.removeUser, FAKE_SOCKET_ID_PLAYER_1);
        assert.called(gameStub.end);
        assert.notCalled(stubs.chatManager.sendToChat);
        assert.called(stubs.gameplay.endPlayerTurn);
    });

    it('should handle player 2 surrender  with beginner player if the mode is multiplayer', async () => {
        const messageSent: Message = { content: helloWorld, senderId: FAKE_SOCKET_ID_PLAYER_2, senderName: FAKE_PLAYER_2_NAME, time: new Date() };
        const expectedNewId = game.players[PLAYER_ONE_INDEX].id + BEGINNER_ID;
        const expectedScore = game.players[PLAYER_TWO_INDEX].score;
        const expectedEasel = game.players[PLAYER_TWO_INDEX].easel;

        stubs.gameManager.getGameByPlayerId.returns(game);
        gameStub.findIndexPlayer.returns(PLAYER_TWO_INDEX);
        stubs.clientSocket.emit(SURRENDER_EVENT, messageSent);
        await delay(RESPONSE_DELAY);

        assert.calledWith(stubs.gameManager.getGameByPlayerId, FAKE_SOCKET_ID_PLAYER_2);
        assert.calledOnceWithExactly(stubs.reconnectionManager.removeUser, FAKE_SOCKET_ID_PLAYER_2);
        expect(game.players[PLAYER_TWO_INDEX].id).to.equal(expectedNewId);
        expect(game.players[PLAYER_TWO_INDEX].score).to.equal(expectedScore);
        expect(game.players[PLAYER_TWO_INDEX].easel).to.equal(expectedEasel);
        assert.calledOnce(stubs.chatManager.sendToChat);
        assert.called(stubs.gameplay.endPlayerTurn);
    });

    it('should handle player 2 surrender  with endGame if the mode is solo', async () => {
        const messageSent: Message = { content: helloWorld, senderId: FAKE_SOCKET_ID_PLAYER_2, senderName: FAKE_PLAYER_2_NAME, time: new Date() };

        game.players[PLAYER_ONE_INDEX] = new BeginnerPlayer(FAKE_PLAYER_2_NAME, FAKE_SOCKET_ID_PLAYER_2);

        stubs.gameManager.getGameByPlayerId.returns(game);
        gameStub.findIndexPlayer.returns(PLAYER_TWO_INDEX);
        stubs.clientSocket.emit(SURRENDER_EVENT, messageSent);
        await delay(RESPONSE_DELAY);

        assert.calledWith(stubs.gameManager.getGameByPlayerId, FAKE_SOCKET_ID_PLAYER_2);
        assert.calledOnceWithExactly(stubs.reconnectionManager.removeUser, FAKE_SOCKET_ID_PLAYER_2);
        assert.called(gameStub.end);
        assert.notCalled(stubs.chatManager.sendToChat);
        assert.called(stubs.gameplay.endPlayerTurn);
    });

    it('should handle surrender with undefined game', async () => {
        const messageSent: Message = { content: helloWorld, senderId: FAKE_SOCKET_ID_PLAYER_2, senderName: FAKE_PLAYER_2_NAME, time: new Date() };

        stubs.gameManager.getGameByPlayerId.returns(undefined);
        stubs.clientSocket.emit(SURRENDER_EVENT, messageSent);
        await delay(RESPONSE_DELAY);

        assert.calledWith(stubs.gameManager.getGameByPlayerId, FAKE_SOCKET_ID_PLAYER_2);
        assert.calledOnceWithExactly(stubs.reconnectionManager.removeUser, FAKE_SOCKET_ID_PLAYER_2);
        assert.notCalled(gameStub.end);
        assert.notCalled(stubs.gameplay.endPlayerTurn);
    });

    it('sendEndGame should call send private', () => {
        const decision: GamePossibility = GamePossibility.Win;
        const spySend = spy(stubs.socketManager, 'sendPrivate');

        endGameManager.sendEndGame(FAKE_SOCKET_ID_PLAYER_1, decision);
        assert.calledOnceWithExactly(spySend, END_GAME, FAKE_SOCKET_ID_PLAYER_1, decision);
    });

    it('sendEndMessage should send the right end message', async () => {
        const chatStub = { id: ROOM_ONE };

        stubs.chatManager.getChatIfExist.returns(chatStub as unknown as Chat);
        await endGameManager.sendEndMessage(game.players, ROOM_ONE, game.letterStash.size);
        assert.called(stubs.chatManager.sendToChat);
        assert.called(stubs.chatManager.messageFromServer);
    });

    it('sendEndMessage should handle undefined chat', () => {
        const letterStashSize = 12;

        stubs.chatManager.getChatIfExist.returns(undefined);
        endGameManager.sendEndMessage(game.players, ROOM_ONE, letterStashSize);
        assert.notCalled(stubs.chatManager.sendToChat);
        assert.notCalled(stubs.chatManager.messageFromServer);
    });

    it('giveUpHandler should not call sendChat if the chat doesnt exist ', async () => {
        const messageSent: Message = { content: helloWorld, senderId: FAKE_SOCKET_ID_PLAYER_1, senderName: FAKE_PLAYER_1_NAME, time: new Date() };

        stubs.gameManager.getGameByPlayerId.returns(game);
        stubs.chatManager.getChatIfExist.returns(undefined);
        stubs.clientSocket.emit(SURRENDER_EVENT, messageSent);
        await delay(RESPONSE_DELAY);
        assert.notCalled(stubs.chatManager.sendToChat);
        assert.called(stubs.gameplay.endPlayerTurn);
    });

    it('sendEndMessage should change the easel from player One if real player and has the new easel in the list', async () => {
        const expectedNewEasel: Letter[] = game.players[0].easel.letters;

        expectedNewEasel.push(expectedNewEasel[0]);
        const messageSent: EaselPlayer = { easel: expectedNewEasel, playerId: game.players[0].id };

        stubs.gameManager.getGameByPlayerId.returns(game);
        // eslint-disable-next-line  no-undefined -- sert de valeur limite pour le test
        stubs.chatManager.getChatIfExist.returns(undefined);
        stubs.clientSocket.emit(GET_EASEL, messageSent);
        await delay(RESPONSE_DELAY);
        await endGameManager.sendEndMessage(game.players, game.gameId, game.letterStash.size);
        expect(game.players[0].easel.letters).to.be.equal(expectedNewEasel);
    });

    it('sendEndMessage should not change the easel from player One if real player and has not the new easel in the list', async () => {
        const expectedNewEasel: Letter[] = game.players[0].easel.letters;

        stubs.gameManager.getGameByPlayerId.returns(game);
        // eslint-disable-next-line  no-undefined -- sert de valeur limite pour le test
        stubs.chatManager.getChatIfExist.returns(undefined);
        await endGameManager.sendEndMessage(game.players, game.gameId, game.letterStash.size);
        expect(game.players[0].easel.letters).to.be.equal(expectedNewEasel);
    });

    it('sendEndMessage should change the easel from player two if real player and has the new easel in the list', async () => {
        const expectedNewEasel: Letter[] = game.players[1].easel.letters;

        expectedNewEasel.push(expectedNewEasel[1]);
        const messageSent: EaselPlayer = { easel: expectedNewEasel, playerId: game.players[1].id };

        stubs.gameManager.getGameByPlayerId.returns(game);
        // eslint-disable-next-line  no-undefined -- sert de valeur limite pour le test
        stubs.chatManager.getChatIfExist.returns(undefined);
        stubs.clientSocket.emit(GET_EASEL, messageSent);
        await delay(RESPONSE_DELAY);
        await endGameManager.sendEndMessage(game.players, game.gameId, game.letterStash.size);
        expect(game.players[1].easel.letters).to.be.equal(expectedNewEasel);
    });

    it('sendEndMessage should not change the easel from player two if real player and has not the new easel in the list', async () => {
        const expectedNewEasel: Letter[] = game.players[1].easel.letters;

        stubs.gameManager.getGameByPlayerId.returns(game);
        // eslint-disable-next-line  no-undefined -- sert de valeur limite pour le test
        stubs.chatManager.getChatIfExist.returns(undefined);
        await endGameManager.sendEndMessage(game.players, game.gameId, game.letterStash.size);
        expect(game.players[1].easel.letters).to.be.equal(expectedNewEasel);
    });
});
