/* eslint-disable dot-notation -- Propriété/Méthode privée */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NewGame } from '@app/interface/new-game';
import { NewSoloGame } from '@app/interface/new-solo-game';
import { GamePageComponent } from '@app/pages/game/game-page.component';
import { WaitingForPlayerPageComponent } from '@app/pages/waiting-for-player/waiting-for-player-page.component';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { ExchangeServicePlayer1POV } from '@app/services/initialize-game-exchange/player-1/initialize-game-player-1-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { DO_NOTHING_WITH_PARAMETERS } from '@app/test/constants/do-nothing-function';
import { SocketTestHelper } from '@app/test/mocks/socket-helper/socket-test-helper';
import { gameUpdaterStub } from '@app/test/mocks/stubs/game-updater-stub';
import { NewGameServiceStub } from '@app/test/mocks/stubs/new-game-configuration-service-stub';
import {
    CANCEL_GAME_CREATION,
    CREATE_GAME,
    CREATE_SOLO_GAME,
    GAME_CREATION_CONFIRM,
    HELLO_SOMEONE_IS_TRYING_TO_JOIN,
    JOIN_GAME_CONFIRMATION_PLAYER1,
    PLAYER_JOINING_CANCELED,
    REJECT_THAT_PLAYER_FROM_JOINING,
} from '@common/constants/communication';
import { CLASSIC } from '@common/constants/game-modes';
import { Difficulty } from '@common/enums/difficulty';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';
import { JoinGameInfo } from '@common/interfaces/join-game';
import { Socket } from 'socket.io-client';

