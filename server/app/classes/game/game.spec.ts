/* eslint-disable @typescript-eslint/no-explicit-any, dot-notation -- Méthode privée et mock des méthodes */
import { PlaceLetters } from '@app/classes/actions/place-letters/places-letter';
import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { TradeLetter } from '@app/classes/actions/trade-letters/trade-letters';
import { ClassicMode } from '@app/classes/game-mode/classic-mode/classic-mode';
import { Log2990Mode } from '@app/classes/game-mode/log2990/log2990';
import { Game } from '@app/classes/game/game';
import { GameWatchTower } from '@app/classes/game/game-watch-tower/game-watch-tower';
import { Player } from '@app/classes/players/player-abstract';
import { RealPlayer } from '@app/classes/players/real-player/real-player';
import { PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/constants/game';
import { Action } from '@app/interface/action-interface';
import { stubBoard } from '@app/test/classes-stubs/board-stub';
import { stubClassicMode } from '@app/test/classes-stubs/classic-mode-stub';
import { stubGameWatchTowerWithOutGame } from '@app/test/classes-stubs/game-watch-tower-stub';
import { stubPlayer1, stubPlayer2 } from '@app/test/classes-stubs/player-stub';
import { WORD_PLACE_4 } from '@app/test/constants/boardScenarios/board-scenario-4';
import { FAKE_DICTIONARY_ID, FAKE_GAME_CONFIG, FAKE_GAME_ID } from '@app/test/constants/fake-game';
import { FAKE_SOCKET_ID_PLAYER_1, FAKE_SOCKET_ID_PLAYER_2 } from '@app/test/constants/fake-player';
import { doNothing } from '@app/test/do-nothing-function';
import { LOG2990 } from '@common/constants/game-modes';
import { ActionType } from '@common/enums/action-type';
import { Orientation } from '@common/enums/orientation';
import { expect } from 'chai';
import { describe } from 'mocha';
import { assert, restore, SinonStub, SinonStubbedInstance, spy, stub } from 'sinon';

describe('ClassGame', () => {
    let game: Game;
    let action: Action;
    let player1: Player;
    let player2: Player;
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-empty-function, id-length -- sert comme fonction de rappel pour tests
    const fakeCallback = (_: Game): void => {};
    const initialScore = 0;
    const differentialScore = 24;
    const stashSize = 87;
    const easel1Size = 7;
    const easel2Size = 3;

    beforeEach(() => {
        player1 = stubPlayer1();
        player2 = stubPlayer2();
        Object.setPrototypeOf(ClassicMode, stub());
        game = new Game(FAKE_GAME_ID, FAKE_GAME_CONFIG(), [player1, player2]);
        game.gameMode = stubClassicMode();
        game.players = [player1, player2];
        game.watchTower = stubGameWatchTowerWithOutGame();
        Object.defineProperty(game.players[PLAYER_ONE_INDEX].easel, 'size', { value: easel1Size });
        Object.defineProperty(game.players[PLAYER_TWO_INDEX].easel, 'size', { value: easel2Size });
        Object.defineProperty(game.letterStash, 'size', { value: stashSize });
    });

    afterEach(() => restore());

    it('should give the right active player when it is player 1 turn', () => {
        game.flags.isPlayerOneTurn = true;
        expect(game.activePlayer).to.be.eql(game.players[PLAYER_ONE_INDEX]);
    });

    it('should create with log2990 gameMode', () => {
        const spyStub = stub().callsFake(doNothing);

        stub(Log2990Mode.prototype, 'addRules' as any);
        stub(Log2990Mode.prototype, 'sendGoals');
        Object.setPrototypeOf(Log2990Mode, spyStub);
        const config = FAKE_GAME_CONFIG();

        config.gameModeName = LOG2990;
        game = new Game(FAKE_GAME_ID, config, [player1, player2]);
        assert.calledOnce(spyStub);
    });

    it('should give the right active player when it is player 2 turn', () => {
        game.flags.isPlayerOneTurn = false;
        expect(game.activePlayer).to.be.eql(game.players[PLAYER_TWO_INDEX]);
    });

    it('should give the right other player when it is player 1 turn', () => {
        game.flags.isPlayerOneTurn = true;
        expect(game.otherPlayer).to.be.eql([game.players[PLAYER_TWO_INDEX]]);
    });

    it('should give the right other player when it is player 2 turn', () => {
        game.flags.isPlayerOneTurn = false;
        expect(game.otherPlayer).to.be.eql([game.players[PLAYER_ONE_INDEX]]);
    });

    it('should execute callbacks', () => {
        const callBackStub = { callBack1: fakeCallback, callBack2: fakeCallback };
        const spyCallBack1 = stub(callBackStub, 'callBack1');
        const spyCallBack2 = stub(callBackStub, 'callBack2');
        const callBacks = [callBackStub.callBack1, callBackStub.callBack2];

        game['executeRulesVisitorCallBacks'](callBacks);
        assert.calledOnce(spyCallBack1);
        assert.calledWith(spyCallBack1, game);
        assert.calledOnce(spyCallBack2);
        assert.calledWith(spyCallBack2, game);
    });

    it('should execute a by calling verify rules on gameMode, update the player score, board and do callBack', () => {
        const board = stubBoard();
        const callBackStub = { callBack1: fakeCallback, callBack2: fakeCallback };
        const spyCallBack1 = stub(callBackStub, 'callBack1');
        const spyCallBack2 = stub(callBackStub, 'callBack2');
        const callBacks = [callBackStub.callBack1, callBackStub.callBack2];
        const visitor = {
            newBoard: board,
            gameModification: callBacks,
            newlyFormedWordAsTile: [],
            score: differentialScore,
            placedPosition: [],
        };

        (game.gameMode as SinonStubbedInstance<ClassicMode>).verifyRules.returns(visitor);
        game.players[PLAYER_ONE_INDEX].score = 0;
        action = new SkipTurn();
        game['executeTurn'](action);
        assert.calledOnce(spyCallBack1);
        assert.calledWith(spyCallBack1, game);
        assert.calledOnce(spyCallBack2);
        assert.calledWith(spyCallBack2, game);
        expect(game.players[PLAYER_ONE_INDEX].score).to.be.eql(differentialScore);
        expect(game.board).to.be.eql(board);
    });

    it('executeTurn should call delayWordEasel if action is a PlaceLetters', () => {
        const board = stubBoard();
        const position = { x: 0, y: 0 };
        const visitor = {
            newBoard: board,
            gameModification: [],
            newlyFormedWordAsTile: [],
            score: differentialScore,
            placedPosition: [],
        };

        (game.gameMode as SinonStubbedInstance<ClassicMode>).verifyRules.returns(visitor);
        action = new PlaceLetters([], position, Orientation.Horizontal);
        const spyDelay = (game.watchTower as unknown as SinonStubbedInstance<GameWatchTower>).delayWordEasel;

        game['executeTurn'](action);
        assert.calledOnce(spyDelay);
    });

    it('should return player one as winner', () => {
        const highScore = 150;

        player1.score = highScore;
        player2.score = initialScore;
        game.end();
        expect(game.winners).to.have.deep.members([player1]);
        expect(game.flags.isGameOver).to.be.eql(true);
    });

    it('should return player two as winner', () => {
        const highScore = 150;

        player1.score = initialScore;
        player2.score = highScore;
        game.end();
        expect(game.winners).to.have.deep.members([player2]);
        expect(game.flags.isGameOver).to.be.eql(true);
    });

    it('should return both player as winner when there is a tie', () => {
        const highScore = 150;
        const playerOneEaselScore = 123;
        const playerTwoEaselScore = playerOneEaselScore;

        player1.score = highScore;
        player2.score = highScore;
        stub(player1.easel, 'totalScore').get(() => playerOneEaselScore);
        stub(player2.easel, 'totalScore').get(() => playerTwoEaselScore);
        game.end();
        expect(game.winners).to.have.deep.members([player1, player2]);
        expect(game.flags.isGameOver).to.be.eql(true);
    });

    it('should call new action on player', async () => {
        stub(game['dictionaryService'], 'loadDictionary').returns(Promise.resolve(FAKE_DICTIONARY_ID));
        const skipAction = new SkipTurn();
        let player: SinonStubbedInstance<RealPlayer>;

        game.outsideResolveError = stub();
        if (game.players[PLAYER_ONE_INDEX] === player1) player = player1 as SinonStubbedInstance<RealPlayer>;
        else player = player2 as SinonStubbedInstance<RealPlayer>;
        player.nextAction.callsFake(async () => Promise.resolve(skipAction));
        stub(game, 'executeTurn' as any).callsFake(
            async () =>
                new Promise<boolean>((res) => {
                    game.flags.isGameOver = true;
                    res(true);
                }),
        );
        await game.start();
        assert.called(player.nextAction);
    });

    it('should play skipTurn when a rule is invalid', async () => {
        stub(game['dictionaryService'], 'loadDictionary').returns(Promise.resolve(FAKE_DICTIONARY_ID));
        const tradeAction = new TradeLetter(WORD_PLACE_4());

        game.outsideResolveError = stub();
        let player: SinonStubbedInstance<RealPlayer>;

        if (game.players[PLAYER_ONE_INDEX] === player1) player = player1 as SinonStubbedInstance<RealPlayer>;
        else player = player2 as SinonStubbedInstance<RealPlayer>;
        player.nextAction.callsFake(async () => Promise.resolve(tradeAction));
        const executeTurnSpy = stub(game, 'executeTurn' as any).callsFake(
            async (spyAction: Action) =>
                new Promise<boolean>((res) => {
                    if (spyAction.actionType === ActionType.SkipTurn) res(true);
                    else {
                        game.flags.isGameOver = true;
                        throw new Error('Rule invalid');
                    }
                }),
        );

        await game.start();
        expect(game.invalidRuleError).to.not.be.eql(undefined);
        assert.calledTwice(executeTurnSpy);
        assert.calledWith(executeTurnSpy, new SkipTurn());
    });

    it('makeAction should call delayWordEasel if no word was formed', () => {
        const err = new Error("Aucun mot valide n'est formé.");
        const position = { x: 0, y: 0 };

        game['errorInTurnHandler'](game, new PlaceLetters([], position, Orientation.Horizontal))(err);
        assert.called((game.watchTower as unknown as SinonStubbedInstance<GameWatchTower>).delayWordEasel);
    });

    it('updateRules should put flag at false when the is an place letter action', () => {
        const position = { x: 0, y: 0 };

        game['updateRules'](new PlaceLetters([], position, Orientation.Horizontal));

        expect(game.flags.firstTimePlacingLetter).to.eql(false);
        assert.called(game.gameMode.removeRule as unknown as SinonStub<[ruleName: string], void>);
        assert.called(game.gameMode.addRule as unknown as SinonStub<[ruleName: string], void>);
    });

    it('makeAction should now outsideResolve if it is not defined', () => {
        (player1 as SinonStubbedInstance<RealPlayer>).nextAction.resolves(new SkipTurn());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub membre prive
        stub(game, 'executeTurn' as any);
        game.outsideResolveError = 0 as unknown as (value: string | PromiseLike<string>) => void;

        expect(game['makeAction']).to.not.throw();
    });

    it('makeAction should call updateRules if executeTurn does not throw', async () => {
        game.flags.firstTimePlacingLetter = true;
        (player1 as SinonStubbedInstance<RealPlayer>).nextAction.resolves(new SkipTurn());
        stub(game, 'executeTurn' as any).resolves();
        const spyUpdate = stub(game, 'updateRules' as any);

        game.outsideResolveError = 0 as unknown as (value: string | PromiseLike<string>) => void;

        await game['makeAction']();
        assert.called(spyUpdate);
    });

    it('makeAction should not call updateRules if flag is false', async () => {
        game.flags.firstTimePlacingLetter = false;
        (player1 as SinonStubbedInstance<RealPlayer>).nextAction.resolves(new SkipTurn());
        stub(game, 'executeTurn' as any).resolves();
        const spyUpdate = stub(game, 'updateRules' as any);

        game.outsideResolveError = 0 as unknown as (value: string | PromiseLike<string>) => void;

        await game['makeAction']();
        assert.notCalled(spyUpdate);
    });

    it('findIndexPlayer should return PLAYER_ONE_INDEX if socketId is the same for player one', () =>
        expect(game.findIndexPlayer(FAKE_SOCKET_ID_PLAYER_1)).to.equal(PLAYER_ONE_INDEX));

    it('findIndexPlayer should return PLAYER_TWO_INDEX if socketId is the same for player two', () =>
        expect(game.findIndexPlayer(FAKE_SOCKET_ID_PLAYER_2)).to.equal(PLAYER_TWO_INDEX));

    it('findIndexPlayer should return -1 if socketId is different', () => {
        const expectedValue = -1;
        const fakeId = 'test';

        expect(game.findIndexPlayer(fakeId)).to.equal(expectedValue);
    });

    it('end should skipturn from player one if it is a virtualPlayer', () => {
        game.flags.isPlayerOneTurn = true;
        game.players[PLAYER_ONE_INDEX].requiredUpdates = false;
        game.players[PLAYER_ONE_INDEX].outsideResolve = doNothing;
        const spyEnd = spy(game.players[PLAYER_ONE_INDEX], 'outsideResolve');

        game.end();
        assert.calledOnce(spyEnd);
    });

    it('end should skipturn from player two if it is a virtualPlayer', () => {
        game.flags.isPlayerOneTurn = false;
        game.players[PLAYER_TWO_INDEX].requiredUpdates = false;
        game.players[PLAYER_TWO_INDEX].outsideResolve = doNothing;
        const spyEnd = spy(game.players[PLAYER_TWO_INDEX], 'outsideResolve');

        game.end();
        assert.calledOnce(spyEnd);
    });

    it('preparationEndGame should call addGameHistory and addBestScores', async () => {
        const spyScores = (game.watchTower as unknown as SinonStubbedInstance<GameWatchTower>).addBestScores;
        const spyHistory = (game.watchTower as unknown as SinonStubbedInstance<GameWatchTower>).addGameHistory;
        const spyFormat = stub(game['gameInfoFormattingService'], 'formatGameInfoHistory');
        const spyDictionary = stub(game['dictionaryService'], 'unloadDictionary');

        await game['preparationEndGame']();
        assert.called(spyScores);
        assert.called(spyHistory);
        assert.called(spyFormat);
        assert.called(spyDictionary);
    });

    it('preparationEndGame should call addGameHistory', async () => {
        stub(game['dictionaryService'], 'unloadDictionary');
        const spyAdd = (game.watchTower as unknown as SinonStubbedInstance<GameWatchTower>).addGameHistory;

        await game['preparationEndGame']();
        assert.called(spyAdd);
    });

    it('activePlayerIndex should return PLAYER_ONE_INDEX if the active player is player one', () =>
        expect(game.activePlayerIndex).to.be.equal(PLAYER_ONE_INDEX));

    it('activePlayerIndex should return PLAYER_TWO_INDEX if the active player is player two', () => {
        game.flags.isPlayerOneTurn = false;

        expect(game.activePlayerIndex).to.be.equal(PLAYER_TWO_INDEX);
    });
});
