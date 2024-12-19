/* eslint-disable dot-notation -- Propriété/Méthode privée */
import { Game } from '@app/classes/game/game';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/constants/game';
import { BEGINNER_ID, EXPERT_ID } from '@app/constants/id-virtual-player';
import { WaitingGame } from '@app/interface/waiting-game';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { Gameplay } from '@app/services/gameplay/gameplay.service';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { stubPlayer2 } from '@app/test/classes-stubs/player-stub';
import { FAKE_GAME_CONFIG, FAKE_GAME_ID } from '@app/test/constants/fake-game';
import { FAKE_WAITING_GAME } from '@app/test/constants/fake-game-manager';
import { FAKE_PLAYER_1_NAME, FAKE_PLAYER_2_NAME, FAKE_SOCKET_ID_PLAYER_1, FAKE_SOCKET_ID_PLAYER_2 } from '@app/test/constants/fake-player';
import { doNothing } from '@app/test/do-nothing-function';
import { stubGameplay } from '@app/test/services-stubs/gameplay-stub';
import { Difficulty } from '@common/enums/difficulty';
import { expect } from 'chai';
import { describe } from 'mocha';
import { assert, restore, spy, stub } from 'sinon';
import { Container, Token } from 'typedi';

describe('GameManager', () => {
    let gameManager: GameManager;

    beforeEach(() => {
        gameManager = new GameManager();
        stub(MathUtils, 'shuffleArray').callsFake(doNothing);
        const getStub = stub(Container, 'get');

        getStub.withArgs(Gameplay as Token<unknown>).returns(stubGameplay());
    });

    afterEach(() => restore());

    it('should create basic game manager', () => {
        expect(gameManager).to.haveOwnProperty('waitingGames');
        expect(gameManager).to.haveOwnProperty('games');
    });

    it('should create a game and put it in the waiting games', () => {
        const succeeded = gameManager.createWaitingGame(FAKE_GAME_CONFIG());

        expect(succeeded).to.be.eql(true);
        expect(gameManager.waitingGames.length).to.not.be.eql(0);
        expect(gameManager.waitingGames[0].player.id).to.be.eql(FAKE_SOCKET_ID_PLAYER_1);
        expect(gameManager.waitingGames[0].player.name).to.be.eql(FAKE_PLAYER_1_NAME);
        expect(gameManager.waitingGames[0].gameConfig).to.be.eql(FAKE_GAME_CONFIG());
        expect(gameManager.waitingGames[0].gameId).to.be.eql(FAKE_GAME_ID);
    });

    it('should not create an existing game', () => {
        let succeeded = gameManager.createWaitingGame(FAKE_GAME_CONFIG());

        expect(succeeded).to.be.eql(true);
        succeeded = gameManager.createWaitingGame(FAKE_GAME_CONFIG());
        expect(succeeded).to.be.eql(false);
        expect(gameManager.waitingGames.length).to.be.eql(1);
        expect(gameManager.waitingGames[0].player.id).to.be.eql(FAKE_SOCKET_ID_PLAYER_1);
        expect(gameManager.waitingGames[0].player.name).to.be.eql(FAKE_PLAYER_1_NAME);
        expect(gameManager.waitingGames[0].gameConfig).to.be.eql(FAKE_GAME_CONFIG());
        expect(gameManager.waitingGames[0].gameId).to.be.eql(FAKE_GAME_ID);
    });

    it('should join multiplayer game if FAKE_GAME_ID is in the waiting list', () => {
        const succeeded = gameManager.createWaitingGame(FAKE_GAME_CONFIG());

        expect(succeeded).to.be.eql(true);
        const gameCreated = gameManager.joinMultiplayerGame(FAKE_SOCKET_ID_PLAYER_2, FAKE_PLAYER_2_NAME, FAKE_GAME_ID);

        expect(gameCreated).to.not.be.eql(undefined);

        expect(gameManager['games'].length).to.be.eql(1);

        const game = gameManager['games'][0];

        expect(game.players[PLAYER_ONE_INDEX].id).to.be.oneOf([FAKE_SOCKET_ID_PLAYER_1, FAKE_SOCKET_ID_PLAYER_2]);
        expect(game.players[PLAYER_TWO_INDEX].id).to.be.oneOf([FAKE_SOCKET_ID_PLAYER_1, FAKE_SOCKET_ID_PLAYER_2]);
        expect(game.players[PLAYER_ONE_INDEX].name).to.be.oneOf([FAKE_PLAYER_1_NAME, FAKE_PLAYER_2_NAME]);
        expect(game.players[PLAYER_TWO_INDEX].name).to.be.oneOf([FAKE_PLAYER_1_NAME, FAKE_PLAYER_2_NAME]);
        expect(game.gameConfig).to.be.eql(FAKE_GAME_CONFIG());
        game.flags.isGameOver = true;
    });

    it('should not join a multiplayer game that does not exists', () => {
        const succeeded = gameManager.createWaitingGame(FAKE_GAME_CONFIG());

        expect(succeeded).to.be.eql(true);
        const gameCreated = gameManager.joinMultiplayerGame(FAKE_SOCKET_ID_PLAYER_2, FAKE_PLAYER_2_NAME, 'dddddd');

        expect(gameCreated).to.be.eql(undefined);
    });

    it('should get the game with the roomId', () => {
        const succeeded = gameManager.createWaitingGame(FAKE_GAME_CONFIG());

        expect(succeeded).to.be.eql(true);
        const gameCreated = gameManager.joinMultiplayerGame(FAKE_SOCKET_ID_PLAYER_2, FAKE_PLAYER_2_NAME, FAKE_GAME_ID);

        expect(gameCreated).to.not.be.eql(undefined);

        expect(gameManager['games'].length).to.be.eql(1);

        const expectedGame = gameManager['games'][0];
        const foundGame = gameManager.getGame(FAKE_GAME_ID);

        expect(foundGame).to.be.eql(expectedGame);
    });

    it('should get the right waiting Game', () => {
        gameManager.createWaitingGame(FAKE_GAME_CONFIG());
        const result = gameManager.getWaitingGame(FAKE_GAME_ID);

        const expected = gameManager['waitingGames'][0];

        expect(result).to.be.eql(expected);
    });

    it('should remove a waiting game by his id', () => {
        const otherGameId = '123';
        const gameTwo: WaitingGame = {
            gameConfig: FAKE_GAME_CONFIG(),
            gameId: otherGameId,
            player: stubPlayer2(),
            isWaitingForConfirmation: true,
        };

        gameManager['waitingGames'] = [FAKE_WAITING_GAME(), gameTwo];
        gameManager.deleteWaitingGame(FAKE_SOCKET_ID_PLAYER_1);

        expect(gameManager['waitingGames'].length).to.be.eql(1);
    });

    it('should delete game', () => {
        const fakeGame1 = stubGame();
        const fakeGame2 = stubGame();
        const fakeGameId = '321';

        Object.defineProperty(fakeGame2, 'gameId', { value: fakeGameId });

        gameManager['games'] = [fakeGame1, fakeGame2] as unknown as Game[];
        gameManager.deleteGame(fakeGameId);

        expect(gameManager['games'].length).to.be.eql(1);

        expect(gameManager['games']).to.have.deep.members([fakeGame1]);
    });

    it('getGameByPlayerId should give game with a specific player id', () => {
        const gameStub = stubGame();

        gameManager['games'].push(gameStub);
        const result = gameManager.getGameByPlayerId(FAKE_SOCKET_ID_PLAYER_2);

        expect(result).to.not.be.eql(undefined);
    });

    it('getGameByPlayerId should give undefined for wrong player id', () => {
        const result = gameManager.getGameByPlayerId('');

        expect(result).to.be.eql(undefined);
    });

    it('joinSoloGame should call sendGame with beginnerPlayer if difficulty is easy', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur membre prive
        const sendGame = spy(gameManager, 'sendGame' as any);
        const waitingGame = FAKE_WAITING_GAME();

        gameManager.waitingGames.push(waitingGame);
        const game: Game | undefined = gameManager.joinSoloGame(FAKE_PLAYER_1_NAME, FAKE_GAME_ID, Difficulty.Easy);

        assert.calledWith(sendGame, 0, waitingGame);
        expect(game?.players[1].id).to.equal(FAKE_SOCKET_ID_PLAYER_1 + BEGINNER_ID);
    });

    it('joinSoloGame should call sendGame with ExpertPlayer if difficulty is hard', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur membre prive
        const sendGame = spy(gameManager, 'sendGame' as any);
        const waitingGame = FAKE_WAITING_GAME();

        gameManager.waitingGames.push(waitingGame);
        const game: Game | undefined = gameManager.joinSoloGame(FAKE_PLAYER_1_NAME, FAKE_GAME_ID, Difficulty.Hard);

        assert.calledWith(sendGame, 0, waitingGame);
        expect(game?.players[1].id).to.equal(FAKE_SOCKET_ID_PLAYER_1 + EXPERT_ID);
    });

    it('joinSoloGame should call sendGame with BeginnerPlayer if difficulty is unknown', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur membre prive
        const sendGame = spy(gameManager, 'sendGame' as any);
        const waitingGame = FAKE_WAITING_GAME();

        gameManager.waitingGames.push(waitingGame);
        const game: Game | undefined = gameManager.joinSoloGame(FAKE_PLAYER_1_NAME, FAKE_GAME_ID, Difficulty.NotDefine);

        assert.calledWith(sendGame, 0, waitingGame);
        expect(game?.players[1].id).to.equal(FAKE_SOCKET_ID_PLAYER_1 + BEGINNER_ID);
    });

    it('joinSoloGame should return undefined if game is not found', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur membre prive
        const sendGame = spy(gameManager, 'sendGame' as any);

        gameManager.waitingGames = [];
        const game: Game | undefined = gameManager.joinSoloGame(FAKE_PLAYER_1_NAME, FAKE_GAME_ID, Difficulty.NotDefine);

        assert.notCalled(sendGame);

        expect(game).to.equal(undefined);
    });
});
