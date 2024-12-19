import { HINT_MESSAGE, SKIP_TURN } from '@app/constants/system-message';
import { MessageType } from '@app/enum/message-type';
import { Chat } from '@app/interface/chat-room';
import { ChatManager } from '@app/services/chat-manager/chat-manager.service';
import { FAKE_CHAT, FAKE_MESSAGE } from '@app/test/constants/fake-chat-message';
import { EXPECTED_HINTS_MESSAGE } from '@app/test/constants/fake-hints';
import { FAKE_PLAYER_1_NAME, FAKE_SOCKET_ID_PLAYER_1, FAKE_SOCKET_ID_PLAYER_2 } from '@app/test/constants/fake-player';
import { ROOM_ONE } from '@app/test/constants/fake-room-id';
import { delay, RESPONSE_DELAY } from '@app/test/delay';
import { doNothing } from '@app/test/do-nothing-function';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { MESSAGE } from '@common/constants/communication';
import { ActionType } from '@common/enums/action-type';
import { Message } from '@common/interfaces/message';
import { expect } from 'chai';
import { assert, restore, spy, stub } from 'sinon';

describe('ChatManager', () => {
    let chatManager: ChatManager;
    let stubs: ServiceStubHelper;
    let chat: Chat;

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        chatManager = new ChatManager();
        chat = FAKE_CHAT();
        chat.userMessages.set(FAKE_SOCKET_ID_PLAYER_1, []);
        chatManager.userToChat.set(FAKE_SOCKET_ID_PLAYER_1, chat);
        chatManager.roomIdToChat.set(ROOM_ONE, chat);
        stubs.socketManager.disconnectClient(stubs.clientSocket);
        stubs.clientSocket.id = FAKE_SOCKET_ID_PLAYER_1;
        stubs.socketManager.connectClient(stubs.clientSocket);
    });

    afterEach(() => restore());

    it('should create ChatManager', () => expect(chatManager).to.not.be.eql(undefined));

    it('creation of ChatManager should add a handler for MESSAGE', () => {
        // eslint-disable-next-line dot-notation -- Propriété privée
        expect([...stubs.socketManager['_events'].keys()]).to.have.deep.include(MESSAGE);
    });

    it('handleIncomingMessages should add a handler message from user of messageType all when sender is valid', async () => {
        const messageSent: Message = FAKE_MESSAGE();

        stubs.chatFilter.messageType = MessageType.All;

        const spySendPrivate = stub(stubs.socketManager, 'sendPrivate');

        stubs.clientSocket.emit(MESSAGE, messageSent);
        await delay(RESPONSE_DELAY);
        assert.called(spySendPrivate);
    });

    it('handleIncomingMessages should add a handler message from user of messageType senderOnly when sender is valid', async () => {
        const messageSent: Message = FAKE_MESSAGE();

        stubs.chatFilter.messageType = MessageType.SenderOnly;

        // eslint-disable-next-line dot-notation -- Propriété privée
        const spySendPrivate = stub(chatManager['socketManager'], 'sendPrivate');

        stubs.clientSocket.emit(MESSAGE, messageSent);
        await delay(RESPONSE_DELAY);
        assert.called(spySendPrivate);
    });

    it('handleIncomingMessages should add a handler message from user of messageType trade when sender is valid', async () => {
        chat.userMessages.set(FAKE_SOCKET_ID_PLAYER_2, []);
        chatManager.userToChat.set(FAKE_SOCKET_ID_PLAYER_2, chat);
        const messageSent: Message = FAKE_MESSAGE();

        stubs.chatFilter.messageType = MessageType.Trade;

        // eslint-disable-next-line dot-notation -- Propriété privée
        const spySendPrivate = stub(chatManager['socketManager'], 'sendPrivate');

        stubs.clientSocket.emit(MESSAGE, messageSent);
        await delay(RESPONSE_DELAY);
        assert.called(spySendPrivate);
    });

    it('handleIncomingMessages should add a handler message from user of messageType invalid when sender is valid', async () => {
        const FAKE_SOCKET_ID_PLAYER_12 = '321';

        chat.userMessages.set(FAKE_SOCKET_ID_PLAYER_12, []);
        chatManager.userToChat.set(FAKE_SOCKET_ID_PLAYER_12, chat);
        const messageSent: Message = FAKE_MESSAGE();

        stubs.chatFilter.messageType = undefined as unknown as MessageType;
        const spySendToUser = stub(chatManager, 'sendToUserInChat').callsFake(doNothing);
        const spySendToOthers = stub(chatManager, 'sendToOthersInChat').callsFake(doNothing);

        stubs.clientSocket.emit(MESSAGE, messageSent);
        await delay(RESPONSE_DELAY);
        assert.called(spySendToUser);
        assert.notCalled(spySendToOthers);
    });

    it('handleIncomingMessages should undefined chat', async () => {
        const messageSent: Message = FAKE_MESSAGE();

        stub(chatManager.userToChat, 'get').returns(undefined);
        stubs.chatFilter.messageType = MessageType.SenderOnly;

        // eslint-disable-next-line dot-notation -- Propriété privée
        const spySendPrivate = stub(chatManager['socketManager'], 'sendPrivate');

        stubs.clientSocket.emit(MESSAGE, messageSent);
        await delay(RESPONSE_DELAY);
        assert.notCalled(spySendPrivate);
    });

    it('correctlyFormattedMessage should add name if it exist', () => {
        chatManager.socketIdToName.set(FAKE_SOCKET_ID_PLAYER_1, FAKE_PLAYER_1_NAME);
        const messageSent: Message = FAKE_MESSAGE();

        messageSent.senderName = '';
        const result = chatManager.correctlyFormattedMessage(FAKE_SOCKET_ID_PLAYER_1, messageSent);

        expect(result.senderName).to.be.eql(FAKE_PLAYER_1_NAME);
    });

    it('sendToUserInChat should handle undefined messages', () => {
        const messageSent: Message = FAKE_MESSAGE();

        // eslint-disable-next-line dot-notation -- Propriété privée
        const spySendPrivate = stub(chatManager['socketManager'], 'sendPrivate');

        chatManager.sendToUserInChat('', chat, messageSent);
        assert.notCalled(spySendPrivate);
    });

    it('sendToUserInChat should handle !échanger messages', () => {
        const messageSent: Message = { content: '!échanger r', senderId: FAKE_SOCKET_ID_PLAYER_1, senderName: FAKE_PLAYER_1_NAME, time: new Date() };

        chatManager.sendToUserInChat(FAKE_SOCKET_ID_PLAYER_1, chat, messageSent);
        expect(chat.userMessages.get(FAKE_SOCKET_ID_PLAYER_1)?.length).to.be.eql(1);
    });

    it('getUserForAGivenChat should give chat from user1', () => {
        chat.userMessages.set(FAKE_SOCKET_ID_PLAYER_2, []);
        chatManager.userToChat.set(FAKE_SOCKET_ID_PLAYER_2, chat);
        const result = chatManager.getUserForAGivenChat(ROOM_ONE);

        expect(result).to.have.deep.members([FAKE_SOCKET_ID_PLAYER_1, FAKE_SOCKET_ID_PLAYER_2]);
    });

    it('deleteChat should remove chat', () => {
        const chat2: Chat = { id: '2', userMessages: new Map<string, Message[]>() };

        chatManager.userToChat.set(FAKE_SOCKET_ID_PLAYER_2, chat2);
        const result = chatManager.deleteChat(ROOM_ONE);

        expect(result).to.be.eql(true);

        expect(chatManager.roomIdToChat.get(ROOM_ONE)).to.be.eql(undefined);

        expect(chatManager.userToChat.get(FAKE_SOCKET_ID_PLAYER_1)).to.be.eql(undefined);

        expect(chatManager.userToChat.get(FAKE_SOCKET_ID_PLAYER_2)).to.not.be.eql(undefined);
    });

    it('deleteChat should handle wrong roomId', () => {
        const result = chatManager.deleteChat('2');

        expect(result).to.be.eql(false);
    });

    it('addUserToChat should add user to all maps', () => {
        const roomTwo = '2';

        chatManager.addUserToChat(FAKE_SOCKET_ID_PLAYER_2, FAKE_PLAYER_1_NAME, roomTwo);

        expect(chatManager.userToChat.get(FAKE_SOCKET_ID_PLAYER_2)).to.not.be.eql(undefined);
        expect(chatManager.socketIdToName.get(FAKE_SOCKET_ID_PLAYER_2)).to.be.eql(FAKE_PLAYER_1_NAME);

        expect(chatManager.roomIdToChat.get(roomTwo)).to.not.be.eql(undefined);
    });

    it('addUserToChat should not clear messages of existing user', () => {
        const messageSent: Message = FAKE_MESSAGE();

        chat.userMessages.set(FAKE_SOCKET_ID_PLAYER_1, [messageSent]);
        chatManager.addUserToChat(FAKE_SOCKET_ID_PLAYER_1, FAKE_PLAYER_1_NAME, ROOM_ONE);

        expect(chatManager.userToChat.get(FAKE_SOCKET_ID_PLAYER_1)).to.not.be.eql(undefined);
        expect(chat.userMessages.get(FAKE_SOCKET_ID_PLAYER_1)?.length).to.not.be.eql(0);
    });

    it('createChatIfNecessary should return chat if it exist', () => {
        const result = chatManager.createChatIfNecessary(ROOM_ONE);

        expect(result).to.be.eql(chat);
    });

    it('handleIncomingMessages should send to otherPlayer skipTurn from user if the content has SKIP_TURN', async () => {
        const messageSent: Message = FAKE_MESSAGE();

        messageSent.content += SKIP_TURN;
        stubs.chatFilter.messageType = MessageType.SenderOnly;
        // eslint-disable-next-line dot-notation -- Membre privé
        const spySendPrivate = stub(chatManager['socketManager'], 'sendPrivate');
        const spySendToOthers = stub(chatManager, 'sendToOthersInChat');

        stubs.clientSocket.emit(MESSAGE, messageSent);
        await delay(RESPONSE_DELAY);
        assert.called(spySendPrivate);
        assert.called(spySendToOthers);
    });

    it('handleIncomingMessages should call endPlayerTurn from gameplay if the content of the message is skipTurn', async () => {
        const messageSent: Message = FAKE_MESSAGE();

        messageSent.content = ActionType.SkipTurn;

        stubs.clientSocket.emit(MESSAGE, messageSent);
        await delay(RESPONSE_DELAY);
        assert.called(stubs.gameplay.endPlayerTurn);
    });

    it('handleIncomingMessages should call hint from gameplay if the content of the message is hint and send the right message', async () => {
        const messageSent: Message = FAKE_MESSAGE();

        messageSent.content = HINT_MESSAGE;

        const spySend = spy(chatManager, 'sendToUserInChat');

        stubs.chatFilter.handleMessage.callsFake(doNothing);
        stubs.chatFilter.messageType = MessageType.SenderOnly;
        stubs.gameplay.getHint.resolves(EXPECTED_HINTS_MESSAGE);
        stubs.clientSocket.emit(MESSAGE, messageSent);
        await delay(RESPONSE_DELAY);
        assert.called(stubs.gameplay.getHint);
        assert.called(spySend);
    });
});