describe('ExchangeServicePlayer1POV', () => {
    let service: ExchangeServicePlayer1POV;
    let clientFakeSocket: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    { path: 'game', component: GamePageComponent },
                    { path: 'waitingForPlayer', component: WaitingForPlayerPageComponent },
                ]),
            ],
            providers: [
                { provide: NewGameConfigurationService, useValue: new NewGameServiceStub() },
                { provide: GameUpdaterService, useValue: gameUpdaterStub() },
            ],
        });
        service = TestBed.inject(ExchangeServicePlayer1POV);
        clientFakeSocket = new SocketTestHelper();

        service['socketService']['socket'] = clientFakeSocket as unknown as Socket;
        service.configureSocket();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle game creation when it succeeded', () => {
        const spy = spyOn(service['router'], 'navigate').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        clientFakeSocket['callbacks'].get(GAME_CREATION_CONFIRM)?.[0](true);
        expect(spy).toHaveBeenCalledOnceWith(['waitingForPlayer']);
    });

    it('should handle game creation when it failed', () => {
        clientFakeSocket['callbacks'].get(GAME_CREATION_CONFIRM)?.[0](false);

        expect(service['newGameConfigurationService'].openErrorCreatingGameOverlay).toBeTrue();
    });

    it('should handle when someone is trying to join', () => {
        expect(service.otherPlayerInfo).toBeNull();
        const fakeJoinGameInfo: JoinGameInfo = { gameId: '12', player1SocketId: '1234', player2SocketId: '4321', playerName: 'James' };

        clientFakeSocket['callbacks'].get(HELLO_SOMEONE_IS_TRYING_TO_JOIN)?.[0](fakeJoinGameInfo);
        expect(service.otherPlayerInfo).toBe(fakeJoinGameInfo);
    });

    it('should handle when someone is trying to join', () => {
        const fakeJoinGameInfo: JoinGameInfo = { gameId: '12', player1SocketId: '1234', player2SocketId: '4321', playerName: 'James' };

        service.otherPlayerInfo = fakeJoinGameInfo;

        clientFakeSocket['callbacks'].get(PLAYER_JOINING_CANCELED)?.[0]({});
        expect(service.otherPlayerInfo).toBeNull();
    });

    it('should handle join game confirmation when it succeeded', () => {
        const spy = spyOn(service['router'], 'navigate').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        clientFakeSocket['callbacks'].get(JOIN_GAME_CONFIRMATION_PLAYER1)?.[0](true);
        expect(spy).toHaveBeenCalledOnceWith(['game']);
    });

    it('should handle join game confirmation when it failed and set errorStartingGame property to true', () => {
        service.errorStartingGame = false;

        const spy = spyOn(service['router'], 'navigate').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        clientFakeSocket['callbacks'].get(JOIN_GAME_CONFIRMATION_PLAYER1)?.[0](false);
        expect(spy).not.toHaveBeenCalled();
        expect(service.errorStartingGame).toBeTrue();
    });

    it('should create a new game and send it', () => {
        const fakeNewForm = { value: { dictionary: 'french', playerName: 'James' } };
        const fakeTurnTime: CommonTimer = { minute: 1, second: 0 };
        const socketId = '1234';

        Object.defineProperty(service['socketService'], 'socketId', { value: socketId });

        service['newGameConfigurationService'].gameMode = CLASSIC;
        const expectedGame: NewGame = {
            dictionaryTitle: 'french',
            dictionaryId: -1,
            gameModeName: CLASSIC,
            gameId: '',
            player1SocketId: socketId,
            player1Name: 'James',
            turnTimer: fakeTurnTime,
        };

        const sendSpy = spyOn(service['socketService'], 'send');

        service.createGame(fakeNewForm as FormGroup, fakeTurnTime);
        expect(sendSpy).toHaveBeenCalledOnceWith(CREATE_GAME, expectedGame);
    });

    it('should accept player', () => {
        service['newGameConfigurationService'].gameInfo = new FormGroup({
            playerName: new FormControl(''),
            dictionary: new FormControl(''),
            turnDuration: new FormControl(''),
        });
        const fakeJoinGameInfo: JoinGameInfo = { gameId: '12', player1SocketId: '1234', player2SocketId: '4321', playerName: 'James' };

        service.acceptPlayer();
        service.otherPlayerInfo = fakeJoinGameInfo;

        const sendSpy = spyOn(service['socketService'], 'send');

        service.acceptPlayer();
        expect(sendSpy).toHaveBeenCalledTimes(2);
    });

    it('should reject player', () => {
        const fakeJoinGameInfo: JoinGameInfo = { gameId: '12', player1SocketId: '1234', player2SocketId: '4321', playerName: 'James' };

        service.otherPlayerInfo = fakeJoinGameInfo;

        const sendSpy = spyOn(service['socketService'], 'send');

        service.rejectOtherPlayer();
        expect(sendSpy).toHaveBeenCalledOnceWith(REJECT_THAT_PLAYER_FROM_JOINING, fakeJoinGameInfo);
    });

    it('should cancel game when a player has joined', () => {
        const fakeJoinGameInfo: JoinGameInfo = { gameId: '12', player1SocketId: '1234', player2SocketId: '4321', playerName: 'James' };

        service.otherPlayerInfo = fakeJoinGameInfo;

        const sendSpy = spyOn(service['socketService'], 'send');

        service.cancelGame();
        expect(sendSpy).toHaveBeenCalledOnceWith(CANCEL_GAME_CREATION, fakeJoinGameInfo);
        expect(service.otherPlayerInfo).toBeNull();
    });

    it('should cancel game', () => {
        service.otherPlayerInfo = null;
        const socketId = '1234';

        Object.defineProperty(service['socketService'], 'socketId', { value: socketId });

        const sendSpy = spyOn(service['socketService'], 'send');

        service.cancelGame();
        expect(sendSpy).toHaveBeenCalledOnceWith(CANCEL_GAME_CREATION, socketId);
        expect(service.otherPlayerInfo).toBeNull();
    });

    it('should create a new solo game and send it', () => {
        const fakeNewForm = { value: { dictionary: 'french', playerName: 'James' } };
        const fakeTurnTime: CommonTimer = { minute: 1, second: 0 };
        const socketId = '1234';

        Object.defineProperty(service['socketService'], 'socketId', { value: socketId });

        service['newGameConfigurationService'].gameMode = CLASSIC;
        const expectedGame: NewSoloGame = {
            dictionaryTitle: 'french',
            dictionaryId: -1,
            gameModeName: CLASSIC,
            gameId: '',
            player1SocketId: socketId,
            player1Name: 'James',
            turnTimer: fakeTurnTime,
            player2Name: '',
            player2Difficulty: Difficulty.Easy,
        };

        const sendSpy = spyOn(service['socketService'], 'send');

        service.createSoloGame(fakeNewForm as FormGroup, fakeTurnTime, Difficulty.Easy);
        expect(sendSpy).toHaveBeenCalledOnceWith(CREATE_SOLO_GAME, expectedGame);
    });

    it('handleIncomingJoinGame should do nothing if otherPlayerInfo is not undefined', () => {
        const fakeJoinGameInfo: JoinGameInfo = { gameId: '12', player1SocketId: '1234', player2SocketId: '4321', playerName: 'James' };

        service.otherPlayerInfo = fakeJoinGameInfo;

        service['handleIncomingJoinGame']({} as unknown as JoinGameInfo);
        expect(service.otherPlayerInfo).toEqual(fakeJoinGameInfo);
    });

    it('closeErrorStartingGameOverlay should set errorStartingGame property to false', () => {
        service.errorStartingGame = true;

        service['closeErrorOverlay']();
        expect(service.errorStartingGame).toBeFalse();
    });
});
