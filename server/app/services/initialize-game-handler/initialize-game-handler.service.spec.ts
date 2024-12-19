import { Player } from '@app/classes/players/player-abstract';
import { RealPlayer } from '@app/classes/players/real-player/real-player';
import { WaitingGame } from '@app/interface/waiting-game';
import { InitializeGameHandler } from '@app/services/initialize-game-handler/initialize-game-handler.service';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { CANCEL_JOIN_REQUEST, HEY_I_WANNA_JOIN_THIS_GAME, REJECT_THAT_PLAYER_FROM_JOINING } from '@common/constants/communication';
import { CLASSIC } from '@common/constants/game-modes';
import { CommonGameConfig } from '@common/interfaces/common-game-config';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';
import { JoinGameInfo } from '@common/interfaces/join-game';
import { expect } from 'chai';
import { assert, createStubInstance, restore, stub } from 'sinon';

describe('InitializeGameHandler', () => {
    let initializeGameHandler: InitializeGameHandler;
    let stubs: ServiceStubHelper;
    const player1SocketId = '1234';
    const player2SocketId = '43322';
    const player1Name = 'James';
    const gameId = 'room_id';
    let fakeJoinInfo: JoinGameInfo;
    let fakeAvailableGames: WaitingGame[];
    let fakeCommonGameConfig: CommonGameConfig;
    let fakeGameConfig: CommonGameConfig;
    const dictTitle = 'Français';
    const commonTimer: CommonTimer = { minute: 1, second: 0 };

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        stubs.gameManager.waitingGames = [];
        fakeJoinInfo = { gameId, playerName: player1Name, player1SocketId, player2SocketId };
        fakeCommonGameConfig = {
            dictionaryTitle: dictTitle,
            dictionaryId: 0,
            gameModeName: CLASSIC,
            gameId,
            player1SocketId,
            player1Name,
            turnTimer: commonTimer,
        };
        const player = createStubInstance(RealPlayer);

        player.name = player1Name;
        fakeGameConfig = {
            dictionaryTitle: dictTitle,
            dictionaryId: 0,
            turnTimer: commonTimer,
            player1Name,
            player1SocketId,
            gameId,
            gameModeName: CLASSIC,
        };
        fakeAvailableGames = [
            { gameConfig: fakeGameConfig, gameId, player: player as unknown as Player, isWaitingForConfirmation: false },
            { gameConfig: fakeGameConfig, gameId, player: player as unknown as Player, isWaitingForConfirmation: true },
        ];
        initializeGameHandler = new InitializeGameHandler();
        stub(stubs.socketManager, 'sendPrivate');
    });

    afterEach(() => restore());

    it('should create simple initializeGameHandler', () => {
        expect(initializeGameHandler).to.not.be.eql(undefined);
    });

    it('should handle a request to join a game', () => {
        stubs.gameManager.getWaitingGame.callsFake(() => fakeAvailableGames[0]);
        stubs.clientSocket.emit(HEY_I_WANNA_JOIN_THIS_GAME, fakeJoinInfo);
        assert.calledOnceWithExactly(stubs.gameManager.getWaitingGame, fakeJoinInfo.gameId);
        assert.called(stubs.multiplayerGameFactory.availableGamesUpdate);
        expect(fakeAvailableGames[0].isWaitingForConfirmation).to.be.eql(true);
    });

    it('should handle a request to join a game where the game is now not available', () => {
        stubs.gameManager.getWaitingGame.callsFake(() => undefined);
        stubs.clientSocket.emit(HEY_I_WANNA_JOIN_THIS_GAME, fakeJoinInfo);
        assert.calledOnceWithExactly(stubs.gameManager.getWaitingGame, fakeJoinInfo.gameId);
        assert.called(stubs.multiplayerGameFactory.availableGamesUpdate);
        expect(fakeAvailableGames[0].isWaitingForConfirmation).to.be.eql(false);
    });

    it('should handle a request to join a game where the game is waiting confirmation from another player', () => {
        stubs.gameManager.getWaitingGame.callsFake(() => fakeAvailableGames[1]);
        stubs.clientSocket.emit(HEY_I_WANNA_JOIN_THIS_GAME, fakeJoinInfo);
        assert.calledOnceWithExactly(stubs.gameManager.getWaitingGame, fakeJoinInfo.gameId);
        assert.called(stubs.multiplayerGameFactory.availableGamesUpdate);
        expect(fakeAvailableGames[1].isWaitingForConfirmation).to.be.eql(true);
    });

    it('should handle a request to reject a player', () => {
        stubs.gameManager.getWaitingGame.callsFake(() => fakeAvailableGames[1]);
        stubs.clientSocket.emit(REJECT_THAT_PLAYER_FROM_JOINING, fakeJoinInfo);
        assert.called(stubs.multiplayerGameFactory.availableGamesUpdate);
        expect(fakeAvailableGames[1].isWaitingForConfirmation).to.be.eql(false);
    });

    it('should handle a cancel when waiting Game does not exist no more', () => {
        stubs.gameManager.getWaitingGame.callsFake(() => fakeAvailableGames[1]);
        stubs.clientSocket.emit(CANCEL_JOIN_REQUEST, fakeCommonGameConfig);
        assert.called(stubs.multiplayerGameFactory.availableGamesUpdate);
        expect(fakeAvailableGames[1].isWaitingForConfirmation).to.be.eql(false);
    });

    it('should handle undefined when removing flag', () => {
        stubs.gameManager.getWaitingGame.callsFake(() => undefined);
        expect(() => {
            // eslint-disable-next-line dot-notation -- Méthode privée
            initializeGameHandler['removeConfirmationFlag'](gameId);
        }).not.to.throw();
    });
});
