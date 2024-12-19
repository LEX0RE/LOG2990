import { Game } from '@app/classes/game/game';
import { RealPlayer } from '@app/classes/players/real-player/real-player';
import { SoloGameFactory } from '@app/services/game-factory/solo-game-factory/solo-game-factory.service';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { CREATE_SOLO_GAME } from '@common/constants/communication';
import { CLASSIC } from '@common/constants/game-modes';
import { Difficulty } from '@common/enums/difficulty';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';
import { SoloGameConfig } from '@common/interfaces/solo-game-config';
import { expect } from 'chai';
import { assert, restore, stub } from 'sinon';

describe('SoloFactory', () => {
    let soloGameFactory: SoloGameFactory;
    let stubs: ServiceStubHelper;
    const dictTitle = 'Français';
    const commonTimer: CommonTimer = { minute: 1, second: 0 };
    const player1SocketId = '1234';
    const player1Name = 'James';
    const gameId = 'room_id';
    let fakeSoloGameConfig: SoloGameConfig;

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        soloGameFactory = new SoloGameFactory();
        stub(console, 'error');
        stubs.roomManager.createRoom.returns(gameId);
        stubs.gameManager.createWaitingGame.returns(true);
        stubs.gameManager.waitingGames = [];
        fakeSoloGameConfig = {
            dictionaryTitle: dictTitle,
            dictionaryId: 0,
            gameModeName: CLASSIC,
            turnTimer: commonTimer,
            player1Name,
            gameId: player1SocketId,
            player1SocketId,
            player2Difficulty: Difficulty.Easy,
            player2Name: '',
        };
    });

    afterEach(() => restore());

    it('should create simple soloGameFactory', () => {
        expect(soloGameFactory).to.not.be.eql(undefined);
    });

    it('should joinSoloGame should join a game', () => {
        const gameStub = stubGame();
        const player = {
            playerName: 'Bob',
        };

        // eslint-disable-next-line dot-notation -- Méthode privée
        stub(soloGameFactory['socketManager'], 'sendPrivate');
        stubs.virtualPlayerName.getName.resolves(player);
        stubs.gameManager.joinSoloGame.returns(gameStub as unknown as Game);
        stubs.clientSocket.emit(CREATE_SOLO_GAME, fakeSoloGameConfig);
        assert.calledOnceWithExactly(stubs.roomManager.joinRoom, player1SocketId, gameId);
    });

    it('should call delete game', () => {
        // eslint-disable-next-line dot-notation -- Méthode privée
        soloGameFactory['deleteGame'](gameId)();
        assert.calledWithExactly(stubs.gameManager.deleteGame, gameId);
    });

    it('should not call start if game is undefined', async () => {
        const player = {
            playerName: 'Bob',
        };

        stubs.virtualPlayerName.changeName.resolves(player.playerName);
        // eslint-disable-next-line dot-notation -- Membre privé
        stub(soloGameFactory['socketManager'], 'sendPrivate');

        stubs.gameManager.joinSoloGame.returns(undefined);

        // eslint-disable-next-line dot-notation -- Méthode privée
        await soloGameFactory['createSoloGame'](fakeSoloGameConfig);
        assert.calledOnceWithExactly(stubs.gameManager.joinSoloGame, player.playerName, gameId, fakeSoloGameConfig.player2Difficulty);
        assert.calledOnceWithExactly(stubs.roomManager.joinRoom, player1SocketId, gameId);
    });

    it('addVirtualPlayerToChat should not put a player in chat if there is no virtual player', () => {
        const gameStub = stubGame();

        gameStub.players = [new RealPlayer('fake', 'fake'), new RealPlayer('fake', 'fake')];

        // eslint-disable-next-line dot-notation -- Méthode privée
        soloGameFactory['addVirtualPlayerToChat'](gameStub, '');
        assert.notCalled(stubs.chatManager.addUserToChat);
    });
});
