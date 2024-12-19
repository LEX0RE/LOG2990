import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ViewLetter } from '@app/classes/view-letter';
import { EaselSelectionType } from '@app/enum/easel-selection-type';
import { EndGameService } from '@app/services/end-game/end-game.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { SocketClientServiceMock } from '@app/test/mocks/socket-client-mock';
import { SocketTestHelper } from '@app/test/mocks/socket-helper/socket-test-helper';
import { END_GAME, GET_EASEL } from '@common/constants/communication';
import { GamePossibility } from '@common/enums/game-possibility';
import { EaselPlayer } from '@common/interfaces/easel-player';
import { Socket } from 'socket.io-client';

describe('EndGameService', () => {
    let service: EndGameService;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();

        // eslint-disable-next-line dot-notation -- Propriété privée
        socketServiceMock['socket'] = socketHelper as unknown as Socket;
        await TestBed.configureTestingModule({
            imports: [FormsModule],
            providers: [{ provide: SocketClientService, useValue: socketServiceMock }],
            declarations: [],
        }).compileComponents();
    });

    beforeEach(() => {
        service = TestBed.inject(EndGameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change victory value from decision when receiving a victory from the server', () => {
        const victory = GamePossibility.Win;
        // eslint-disable-next-line dot-notation -- Membre privé
        const sendSpy = spyOn(service['socketService'], 'send');
        const viewLetter = new ViewLetter({ letter: 'a', point: 2 }, EaselSelectionType.Unselected);

        // eslint-disable-next-line dot-notation -- Membre privé
        service['easelService'].viewLetters = [viewLetter];

        const expectedValue: EaselPlayer = { easel: [viewLetter.toCommonLetter], playerId: socketServiceMock.socketId };

        socketHelper.peerSideEmit(END_GAME, victory);
        expect(service.decision).toEqual(victory);
        expect(sendSpy).toHaveBeenCalledWith(GET_EASEL, expectedValue);
    });

    it('reset should set decision to NotFinish', () => {
        service.decision = GamePossibility.Win as GamePossibility;
        service.reset();
        expect(service.decision).toBe(GamePossibility.NotFinish);
    });
});
