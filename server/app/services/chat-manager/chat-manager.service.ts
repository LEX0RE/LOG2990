import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { SPACE } from '@app/constants/command-formatting';
import { HINT_MESSAGE, MESSAGE_NOT_SEND, SKIP_TURN } from '@app/constants/system-message';
import { MessageType } from '@app/enum/message-type';
import { Chat } from '@app/interface/chat-room';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler/chat-message-handler.service';
import { Gameplay } from '@app/services/gameplay/gameplay.service';
import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { MESSAGE, SYSTEM } from '@common/constants/communication';
import { ActionType } from '@common/enums/action-type';
import { Message } from '@common/interfaces/message';
import { Container, Service } from 'typedi';

@Service()
export class ChatManager {
    userToChat: Map<string, Chat>;
    roomIdToChat: Map<string, Chat>;
    socketIdToName: Map<string, string>;
    private socketManager: SocketManager;
    private chatFilter: ChatMessageHandlerService;
    private gameplay: Gameplay;

    constructor() {
        this.userToChat = new Map<string, Chat>();
        this.roomIdToChat = new Map<string, Chat>();
        this.socketIdToName = new Map<string, string>();
        this.socketManager = Container.get(SocketManager);
        this.chatFilter = Container.get(ChatMessageHandlerService);
        this.gameplay = Container.get(Gameplay);
        this.configureSocket();
    }

    getChatIfExist(roomId: string): Chat | undefined {
        return this.roomIdToChat.get(roomId);
    }

    addUserToChat(socketId: string, name: string, roomId: string): void {
        const chat = this.createChatIfNecessary(roomId);

        if (!chat.userMessages.has(socketId)) {
            chat.userMessages.set(socketId, []);
            this.socketIdToName.set(socketId, name);
        }

        this.socketManager.sendPrivate(MESSAGE, socketId, chat.userMessages.get(socketId));
        this.userToChat.set(socketId, chat);
    }

    createChatIfNecessary(roomId: string): Chat {
        const chat = this.getChatIfExist(roomId);

        if (chat) return chat;
        const newChat: Chat = { id: roomId, userMessages: new Map<string, Message[]>() };

        this.roomIdToChat.set(roomId, newChat);

        return newChat;
    }

    deleteChat(roomId: string): boolean {
        const chatToDelete = this.getChatIfExist(roomId);

        if (!chatToDelete) return false;
        this.roomIdToChat.delete(roomId);
        const usersToDelete: string[] = this.getUserForAGivenChat(roomId);

        usersToDelete.forEach((socketId: string) => {
            this.userToChat.delete(socketId);
            this.socketIdToName.delete(socketId);
        });
        return true;
    }

    getUserForAGivenChat(roomId: string): string[] {
        const users: string[] = [];

        this.userToChat.forEach((chat: Chat, socketID: string) => {
            if (chat.id === roomId) users.push(socketID);
        });
        return users;
    }

    messageFromServer(content: string): Message {
        return { time: new Date(), senderId: SYSTEM, senderName: SYSTEM, content };
    }

    sendToChat(chat: Chat, message: Message): void {
        this.sendMessage(chat, message);
    }

    sendToUserInChat(socketId: string, chat: Chat, message: Message): void {
        const messages = chat.userMessages.get(socketId);

        if (messages) {
            messages.push(message.content.split(SPACE)[0] === ActionType.Trade ? message : this.messageFromServer(message.content));
            this.socketManager.sendPrivate(MESSAGE, socketId, messages);
        }
    }

    sendToOthersInChat(socketId: string, chat: Chat, message: Message): void {
        this.sendMessage(chat, message, socketId);
    }

    correctlyFormattedMessage(socketId: string, message: Message): Message {
        const name = this.socketIdToName.get(socketId);

        if (name) message.senderName = name;
        return message;
    }

    private configureSocket(): void {
        this.socketManager.on(MESSAGE, (message: Message) => {
            this.handleIncomingMessages(message);
        });
    }

    private sendMessage(chat: Chat, message: Message, socketId?: string): void {
        chat.userMessages.forEach((value: Message[], key: string) => {
            if (key !== socketId || !socketId) {
                value.push(message);
                this.socketManager.sendPrivate(MESSAGE, key, value);
            }
        });
    }

    // eslint-disable-next-line max-lines-per-function -- Ne fait que déterminer à qui renvoyer le message
    private async handleIncomingMessages(message: Message): Promise<void> {
        const chat = this.userToChat.get(message.senderId);

        message = this.correctlyFormattedMessage(message.senderId, message);

        if (chat) {
            await this.chatFilter.handleMessage(message);
            const messageType = this.chatFilter.messageType;

            switch (messageType) {
                case MessageType.All:
                    this.handleMessageToAll(chat, message);
                    break;
                case MessageType.SenderOnly:
                    await this.handleMessageToSender(chat, message);
                    break;
                case MessageType.Trade:
                    this.handleMessageTrade(chat, message);
                    break;
                default:
                    this.handleDefaultMessage(chat, message);
            }
        }
    }

    private handleMessageToAll(chat: Chat, message: Message) {
        this.sendToChat(chat, message);
        if (message.content === ActionType.SkipTurn) {
            try {
                this.gameplay.endPlayerTurn(message.senderId, new SkipTurn());
                // eslint-disable-next-line no-empty -- On ne veut rien faire en cas d'erreur
            } catch (error) {}
        }
    }

    private handleMessageTrade(chat: Chat, message: Message) {
        this.sendToUserInChat(message.senderId, chat, message);
        this.sendMessageToOther(message, chat, `${ActionType.Trade} ${message.content.split(SPACE)[1].length} lettres`);
    }

    private async handleMessageToSender(chat: Chat, message: Message) {
        if (message.content.includes(SKIP_TURN)) this.sendMessageToOther(message, chat, `${ActionType.SkipTurn}`);

        this.sendToUserInChat(message.senderId, chat, message);
        if (message.content === HINT_MESSAGE) {
            message.content = await this.gameplay.getHint(message.senderId);

            this.sendToUserInChat(message.senderId, chat, message);
        }
    }

    private handleDefaultMessage(chat: Chat, message: Message) {
        this.sendToUserInChat(message.senderId, chat, this.messageFromServer(MESSAGE_NOT_SEND));
    }

    private sendMessageToOther(message: Message, chat: Chat, messageContent: string) {
        const messageOther = {
            time: new Date(),
            senderId: message.senderId,
            content: messageContent,
            senderName: message.senderName,
        };

        this.sendToOthersInChat(messageOther.senderId, chat, messageOther);
    }
}
