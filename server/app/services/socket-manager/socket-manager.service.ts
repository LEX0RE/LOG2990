import { Server } from '@app/server';
import { CONNECTION, DISCONNECT } from '@common/constants/communication';
import * as io from 'socket.io';
import { Service } from 'typedi';
@Service()
export class SocketManager {
    private sio: io.Server;

    constructor(server: Server) {
        this.sio = new io.Server(server.server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.sio.setMaxListeners(0);
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.sio.on(CONNECTION, (socket) => {
            const actionErrorWarp = (data: T): void => {
                try {
                    action(data);
                    // eslint-disable-next-line no-empty -- On ne veut rien faire en cas d'erreur
                } catch (error) {}
            };

            socket.on(event, actionErrorWarp);
        });
    }

    disconnect(action: (id: string) => void): void {
        this.sio.on(CONNECTION, (socket) => {
            socket.on(DISCONNECT, () => {
                action(socket.id);
            });
        });
    }

    send<T>(event: string, data?: T): void {
        if (data) this.sio.emit(event, data);
        else this.sio.emit(event);
    }

    sendPrivate<T>(event: string, socketId: string, data?: T): void {
        const socket = this.sio.sockets.sockets.get(socketId);

        if (socket) {
            if (data) socket.emit(event, data);
            else socket.emit(event);
        }
    }

    to<T>(event: string, room: string, data?: T): void {
        if (data) this.sio.to(room).emit(event, data);
        else this.sio.to(room).emit(event);
    }

    join(socketId: string, room: string): void {
        const socket = this.sio.sockets.sockets.get(socketId);

        if (socket) socket.join(room);
    }

    leave(socketId: string, room: string): void {
        const socket = this.sio.sockets.sockets.get(socketId);

        if (socket) socket.leave(room);
    }

    getRoomsFromUser(socketId: string): string[] {
        const socket = this.sio.sockets.sockets.get(socketId);

        if (socket) return Array.from(socket.rooms);
        return [];
    }

    getUsersFromRoom(room: string): string[] {
        const socket = this.sio.sockets.adapter.rooms.get(room);

        if (socket) return Array.from(socket);
        return [];
    }

    getRoomSize(room: string): number {
        const roomSocket = this.sio.sockets.adapter.rooms.get(room);

        if (!roomSocket) return 0;
        return roomSocket.size;
    }

    isConnected(socketId: string): boolean {
        const socket = this.sio.sockets.sockets.get(socketId);

        if (socket) return socket.connected;
        return false;
    }
}
