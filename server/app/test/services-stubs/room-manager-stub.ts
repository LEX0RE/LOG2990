import { RoomManager } from '@app/services/room-manager/room-manager.service';
import { FAKE_SOCKET_ID_PLAYER_1 } from '@app/test/constants/fake-player';
import { ROOM_ONE } from '@app/test/constants/fake-room-id';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

export const stubRoomManager = (): SinonStubbedInstance<RoomManager> => {
    const service = createStubInstance(RoomManager);

    service.rooms = [ROOM_ONE];
    service.userRoom = new Map<string, string>();
    service.userRoom.set(FAKE_SOCKET_ID_PLAYER_1, ROOM_ONE);

    return service;
};
