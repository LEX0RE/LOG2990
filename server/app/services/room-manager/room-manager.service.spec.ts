import { LOBBY } from '@app/constants/miscellaneous';
import { RoomManager } from '@app/services/room-manager/room-manager.service';
import { FAKE_SOCKET_ID_PLAYER_1 } from '@app/test/constants/fake-player';
import { ROOM_ONE } from '@app/test/constants/fake-room-id';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { expect } from 'chai';
import { assert, restore, spy, stub } from 'sinon';

describe('RoomManager', () => {
    let roomManager: RoomManager;
    let stubs: ServiceStubHelper;

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        roomManager = new RoomManager();
    });

    afterEach(() => restore());

    it('should create a simple room Manager', () => {
        expect(roomManager).to.not.be.eql(undefined);
    });

    it('sendToLobby should call join room for lobby', () => {
        const spyJoin = stub(stubs.socketManager, 'join');

        roomManager.sendToLobby(FAKE_SOCKET_ID_PLAYER_1);
        assert.calledOnceWithExactly(spyJoin, FAKE_SOCKET_ID_PLAYER_1, LOBBY);
    });

    it('leaveLobby should call leave room for lobby', () => {
        const spyLeave = stub(stubs.socketManager, 'leave');

        roomManager.leaveLobby(FAKE_SOCKET_ID_PLAYER_1);
        assert.calledOnceWithExactly(spyLeave, FAKE_SOCKET_ID_PLAYER_1, LOBBY);
    });

    it('createRoom should create a room and return its index if no other room exists', () => {
        const indexRoom = roomManager.createRoom();

        expect(indexRoom).to.equal('1');
        expect(roomManager.rooms.length).to.equal(1);
    });

    it('createRoom should create a room and return its index if other rooms exist', () => {
        roomManager.rooms.push(ROOM_ONE);
        const indexRoom = roomManager.createRoom();

        expect(indexRoom).to.equal('2');
        expect(roomManager.rooms.length).to.equal(2);
    });

    it('joinRoom should call createRoom if room has new id', () => {
        const spyCreateRoom = spy(roomManager, 'createRoom');

        roomManager.joinRoom(FAKE_SOCKET_ID_PLAYER_1, ROOM_ONE);
        assert.calledOnce(spyCreateRoom);
    });

    it('joinRoom should not call createRoom if room has already id', () => {
        const spyCreateRoom = spy(roomManager, 'createRoom');

        roomManager.rooms.push(ROOM_ONE);
        roomManager.joinRoom(FAKE_SOCKET_ID_PLAYER_1, ROOM_ONE);
        assert.notCalled(spyCreateRoom);
    });

    it('user should be able to join room if there is one person', () => {
        stub(stubs.socketManager, 'getRoomsFromUser').returns([FAKE_SOCKET_ID_PLAYER_1]);
        stub(stubs.socketManager, 'getRoomSize').returns(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour stub les membres prives
        const spyAddUserInRoom = spy(roomManager, 'addUserInRoom' as any);

        roomManager.joinRoom(FAKE_SOCKET_ID_PLAYER_1, ROOM_ONE);
        assert.calledOnce(spyAddUserInRoom);
    });

    it('user should not be able to join room if room is full', () => {
        stub(stubs.socketManager, 'getRoomsFromUser').returns([FAKE_SOCKET_ID_PLAYER_1]);
        stub(stubs.socketManager, 'getRoomSize').returns(2);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour stub les membres prives
        const spyAddUserInRoom = spy(roomManager, 'addUserInRoom' as any);

        roomManager.joinRoom(FAKE_SOCKET_ID_PLAYER_1, ROOM_ONE);
        assert.notCalled(spyAddUserInRoom);
    });

    it('deleteRoom should delete room from rooms and delete user to room', () => {
        roomManager.rooms.push(ROOM_ONE);
        roomManager.userRoom.set('232', ROOM_ONE);
        roomManager.userRoom.set('23', '2');
        roomManager.deleteRoom(ROOM_ONE);
        expect(roomManager.rooms.length).to.be.eql(0);
        expect(roomManager.userRoom.size).to.be.eql(1);
    });

    it('user should be able to join room if there is one person and remove extra rooms', () => {
        stub(stubs.socketManager, 'getRoomsFromUser').returns(['1', '2']);
        stub(stubs.socketManager, 'getRoomSize').returns(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour stub les membres prives
        const spyAddUserInRoom = spy(roomManager, 'addUserInRoom' as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour stub les membres prives
        const removeUnnecessaryRooms = spy(roomManager, 'removeUnnecessaryRooms' as any);

        roomManager.joinRoom(FAKE_SOCKET_ID_PLAYER_1, ROOM_ONE);
        assert.calledOnce(spyAddUserInRoom);
        assert.calledOnce(removeUnnecessaryRooms);
    });
});
