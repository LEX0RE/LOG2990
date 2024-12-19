/* eslint-disable dot-notation -- Propriété/Méthode privée */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GamePageComponent } from '@app/pages/game/game-page.component';
import { WaitingForPlayerPageComponent } from '@app/pages/waiting-for-player/waiting-for-player-page.component';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { ExchangePlayer2PovService } from '@app/services/initialize-game-exchange/player-2/initialize-game-player-2-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { DO_NOTHING_WITH_PARAMETERS } from '@app/test/constants/do-nothing-function';
import { SocketTestHelper } from '@app/test/mocks/socket-helper/socket-test-helper';
import { gameUpdaterStub } from '@app/test/mocks/stubs/game-updater-stub';
import { NewGameServiceStub } from '@app/test/mocks/stubs/new-game-configuration-service-stub';
import {
    AVAILABLE_GAMES,
    CANCEL_JOIN_REQUEST,
    GET_AVAILABLE_GAME,
    HEY_I_WANNA_JOIN_THIS_GAME,
    JOIN_GAME_CONFIRMATION_PLAYER2,
    YOU_WERE_REJECTED,
} from '@common/constants/communication';
import { CLASSIC } from '@common/constants/game-modes';
import { CommonGameConfig } from '@common/interfaces/common-game-config';
import { JoinGameInfo } from '@common/interfaces/join-game';
import { Socket } from 'socket.io-client';

describe('InitializeGameExchangeServicePlayer2POV', () => {
    let service: ExchangePlayer2PovService;
    let clientFakeSocket: SocketTestHelper;
    let fakeCommonGameConfig: CommonGameConfig;
    let configurationService: NewGameServiceStub;
    const gameId = '12';

    beforeEach(() => {
        configurationService = new NewGameServiceStub();
        configurationService.gameMode = CLASSIC;
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    { path: 'game', component: GamePageComponent },
                    { path: 'waitingForPlayer', component: WaitingForPlayerPageComponent },
                ]),
            ],
            providers: [
                { provide: NewGameConfigurationService, useValue: configurationService },
                { provide: GameUpdaterService, useValue: gameUpdaterStub() },
            ],
        });
        service = TestBed.inject(ExchangePlayer2PovService);
        clientFakeSocket = new SocketTestHelper();

        service['socketService']['socket'] = clientFakeSocket as unknown as Socket;
        service.configureSocket();

        fakeCommonGameConfig = {
            dictionaryTitle: 'Français',
            dictionaryId: 0,
            gameModeName: CLASSIC,
            turnTimer: { minute: 1, second: 0 },
            player1Name: 'James',
            gameId,
            player1SocketId: '1234',
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle receiving available games', () => {
        clientFakeSocket['callbacks'].get(AVAILABLE_GAMES)?.[0]([fakeCommonGameConfig]);
        expect(service.availableGames).toEqual([fakeCommonGameConfig]);
    });

    it('should handle join game confirmation when it succeeded', () => {
        const spy = spyOn(service['router'], 'navigate').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        clientFakeSocket['callbacks'].get(JOIN_GAME_CONFIRMATION_PLAYER2)?.[0](true);
        expect(spy).toHaveBeenCalledOnceWith(['game']);
    });

    it('should handle join game confirmation when it failed', () => {
        const spy = spyOn(service['router'], 'navigate').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        clientFakeSocket['callbacks'].get(JOIN_GAME_CONFIRMATION_PLAYER2)?.[0](false);
        expect(spy).not.toHaveBeenCalled();

        expect(service['joiningGameService'].isErrorGameStart).toBeTrue();
    });
    it('should handle rejection', () => {
        const spy = spyOn(service['router'], 'navigate').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        clientFakeSocket['callbacks'].get(YOU_WERE_REJECTED)?.[0]({});
        expect(spy).toHaveBeenCalledOnceWith(['joinGame']);
        expect(service.hasBeenRejected).toBeTrue();
    });

    it('should handler trying to join a game', () => {
        const name = 'James';
        const socketId = '1234';

        Object.defineProperty(service['socketService'], 'socketId', { value: socketId });
        const fakeJoinGameInfo: JoinGameInfo = { gameId, player1SocketId: '', player2SocketId: socketId, playerName: name };

        service.availableGames = [
            fakeCommonGameConfig,
            {
                dictionaryTitle: 'Français',
                dictionaryId: 0,
                gameModeName: CLASSIC,
                turnTimer: { minute: 1, second: 0 },
                player1Name: 'James',
                gameId: 'other_game_id',
                player1SocketId: '1234',
            },
        ];

        const spy = spyOn(service['router'], 'navigate').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        const sendSpy = spyOn(service['socketService'], 'send');

        service.tryJoinGame(gameId, name);
        expect(sendSpy).toHaveBeenCalledOnceWith(HEY_I_WANNA_JOIN_THIS_GAME, fakeJoinGameInfo);
        expect(spy).toHaveBeenCalledOnceWith(['waitingForGameStart']);
        expect(service.gameTryingToJoin).toEqual(fakeCommonGameConfig);
    });

    it('should send cancel join game', () => {
        service.gameTryingToJoin = fakeCommonGameConfig;

        const sendSpy = spyOn(service['socketService'], 'send');

        service.cancelJoiningGame();
        expect(sendSpy).toHaveBeenCalledOnceWith(CANCEL_JOIN_REQUEST, fakeCommonGameConfig);
    });

    it('should send get available games', () => {
        const socketId = '1234';

        Object.defineProperty(service['socketService'], 'socketId', { value: socketId });

        const sendSpy = spyOn(service['socketService'], 'send');

        service.getAvailableGames();
        expect(sendSpy).toHaveBeenCalledOnceWith(GET_AVAILABLE_GAME, socketId);
    });

    it('should close the overlay by setting false', () => {
        service.hasBeenRejected = true;
        service.closeRejectedOverlay();
        expect(service.hasBeenRejected).toBeFalse();
    });

    it('should handler trying to join a game with available games null', () => {
        const name = 'James';
        const socketId = '1234';

        Object.defineProperty(service['socketService'], 'socketId', { value: socketId });
        const fakeJoinGameInfo: JoinGameInfo = { gameId, player1SocketId: '', player2SocketId: socketId, playerName: name };

        service.availableGames = [];

        const spy = spyOn(service['router'], 'navigate').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        const sendSpy = spyOn(service['socketService'], 'send');

        service.tryJoinGame(gameId, name);
        expect(sendSpy).toHaveBeenCalledOnceWith(HEY_I_WANNA_JOIN_THIS_GAME, fakeJoinGameInfo);
        expect(spy).toHaveBeenCalledOnceWith(['waitingForGameStart']);
    });
});
