/* eslint-disable @typescript-eslint/no-explicit-any, dot-notation -- Propriété/Méthode privée et mock des méthodes */
import { Game } from '@app/classes/game/game';
import { MultiplayerGameFactory } from '@app/services/game-factory/multiplayer-game-factory/multiplayer-game-factory.service';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { FAKE_DICTIONARY_TITLE, FAKE_GAME_CONFIG, FAKE_GAME_ID } from '@app/test/constants/fake-game';
import { FAKE_COMMON_GAME_CONFIG, FAKE_JOIN_GAME } from '@app/test/constants/fake-game-factory';
import { FAKE_WAITING_GAME } from '@app/test/constants/fake-game-manager';
import { FAKE_PLAYER_1_NAME, FAKE_SOCKET_ID_PLAYER_1 } from '@app/test/constants/fake-player';
import { doNothing } from '@app/test/do-nothing-function';
import { ServiceStubHelper } from '@app/test/service-stubs';
import {
    CANCEL_GAME_CREATION,
    CHANGE_DICTIONARY,
    CREATE_GAME,
    GAME_CREATION_CONFIRM,
    GET_AVAILABLE_GAME,
    JOIN_GAME,
    YOU_WERE_REJECTED,
} from '@common/constants/communication';
import { DictionaryUpdate } from '@common/interfaces/dictionary-update';
import { expect } from 'chai';
import { assert, restore, SinonStubbedInstance, stub } from 'sinon';

