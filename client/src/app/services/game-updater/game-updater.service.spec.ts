/* eslint-disable dot-notation -- Propriété/Méthode privée */
import { TestBed } from '@angular/core/testing';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import {
    FAKE_BOARD_UPDATE,
    FAKE_EASEL_UPDATE,
    FAKE_GAME_UPDATE,
    FAKE_GOAL_UPDATE,
    FAKE_HIDDEN_OTHER_GOAL,
    FAKE_OTHER_PRIVATE_GOAL,
    FAKE_PRIVATE_GOAL,
    FAKE_PUBLIC_GOAL,
} from '@app/test/constants/fake-game-update';
import { SocketTestHelper } from '@app/test/mocks/socket-helper/socket-test-helper';
import { BOARD_UPDATE, EASEL_UPDATE, GAME_UPDATE, GOAL_UPDATE } from '@common/constants/communication';
import { Socket } from 'socket.io-client';

describe('GameUpdaterService', () => {
    let service: GameUpdaterService;
    let clientFakeSocket: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [SocketClientService] });
        service = TestBed.inject(GameUpdaterService);
        clientFakeSocket = new SocketTestHelper();

        service.socketService['socket'] = clientFakeSocket as unknown as Socket;

        service['configureSocket']();

        clientFakeSocket['callbacks'].get(GAME_UPDATE)?.[0](FAKE_GAME_UPDATE());
        clientFakeSocket['callbacks'].get(BOARD_UPDATE)?.[0](FAKE_BOARD_UPDATE());
        clientFakeSocket['callbacks'].get(EASEL_UPDATE)?.[0](FAKE_EASEL_UPDATE());
        clientFakeSocket['callbacks'].get(GOAL_UPDATE)?.[0](FAKE_GOAL_UPDATE());
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update value of gameUpdate when the game_update event is emit from server', () => {
        expect(service['gameUpdate']).toEqual(FAKE_GAME_UPDATE());
    });

    it('should give board', () => expect(service.board).toEqual(FAKE_BOARD_UPDATE().board));

    it('should give easel', () => expect(service.easel).toEqual(FAKE_EASEL_UPDATE().easel));

    it('should give player info', () => expect(service.playerInfo).toEqual(FAKE_GAME_UPDATE().playerInfo));

    it('should give otherPlayerInfo', () => expect(service.otherPlayerInfo).toEqual(FAKE_GAME_UPDATE().otherInfo));

    it('should give stash', () => expect(service.stash).toEqual(FAKE_GAME_UPDATE().stash));

    it('should give myGoal', () => expect(service.myGoal).toEqual(FAKE_PRIVATE_GOAL()));

    it('should give otherGoal', () => expect(service.otherGoal).toEqual(FAKE_OTHER_PRIVATE_GOAL()));

    it('should give publicGoals', () => expect(service.publicGoals).toEqual(FAKE_PUBLIC_GOAL()));

    it('otherGoal should return undefined when there is no goal', () => {
        clientFakeSocket['callbacks'].get(GOAL_UPDATE)?.[0](FAKE_HIDDEN_OTHER_GOAL());
        expect(service.otherGoal).toEqual([]);
    });
});
