/* eslint-disable dot-notation -- Propriété/Méthode privée */
import { Game } from '@app/classes/game/game';
import { GameWatchTower } from '@app/classes/game/game-watch-tower/game-watch-tower';
import { PLAYER_ONE_INDEX } from '@app/constants/game';
import { Chat } from '@app/interface/chat-room';
import { EndGameManager } from '@app/services/end-game-manager/end-game-manager.service';
import { ReconnectionManager } from '@app/services/reconnection-manager/reconnection-manager.service';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { FAKE_PLAYER_1_NAME, FAKE_SOCKET_ID_PLAYER_1 } from '@app/test/constants/fake-player';
import { ROOM_ONE } from '@app/test/constants/fake-room-id';
import { RESPONSE_DELAY } from '@app/test/delay';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { MAX_TIME_BEFORE_KICK, RECONNECTION } from '@common/constants/communication';
import { Message } from '@common/interfaces/message';
import { expect } from 'chai';
import { assert, restore, SinonStubbedInstance, spy, stub, useFakeTimers } from 'sinon';

describe('ReconnectionManager', () => {
    let stubs: ServiceStubHelper;
    let reconnectionManager: ReconnectionManager;
    let gameStub: Game;
    let messageSent: Message;
    const newSocketId = 'new_socketId';

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        stubs.socketManager.disconnectClient(stubs.clientSocket);
        stubs.clientSocket.id = newSocketId;
        stubs.socketManager.connectClient(stubs.clientSocket);
        reconnectionManager = new ReconnectionManager();
        gameStub = stubGame();
        messageSent = { content: FAKE_SOCKET_ID_PLAYER_1, senderId: newSocketId, senderName: '', time: new Date() };
    });

    afterEach(() => restore());

    it('should create ReconnectionManager', () => {
        expect(reconnectionManager).to.not.be.eql(undefined);
    });

    it('creation should add handle for RECONNECTION', () => {
        expect([...stubs.socketManager['_events'].keys()]).to.have.deep.include(RECONNECTION);
    });

    it('should call reconnectUser when client ask it', () => {
        const spyReconnectUser = spy(reconnectionManager, 'reconnectUser');

        stubs.clientSocket.emit(RECONNECTION, messageSent);
        assert.called(spyReconnectUser);
    });

    it('should handle Reconnection', () => {
        const chat: Chat = { id: ROOM_ONE, userMessages: new Map<string, Message[]>() };
        const oldMessages: Message[] = [messageSent, messageSent];
        const copyOldMessage = JSON.parse(JSON.stringify(oldMessages));
        const spyIsConnected = stub(stubs.socketManager, 'isConnected').returns(false);

        stubs.gameManager.getGameByPlayerId.returns(gameStub);
        chat.userMessages.set(FAKE_SOCKET_ID_PLAYER_1, oldMessages);
        stubs.chatManager.socketIdToName.set(FAKE_SOCKET_ID_PLAYER_1, FAKE_PLAYER_1_NAME);
        stubs.chatManager.userToChat.set(FAKE_SOCKET_ID_PLAYER_1, chat);
        stubs.chatManager.getChatIfExist.returns(chat);

        reconnectionManager['inWaitingForDisconnect'].add(FAKE_SOCKET_ID_PLAYER_1);

        stubs.clientSocket.emit(RECONNECTION, messageSent);

        assert.called(spyIsConnected);

        expect(reconnectionManager['inWaitingForDisconnect'].has(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(false);
        assert.calledWith(stubs.roomManager.joinRoom, newSocketId, ROOM_ONE);

        expect(stubs.chatManager.socketIdToName.get(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(undefined);
        expect(stubs.chatManager.socketIdToName.get(newSocketId)).to.be.eql(FAKE_PLAYER_1_NAME);

        expect(stubs.chatManager.userToChat.get(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(undefined);
        expect(stubs.chatManager.userToChat.get(newSocketId)).to.be.eql(chat);

        expect(chat.userMessages.get(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(undefined);
        expect(chat.userMessages.get(newSocketId)).to.not.have.deep.members(copyOldMessage);
        assert.called(stubs.chatManager.sendToUserInChat);
        assert.calledWith(stubs.gameManager.getGameByPlayerId, FAKE_SOCKET_ID_PLAYER_1);
        assert.called((gameStub.watchTower as unknown as SinonStubbedInstance<GameWatchTower>).update);
        expect(gameStub.players[PLAYER_ONE_INDEX].id).to.be.eql(newSocketId);
    });

    it('should handle Reconnection - empty message content', () => {
        messageSent.content = '';
        const spyReconnectUser = spy(reconnectionManager, 'reconnectUser');

        stubs.clientSocket.emit(RECONNECTION, messageSent);
        assert.notCalled(spyReconnectUser);
    });

    it('should handle Reconnection - when socket is still connected', () => {
        const spyIsConnected = stub(stubs.socketManager, 'isConnected').returns(true);
        const spyJoin = stub(stubs.socketManager, 'join');

        stubs.clientSocket.emit(RECONNECTION, messageSent);
        assert.called(spyIsConnected);
        assert.notCalled(spyJoin);
    });

    it('should handle Reconnection - with undefinedRoom', () => {
        const spyJoin = stub(stubs.socketManager, 'join');

        reconnectionManager['inWaitingForDisconnect'].add(FAKE_SOCKET_ID_PLAYER_1);
        stub(stubs.socketManager, 'isConnected').returns(false);
        stubs.roomManager.userRoom = new Map<string, string>();

        const spyUserRooms = stub(stubs.roomManager.userRoom, 'get').returns(undefined);

        stubs.clientSocket.emit(RECONNECTION, messageSent);

        expect(reconnectionManager['inWaitingForDisconnect'].has(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(false);
        assert.called(spyUserRooms);
        assert.notCalled(spyJoin);
    });

    it('should handle Reconnection with undefined game and chat and name', () => {
        stubs.roomManager.userRoom = new Map<string, string>();
        const spyUserRooms = stub(stubs.roomManager.userRoom, 'get').returns(ROOM_ONE);
        const spyIsConnected = stub(stubs.socketManager, 'isConnected').returns(false);

        stubs.gameManager.getGameByPlayerId.returns(undefined);
        stubs.chatManager.socketIdToName = new Map<string, string>();
        stubs.chatManager.userToChat = new Map<string, Chat>();

        reconnectionManager['inWaitingForDisconnect'].add(FAKE_SOCKET_ID_PLAYER_1);

        stubs.clientSocket.emit(RECONNECTION, messageSent);

        assert.calledWith(spyUserRooms, FAKE_SOCKET_ID_PLAYER_1);
        assert.called(spyIsConnected);

        expect(reconnectionManager['inWaitingForDisconnect'].has(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(false);
        assert.calledWith(stubs.roomManager.joinRoom, newSocketId, ROOM_ONE);

        expect(stubs.chatManager.socketIdToName.get(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(undefined);

        expect(stubs.chatManager.socketIdToName.get(newSocketId)).to.be.eql(undefined);

        expect(stubs.chatManager.userToChat.get(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(undefined);

        expect(stubs.chatManager.userToChat.get(newSocketId)).to.be.eql(undefined);
        assert.notCalled(stubs.chatManager.sendToUserInChat);
        assert.calledWith(stubs.gameManager.getGameByPlayerId, FAKE_SOCKET_ID_PLAYER_1);
    });

    it('disconnect should call waitRemove', () => {
        const spyWaitRemove = spy(reconnectionManager, 'waitRemove');

        stubs.clientSocket.disconnect();

        assert.calledOnce(spyWaitRemove);
    });

    it(' reconnectUserToChat should handle undefined previousMessages', () => {
        const chat: Chat = { id: ROOM_ONE, userMessages: new Map<string, Message[]>() };

        stubs.chatManager.userToChat = new Map<string, Chat>();
        stubs.chatManager.userToChat.set(FAKE_SOCKET_ID_PLAYER_1, chat);
        stubs.chatManager.getChatIfExist.returns(chat);

        reconnectionManager['reconnectUserToChat'](FAKE_SOCKET_ID_PLAYER_1, newSocketId, ROOM_ONE);

        expect(stubs.chatManager.userToChat.get(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(undefined);

        expect(stubs.chatManager.userToChat.get(newSocketId)).to.be.eql(undefined);

        expect(chat.userMessages.get(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(undefined);

        expect(chat.userMessages.get(newSocketId)).to.be.eql(undefined);
    });

    it('should handle disconnection', () => {
        const fakeTimer = useFakeTimers();
        const chat: Chat = { id: ROOM_ONE, userMessages: new Map<string, Message[]>() };

        stubs.chatManager.getChatIfExist.returns(chat);

        const spyRoomSize = stub(stubs.socketManager, 'getRoomSize').returns(0);

        (gameStub.watchTower.endGameManager as unknown as SinonStubbedInstance<EndGameManager>).giveUpHandler.callsFake((socketId: string) =>
            reconnectionManager.removeUser(socketId),
        );

        stubs.gameManager.getGameByPlayerId.returns(gameStub);
        reconnectionManager.waitRemove(FAKE_SOCKET_ID_PLAYER_1);

        expect(reconnectionManager['inWaitingForDisconnect'].has(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(true);
        fakeTimer.tick(MAX_TIME_BEFORE_KICK + RESPONSE_DELAY);

        expect(reconnectionManager['inWaitingForDisconnect'].has(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(false);
        assert.calledWith(
            (gameStub.watchTower.endGameManager as unknown as SinonStubbedInstance<EndGameManager>).giveUpHandler,
            FAKE_SOCKET_ID_PLAYER_1,
        );
        assert.calledWith(spyRoomSize, ROOM_ONE);

        expect(stubs.roomManager.userRoom.get(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(undefined);
        assert.calledWith(stubs.chatManager.deleteChat, ROOM_ONE);
        fakeTimer.restore();
    });

    it('should handle disconnection - do not delete is user has reconnected', () => {
        const fakeTimer = useFakeTimers();

        stubs.roomManager.userRoom = new Map<string, string>();
        const spyUserRooms = spy(stubs.roomManager.userRoom, 'get');

        reconnectionManager.waitRemove(FAKE_SOCKET_ID_PLAYER_1);

        expect(reconnectionManager['inWaitingForDisconnect'].has(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(true);

        reconnectionManager['inWaitingForDisconnect'].delete(FAKE_SOCKET_ID_PLAYER_1);
        fakeTimer.tick(MAX_TIME_BEFORE_KICK + RESPONSE_DELAY);

        expect(reconnectionManager['inWaitingForDisconnect'].has(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(false);
        assert.notCalled(spyUserRooms);

        fakeTimer.restore();
    });

    it('should handle disconnection - undefined room', () => {
        const fakeTimer = useFakeTimers();

        const spyUserRooms = stub(stubs.roomManager.userRoom, 'get').returns(undefined);

        stubs.roomManager.userRoom.clear();
        stubs.gameManager.getGameByPlayerId.returns(gameStub);
        (gameStub.watchTower.endGameManager as unknown as SinonStubbedInstance<EndGameManager>).giveUpHandler.callsFake((socketID: string) =>
            reconnectionManager.removeUser(socketID),
        );

        reconnectionManager.waitRemove(FAKE_SOCKET_ID_PLAYER_1);
        fakeTimer.tick(MAX_TIME_BEFORE_KICK + RESPONSE_DELAY);
        assert.calledWith(spyUserRooms, FAKE_SOCKET_ID_PLAYER_1);

        expect(stubs.roomManager.userRoom.get(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(undefined);
        fakeTimer.restore();
    });

    it('should handle disconnection - if game defined - chat undefined', () => {
        const fakeTimer = useFakeTimers();

        stubs.chatManager.getChatIfExist.returns(undefined);
        stubs.gameManager.getGameByPlayerId.returns(gameStub);

        const spyRoomSize = stub(stubs.socketManager, 'getRoomSize').returns(1);

        stubs.gameManager.getGameByPlayerId.returns(gameStub);
        (gameStub.watchTower.endGameManager as unknown as SinonStubbedInstance<EndGameManager>).giveUpHandler.callsFake((socketId: string) =>
            reconnectionManager.removeUser(socketId),
        );

        reconnectionManager.waitRemove(FAKE_SOCKET_ID_PLAYER_1);
        fakeTimer.tick(MAX_TIME_BEFORE_KICK + RESPONSE_DELAY);
        assert.calledWith(spyRoomSize, ROOM_ONE);

        expect(stubs.roomManager.userRoom.get(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(undefined);
        assert.calledWith(stubs.gameManager.getGameByPlayerId, FAKE_SOCKET_ID_PLAYER_1);
        assert.notCalled(stubs.chatManager.sendToChat);
        fakeTimer.restore();
    });

    it('removeChat should not delete chat if 1 user left', () => {
        stubs.chatManager.getChatIfExist.returns(undefined);
        const chat: Chat = { id: ROOM_ONE, userMessages: new Map<string, Message[]>() };

        stubs.chatManager.getChatIfExist.returns(chat);
        const spyRoomSize = stub(stubs.socketManager, 'getRoomSize').returns(1);

        reconnectionManager['removeChat'](ROOM_ONE);

        assert.calledWith(spyRoomSize, ROOM_ONE);
        assert.notCalled(stubs.chatManager.deleteChat);
    });

    it('should handle disconnection - if game undefined - chat undefined', () => {
        const fakeTimer = useFakeTimers();

        stubs.chatManager.getChatIfExist.returns(undefined);

        stubs.gameManager.getGameByPlayerId.returns(undefined);
        reconnectionManager.waitRemove(FAKE_SOCKET_ID_PLAYER_1);
        fakeTimer.tick(MAX_TIME_BEFORE_KICK + RESPONSE_DELAY);
        assert.notCalled((gameStub.watchTower.endGameManager as unknown as SinonStubbedInstance<EndGameManager>).giveUpHandler);
        fakeTimer.restore();
    });
});