describe('MultiplayerGameFactory', () => {
    let gameFactory: MultiplayerGameFactory;
    let stubs: ServiceStubHelper;

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        gameFactory = new MultiplayerGameFactory();
        stub(console, 'error');
        stubs.roomManager.createRoom.returns(FAKE_GAME_ID);
        stubs.gameManager.createWaitingGame.returns(true);
    });

    afterEach(() => restore());

    it('should create basic game factory', () => {
        expect(gameFactory).to.not.be.eql(undefined);
    });

    it('should get available games', async () => {
        const spySending = stub(gameFactory['socketManager'], 'to').callsFake(doNothing);

        gameFactory.availableGamesUpdate();
        assert.calledOnce(spySending);
    });

    it('should call create game when receiving CREATE_GAME from client', () => {
        expect([...stubs.socketManager['_events'].keys()]).to.have.deep.include(CREATE_GAME);
        const spyCreating = stub(gameFactory, 'createMultiplayerGame' as any).callsFake(doNothing);

        stubs.clientSocket.emit(CREATE_GAME, FAKE_COMMON_GAME_CONFIG());
        assert.calledOnceWithExactly(spyCreating, FAKE_COMMON_GAME_CONFIG());
    });

    it('should call change dictionary when receiving CHANGE_DICTIONARY from client', () => {
        const fakeDictionaryUpdate: DictionaryUpdate = {
            title: FAKE_DICTIONARY_TITLE,
            gameId: '123',
        };

        expect([...stubs.socketManager['_events'].keys()]).to.have.deep.include(CHANGE_DICTIONARY);
        const spyChanging = stub(gameFactory, 'changeDictionary' as any).callsFake(doNothing);

        stubs.clientSocket.emit(CHANGE_DICTIONARY, fakeDictionaryUpdate);
        assert.calledOnceWithExactly(spyChanging, fakeDictionaryUpdate);
    });

    it('should call join game when receiving JOIN_GAME from client', () => {
        expect([...stubs.socketManager['_events'].keys()]).to.have.deep.include(JOIN_GAME);
        const spyJoining = stub(gameFactory, 'joinGame' as any).callsFake(doNothing);

        stubs.clientSocket.emit(JOIN_GAME, FAKE_JOIN_GAME());
        assert.calledOnceWithExactly(spyJoining, FAKE_JOIN_GAME());
    });

    it('should call send games and sendToLobby when receiving GET_AVAILABLE_GAME from client', () => {
        expect([...stubs.socketManager['_events'].keys()]).to.have.deep.include(GET_AVAILABLE_GAME);
        const spySending = stub(gameFactory, 'sendGames' as any).callsFake(doNothing);

        stubs.clientSocket.emit(GET_AVAILABLE_GAME, FAKE_SOCKET_ID_PLAYER_1);
        assert.calledOnceWithExactly(spySending, FAKE_SOCKET_ID_PLAYER_1);
        assert.calledOnceWithExactly(stubs.roomManager.sendToLobby, FAKE_SOCKET_ID_PLAYER_1);
    });

    it('should call disconnect handler when client disconnects', () => {
        const spyDisconnecting = stub(gameFactory, 'disconnectHandler' as any).callsFake(doNothing);
        const socketId = stubs.clientSocket.id;

        stubs.clientSocket.disconnect();
        assert.calledOnceWithExactly(spyDisconnecting, socketId);
    });

    it('should handle cancel game creation if nobody tries to join', () => {
        const spyDisconnecting = stub(gameFactory, 'disconnectHandler' as any).callsFake(doNothing);
        const socketId = stubs.clientSocket.id;

        stubs.clientSocket.emit(CANCEL_GAME_CREATION, socketId);
        assert.calledOnceWithExactly(spyDisconnecting, socketId);
    });

    it('should handle cancel game creation if someone try to join', () => {
        const spyCancelling = stub(gameFactory, 'cancelGameHandler' as any).callsFake(doNothing);

        stubs.clientSocket.emit(CANCEL_GAME_CREATION, FAKE_JOIN_GAME());
        assert.calledOnceWithExactly(spyCancelling, FAKE_JOIN_GAME());
    });

    it('should handle the creation of a game', () => {
        const spyUpdating = stub(gameFactory, 'availableGamesUpdate').callsFake(doNothing);

        const spySending = stub(gameFactory['socketManager'], 'sendPrivate').callsFake(doNothing);

        stubs.roomManager.createRoom.returns(FAKE_GAME_ID);

        gameFactory['createMultiplayerGame'](FAKE_COMMON_GAME_CONFIG());
        assert.calledOnce(stubs.roomManager.createRoom);
        assert.calledOnceWithExactly(stubs.gameManager.createWaitingGame, FAKE_GAME_CONFIG());
        assert.calledOnceWithExactly(stubs.roomManager.joinRoom, FAKE_SOCKET_ID_PLAYER_1, FAKE_GAME_ID);
        assert.calledOnceWithExactly(stubs.chatManager.addUserToChat, FAKE_SOCKET_ID_PLAYER_1, FAKE_PLAYER_1_NAME, FAKE_GAME_ID);
        assert.calledOnceWithExactly(spySending, GAME_CREATION_CONFIRM, FAKE_SOCKET_ID_PLAYER_1, true);
        assert.calledOnce(spyUpdating);
    });

    it('should call delete game', () => {
        gameFactory['deleteGame'](FAKE_GAME_ID)();
        assert.calledWithExactly(stubs.gameManager.deleteGame, FAKE_GAME_ID);
    });

    it('should send games', () => {
        const spySending = stub(gameFactory['socketManager'], 'sendPrivate').callsFake(doNothing);

        gameFactory['sendGames'](FAKE_SOCKET_ID_PLAYER_1);
        assert.calledOnce(spySending);
    });

    it('should get configs', () => {
        stubs.gameManager.waitingGames = [FAKE_WAITING_GAME()];

        const configurations = gameFactory['getConfigs']();

        expect(configurations).to.be.eql([FAKE_COMMON_GAME_CONFIG()]);
    });

    it('should not get configs if waiting for confirmation', () => {
        const waitingGame = FAKE_WAITING_GAME();

        waitingGame.isWaitingForConfirmation = true;
        stubs.gameManager.waitingGames = [waitingGame];

        const configurations = gameFactory['getConfigs']();

        expect(configurations).to.be.eql([]);
    });

    it('should join a game', () => {
        const gameStub = stubGame();
        const fakeJoinInfo = FAKE_JOIN_GAME();

        const spySending = stub(gameFactory['socketManager'], 'sendPrivate').callsFake(doNothing);
        const spyDeleting = stub(gameFactory, 'deleteGame' as any).callsFake(doNothing);

        stubs.gameManager.joinMultiplayerGame.returns(gameStub);
        (gameStub as unknown as SinonStubbedInstance<Game>).start.resolves();
        stubs.clientSocket.emit(JOIN_GAME, fakeJoinInfo);
        assert.calledOnceWithExactly(stubs.gameManager.joinMultiplayerGame, fakeJoinInfo.player2SocketId, fakeJoinInfo.playerName, FAKE_GAME_ID);
        assert.calledOnceWithExactly(stubs.roomManager.leaveLobby, fakeJoinInfo.player2SocketId);
        assert.calledOnceWithExactly(stubs.roomManager.joinRoom, fakeJoinInfo.player2SocketId, FAKE_GAME_ID);
        assert.calledOnceWithExactly(stubs.chatManager.addUserToChat, fakeJoinInfo.player2SocketId, fakeJoinInfo.playerName, FAKE_GAME_ID);
        assert.calledTwice(spySending);
        assert.calledOnce(spyDeleting);
    });

    it('should should not join a game if joinGame failed', () => {
        const spySending = stub(gameFactory['socketManager'], 'sendPrivate').callsFake(doNothing);
        const fakeJoinInfo = FAKE_JOIN_GAME();

        stubs.gameManager.joinMultiplayerGame.returns(undefined);

        gameFactory['joinGame'](fakeJoinInfo);
        assert.calledOnceWithExactly(stubs.gameManager.joinMultiplayerGame, fakeJoinInfo.player2SocketId, fakeJoinInfo.playerName, FAKE_GAME_ID);
        assert.notCalled(stubs.roomManager.leaveLobby);
        assert.notCalled(stubs.roomManager.joinRoom);
        assert.notCalled(stubs.chatManager.addUserToChat);
        assert.calledTwice(spySending);
    });

    it('should disconnect handler', () => {
        const spyUpdating = stub(gameFactory, 'availableGamesUpdate').callsFake(doNothing);

        gameFactory['disconnectHandler'](FAKE_SOCKET_ID_PLAYER_1);
        assert.calledOnceWithExactly(stubs.gameManager.deleteWaitingGame, FAKE_SOCKET_ID_PLAYER_1);
        assert.calledOnce(spyUpdating);
    });

    it('should cancel game handler', () => {
        const spyUpdating = stub(gameFactory, 'availableGamesUpdate').callsFake(doNothing);

        const spySending = stub(gameFactory['socketManager'], 'sendPrivate').callsFake(doNothing);
        const fakeJoinInfo = FAKE_JOIN_GAME();

        gameFactory['cancelGameHandler'](fakeJoinInfo);
        assert.calledOnceWithExactly(stubs.gameManager.deleteWaitingGame, fakeJoinInfo.player1SocketId);
        assert.calledOnceWithExactly(spySending, YOU_WERE_REJECTED, fakeJoinInfo.player2SocketId);
        assert.calledOnce(spyUpdating);
    });

    it('should change dictionary if has gameID', () => {
        const fakeDictionaryUpdate: DictionaryUpdate = {
            title: FAKE_DICTIONARY_TITLE,
            gameId: '123',
        };

        stubs.gameManager.getWaitingGame.returns(FAKE_WAITING_GAME());

        gameFactory['changeDictionary'](fakeDictionaryUpdate);
        assert.calledOnce(stubs.gameManager.getWaitingGame);
    });

    it('should change dictionary if has gameID', () => {
        const fakeDictionaryUpdate: DictionaryUpdate = {
            title: FAKE_DICTIONARY_TITLE,
            gameId: '123',
        };

        stubs.gameManager.getWaitingGame.returns(undefined);

        gameFactory['changeDictionary'](fakeDictionaryUpdate);
        assert.calledOnce(stubs.gameManager.getWaitingGame);
    });

    it('should change dictionary if has no gameID', () => {
        const fakeDictionaryUpdate: DictionaryUpdate = {
            title: FAKE_DICTIONARY_TITLE,
            gameId: undefined,
        };

        gameFactory['changeDictionary'](fakeDictionaryUpdate);
        assert.notCalled(stubs.gameManager.getWaitingGame);
    });
});
