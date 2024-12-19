import { Player } from '@app/classes/players/player-abstract';
import { ChatManager } from '@app/services/chat-manager/chat-manager.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { RoomManager } from '@app/services/room-manager/room-manager.service';
import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { MAX_TIME_BEFORE_KICK, MIN_PER_ROOM, RECONNECTION } from '@common/constants/communication';
import { Message } from '@common/interfaces/message';
import { Container, Service } from 'typedi';

@Service()
export class ReconnectionManager {
    private roomManager: RoomManager;
    private socketManager: SocketManager;
    private chatManager: ChatManager;
    private gameManager: GameManager;
    private inWaitingForDisconnect: Set<string>;

    constructor() {
        this.roomManager = Container.get(RoomManager);
        this.socketManager = Container.get(SocketManager);
        this.chatManager = Container.get(ChatManager);
        this.gameManager = Container.get(GameManager);
        this.inWaitingForDisconnect = new Set<string>();
        this.configureSocket();
    }

    configureSocket(): void {
        this.socketManager.on(RECONNECTION, (message: Message) => {
            if (message.content) this.reconnectUser(message);
        });

        this.socketManager.disconnect((socketId: string) => {
            this.waitRemove(socketId);
        });
    }

    async waitRemove(socketId: string): Promise<void> {
        this.inWaitingForDisconnect.add(socketId);
        setTimeout(() => {
            if (this.inWaitingForDisconnect.has(socketId)) {
                const game = this.gameManager.getGameByPlayerId(socketId);

                if (game) game.watchTower.endGameManager.giveUpHandler(socketId);
            }
        }, MAX_TIME_BEFORE_KICK);
    }

    removeUser(socketId: string): void {
        const roomId = this.roomManager.userRoom.get(socketId);

        if (roomId) {
            this.socketManager.leave(socketId, roomId);
            this.removeChat(roomId);
            this.inWaitingForDisconnect.delete(socketId);

            if (this.socketManager.getRoomSize(roomId) <= MIN_PER_ROOM) this.roomManager.deleteRoom(roomId);
        }
        if (this.roomManager.userRoom.has(socketId)) this.roomManager.userRoom.delete(socketId);
    }

    reconnectUser(message: Message): void {
        if (!this.socketManager.isConnected(message.content)) {
            const roomId = this.roomManager.userRoom.get(message.content);

            this.inWaitingForDisconnect.delete(message.content);
            if (roomId) {
                this.roomManager.joinRoom(message.senderId, roomId);
                this.reconnectChat(message.content, message.senderId, roomId);
                this.reconnectGame(message.content, message.senderId);
            }
        }
    }

    private reconnectGame(oldSocketId: string, newSocketId: string): void {
        const game = this.gameManager.getGameByPlayerId(oldSocketId);

        if (!game) return;
        game.players.forEach((player: Player) => {
            if (player.id === oldSocketId) {
                player.id = newSocketId;
                game.watchTower.updateEasel(player);
            }
        });
        game.watchTower.update();
        game.events.emit(RECONNECTION, game);
    }

    private reconnectChat(oldSocketId: string, newSocketId: string, roomId: string): void {
        this.reconnectIdToName(oldSocketId, newSocketId);
        this.reconnectUserToChat(oldSocketId, newSocketId, roomId);
        this.reconnectDisplayMessages(newSocketId);
    }

    private reconnectIdToName(oldSocketId: string, newSocketId: string): void {
        const name = this.chatManager.socketIdToName.get(oldSocketId);

        if (name) {
            this.chatManager.socketIdToName.set(newSocketId, name);
            this.chatManager.socketIdToName.delete(oldSocketId);
        }
    }

    private reconnectUserToChat(oldSocketId: string, newSocketId: string, roomId: string): void {
        const chat = this.chatManager.getChatIfExist(roomId);

        if (!chat) return;

        const previousMessages = chat.userMessages.get(oldSocketId);

        if (previousMessages) {
            chat.userMessages.set(newSocketId, previousMessages);
            this.chatManager.userToChat.set(newSocketId, chat);
        }
        chat.userMessages.delete(oldSocketId);
        this.chatManager.userToChat.delete(oldSocketId);
    }

    private reconnectDisplayMessages(newSocketId: string): void {
        const chat = this.chatManager.userToChat.get(newSocketId);

        if (chat) {
            const message: Message = { time: new Date(), senderId: '', senderName: '', content: '' };

            this.chatManager.sendToUserInChat(newSocketId, chat, message);
        }
    }

    private removeChat(roomId: string): void {
        if (this.socketManager.getRoomSize(roomId) <= MIN_PER_ROOM) this.chatManager.deleteChat(roomId);
    }
}
