/* eslint-disable dot-notation -- Méthode privée */
import { PlaceLetters } from '@app/classes/actions/place-letters/places-letter';
import { Board } from '@app/classes/board/board';
import { Game } from '@app/classes/game/game';
import { GameWatchTower } from '@app/classes/game/game-watch-tower/game-watch-tower';
import { DELAY_INVALID_WORD, PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/constants/game';
import { BEGINNER_ID, EXPERT_ID } from '@app/constants/id-virtual-player';
import { stubGameWithoutWatchTower } from '@app/test/classes-stubs/game-stub';
import { FAKE_GAME_HISTORY } from '@app/test/constants/fake-game-history';
import { FAKE_PLACE_ACTION } from '@app/test/constants/fake-hints';
import {
    FAKE_PLAYER_1_NAME,
    FAKE_PLAYER_2_NAME,
    FAKE_SCORE_PLAYER_1,
    FAKE_SCORE_PLAYER_2,
    FAKE_SOCKET_ID_PLAYER_1,
    FAKE_SOCKET_ID_PLAYER_2,
} from '@app/test/constants/fake-player';
import { doNothing } from '@app/test/do-nothing-function';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { scenarioBoard } from '@common/constants/board-scenario';
import { GamePossibility } from '@common/enums/game-possibility';
import { Orientation } from '@common/enums/orientation';
import { BoardUpdate } from '@common/interfaces/board-update';
import { EaselUpdate } from '@common/interfaces/easel-update';
import { GameUpdate } from '@common/interfaces/game-update';
import { expect } from 'chai';
import { assert, restore, SinonStubbedInstance, stub, useFakeTimers } from 'sinon';

describe('GameWatchTower', () => {
    let stubs: ServiceStubHelper;
    let game: Game;
    let watchTower: GameWatchTower;
    const easel2Size = 3;
    const stashSize = 87;
    const easel1Size = 7;

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        game = stubGameWithoutWatchTower();
        Object.defineProperty(game.players[PLAYER_ONE_INDEX].easel, 'size', { value: easel1Size });
        Object.defineProperty(game.players[PLAYER_TWO_INDEX].easel, 'size', { value: easel2Size });
        Object.defineProperty(game.letterStash, 'size', { value: stashSize });
        watchTower = new GameWatchTower(game);
    });

    afterEach(() => restore());

    it('should create GameWatchTower', () => {
        expect(watchTower).to.not.be.eql(undefined);
    });

    it('update should  send update to player', () => {
        watchTower.update();

        assert.calledOnce(stubs.gameplay.sendGameInfo);
    });

    it('updateBoard should  send update to player', () => {
        watchTower.updateBoard(game.activePlayer);

        assert.calledOnce(stubs.gameplay.sendBoard);
    });

    it('updateEasel should  send update to player', () => {
        watchTower.updateEasel(game.activePlayer);

        assert.calledOnce(stubs.gameplay.sendEasel);
    });

    it('should create the right gameUpdate for player one', () => {
        const expectedUpdate: GameUpdate = {
            playerInfo: { name: FAKE_PLAYER_1_NAME, score: FAKE_SCORE_PLAYER_1, nLetterLeft: easel1Size, turn: true },
            otherInfo: { name: FAKE_PLAYER_2_NAME, score: FAKE_SCORE_PLAYER_2, nLetterLeft: easel2Size, turn: false },
            stash: { nLettersLeft: stashSize },
        };

        const result = watchTower['setGameUpdate'](game.players[PLAYER_ONE_INDEX]);

        expect(result).to.eql(expectedUpdate);
    });

    it('should create the right gameUpdate for player two', () => {
        const expectedUpdate: GameUpdate = {
            playerInfo: { nLetterLeft: easel2Size, name: FAKE_PLAYER_2_NAME, score: FAKE_SCORE_PLAYER_2, turn: false },
            otherInfo: { nLetterLeft: easel1Size, name: FAKE_PLAYER_1_NAME, score: FAKE_SCORE_PLAYER_1, turn: true },
            stash: { nLettersLeft: stashSize },
        };

        const result = watchTower['setGameUpdate'](game.players[PLAYER_TWO_INDEX]);

        expect(result).to.eql(expectedUpdate);
    });

    it('should create the right BoardUpdate', () => {
        const expectedUpdate: BoardUpdate = {
            board: scenarioBoard,
        };

        const result = watchTower['setBoardUpdate']();

        expect(result).to.eql(expectedUpdate);
    });

    it('should create the right EaselUpdate for player one', () => {
        const expectedUpdate: EaselUpdate = {
            easel: game.players[PLAYER_ONE_INDEX].easel,
        };

        const result = watchTower['setEaselUpdate'](game.players[PLAYER_ONE_INDEX]);

        expect(result).to.eql(expectedUpdate);
    });

    it('update should not send info if player do not require update', () => {
        game.players[PLAYER_ONE_INDEX].requiredUpdates = false;
        game.players[PLAYER_TWO_INDEX].requiredUpdates = false;
        watchTower.update();
        assert.notCalled(stubs.gameplay.sendGameInfo);
    });

    it('updateBoard should not sendBoard if player do not require update', () => {
        game.players[PLAYER_ONE_INDEX].requiredUpdates = false;
        watchTower.updateBoard(game.players[PLAYER_ONE_INDEX]);
        assert.notCalled(stubs.gameplay.sendBoard);
    });

    it('updateEasel should not sendEasel if player do not require update', () => {
        game.players[PLAYER_ONE_INDEX].requiredUpdates = false;
        watchTower.updateEasel(game.players[PLAYER_ONE_INDEX]);
        assert.notCalled(stubs.gameplay.sendEasel);
    });

    it('outsideResolveError should resolve the promise when called with an error', async () => {
        const timeOut = 5;

        const time = setTimeout(() => {
            game.outsideResolveError('This an error.');
        }, timeOut);

        await watchTower.errorInTurn().then((error) => {
            expect(error).to.eql('This an error.');
        });
        clearTimeout(time);
    });

    it('sendEndGame should called send sendEndMessage from endGameManager', () => {
        game.winners = [game.players[PLAYER_ONE_INDEX], game.players[PLAYER_TWO_INDEX]];
        watchTower.sendEndGame();
        assert.calledOnce(stubs.endGameManager.sendEndGame);
        assert.calledOnce(stubs.endGameManager.sendEndMessage);
    });

    it('sendEndGame should called send sendEndGame from endGameManager with equality when there is a tie', () => {
        game.winners = [game.players[PLAYER_ONE_INDEX], game.players[PLAYER_TWO_INDEX]];
        watchTower.sendEndGame();
        assert.calledWith(stubs.endGameManager.sendEndGame, FAKE_SOCKET_ID_PLAYER_1, GamePossibility.Equality);
    });

    it('sendEndGame should called send sendEndGame from endGameManager with victory/defeat when there is one winner', () => {
        game.winners = [game.players[PLAYER_ONE_INDEX]];
        game.players[PLAYER_TWO_INDEX].requiredUpdates = true;
        watchTower.sendEndGame();
        assert.calledWith(stubs.endGameManager.sendEndGame, FAKE_SOCKET_ID_PLAYER_1, GamePossibility.Win);
        assert.calledWith(stubs.endGameManager.sendEndGame, FAKE_SOCKET_ID_PLAYER_2, GamePossibility.Lost);
    });

    it('delayWordEasel should not change value of board if called async and invalidPlacement true', async () => {
        const fakeTimer = useFakeTimers();
        const oldBoard = JSON.parse(JSON.stringify(game.board));
        const placeLetter = new PlaceLetters([], { x: 0, y: 0 }, Orientation.Horizontal);
        const spyBoard = stub(watchTower, 'updateBoard');

        (game.board as SinonStubbedInstance<Board>).clone.returns(JSON.parse(JSON.stringify(game.board)));
        watchTower.delayWordEasel(placeLetter, true);
        fakeTimer.tick(DELAY_INVALID_WORD);
        expect(game.board).to.eql(oldBoard);
        assert.called(spyBoard);
        fakeTimer.restore();
    });

    it('delayWordEasel should not change value of board if called async and invalidPlacement false', async () => {
        const fakeTimer = useFakeTimers();
        const oldBoard = JSON.parse(JSON.stringify(game.board));
        const placeLetter = new PlaceLetters([], { x: 0, y: 0 }, Orientation.Horizontal);
        const spyBoard = stub(watchTower, 'updateBoard');

        (game.board as SinonStubbedInstance<Board>).clone.returns(JSON.parse(JSON.stringify(game.board)));
        watchTower.delayWordEasel(placeLetter, false);
        fakeTimer.tick(DELAY_INVALID_WORD);
        expect(game.board).to.eql(oldBoard);
        assert.called(spyBoard);
        fakeTimer.restore();
    });

    it('sendEndGame not should called send sendEndGame from endGameManager if player is not true', () => {
        game.players[PLAYER_ONE_INDEX].requiredUpdates = false;
        game.winners = [game.players[PLAYER_ONE_INDEX]];
        watchTower.sendEndGame();
        assert.notCalled(stubs.endGameManager.sendEndGame);
        assert.notCalled(stubs.endGameManager.sendEndGame);
    });

    it('addBestScores should call addBestScore twice', async () => {
        const addBestScoreSpy = stub(watchTower, 'addBestScore').callsFake(doNothing);

        await watchTower.addBestScores([game.players[PLAYER_ONE_INDEX]]).then(() => assert.calledTwice(addBestScoreSpy));
    });

    it('addBestScore should call bestScore.addScore if isValidPlayer returns true', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Méthode privée
        stub(watchTower, 'isValidPlayer' as any).callsFake(() => true);
        await watchTower.addBestScore(game.players[PLAYER_ONE_INDEX]).then(() => {
            assert.called(stubs.bestScore.addScore);
        });
    });

    it('addBestScore should not call bestScore.addScore if isValidPlayer returns false', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Méthode privée
        stub(watchTower, 'isValidPlayer' as any).callsFake(() => false);
        await watchTower.addBestScore(game.players[PLAYER_ONE_INDEX]).then(() => {
            assert.notCalled(stubs.bestScore.addScore);
        });
    });

    it('addGameHistory should call gameHistory.addGameToHistory', async () => {
        await watchTower.addGameHistory(FAKE_GAME_HISTORY).then(() => {
            assert.called(stubs.gameHistory.addGameToHistory);
        });
    });

    it('addGameHistory should call gameHistory.addGameToHistory', async () => {
        await watchTower.addGameHistory(FAKE_GAME_HISTORY).then(() => {
            assert.called(stubs.gameHistory.addGameToHistory);
        });
    });

    it('executeFakeAction should not call placeLetter on board when valid placement', () => {
        watchTower['executeFakeAction'](FAKE_PLACE_ACTION(), false);
        assert.notCalled((game.board as SinonStubbedInstance<Board>).placeLetters);
    });

    it('isValidPlayer should return true if player did not surrender and is not a virtual player', () => {
        expect(watchTower['isValidPlayer'](game.players[PLAYER_ONE_INDEX])).to.eql(true);
    });

    it('isValidPlayer should return false if player has surrender', () => {
        watchTower.surrenderedPlayerId = game.players[PLAYER_ONE_INDEX].id;
        expect(watchTower['isValidPlayer'](game.players[PLAYER_ONE_INDEX])).to.eql(false);
    });

    it('isValidPlayer should return false if player is a virtual player', () => {
        game.players[PLAYER_ONE_INDEX].id += BEGINNER_ID;
        expect(watchTower['isValidPlayer'](game.players[PLAYER_ONE_INDEX])).to.eql(false);

        game.players[PLAYER_TWO_INDEX].id += EXPERT_ID;
        expect(watchTower['isValidPlayer'](game.players[PLAYER_TWO_INDEX])).to.eql(false);
    });
});
