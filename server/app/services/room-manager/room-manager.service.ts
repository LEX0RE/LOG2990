import { LOBBY } from '@app/constants/miscellaneous';
import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { MAX_PER_ROOM, MAX_ROOM_PER_USER } from '@common/constants/communication';
import { Container, Service } from 'typedi';

@Service()
export class RoomManager {
    rooms: string[];
    userRoom: Map<string, string>;
    private socketService: SocketManager;

    constructor() {
        this.rooms = [];
        this.userRoom = new Map<string, string>();
        this.socketService = Container.get(SocketManager);
    }

    deleteRoom(roomId: string): void {
        this.rooms = this.rooms.filter((room: string) => room !== roomId);
        const usersToRemoved: string[] = [];

        this.userRoom.forEach((room: string, socketId: string) => {
            if (room === roomId) usersToRemoved.push(socketId);
        });
        usersToRemoved.forEach((user: string) => this.userRoom.delete(user));
    }

    createRoom(): string {
        let index = '1';

        while (this.rooms.includes(index)) {
            index = (parseInt(index, 10) + 1).toString();
        }

        this.rooms.push(index);
        return index;
    }

    joinRoom(socketId: string, roomId?: string): void {
        if (!roomId || !this.rooms.includes(roomId)) roomId = this.createRoom();
        if (this.socketService.getRoomSize(roomId) < MAX_PER_ROOM) {
            if (this.socketService.getRoomsFromUser(socketId).length >= MAX_ROOM_PER_USER) this.removeUnnecessaryRooms(socketId, roomId);
            this.addUserInRoom(socketId, roomId);
        }
    }

    sendToLobby(socketId: string): void {
        this.socketService.join(socketId, LOBBY);
    }

    leaveLobby(socketId: string): void {
        this.socketService.leave(socketId, LOBBY);
    }

    private addUserInRoom(socketId: string, roomId: string): void {
        this.socketService.join(socketId, roomId);
        this.userRoom.set(socketId, roomId);
    }

    private removeUnnecessaryRooms(socketId: string, roomId: string): void {
        this.socketService.getRoomsFromUser(socketId).forEach((room: string) => {
            if (room !== roomId && room !== socketId) {
                this.socketService.leave(socketId, room);
            }
        });
    }
}
