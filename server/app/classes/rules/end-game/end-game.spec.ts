import { PlaceLetters } from '@app/classes/actions/place-letters/places-letter';
import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { TradeLetter } from '@app/classes/actions/trade-letters/trade-letters';
import { Board } from '@app/classes/board/board';
import { Easel } from '@app/classes/easel/easel';
import { Game } from '@app/classes/game/game';
import { LetterStash } from '@app/classes/letter-stash/letter-stash';
import { RealPlayer } from '@app/classes/players/real-player/real-player';
import { EndGame } from '@app/classes/rules/end-game/end-game';
import { Action } from '@app/interface/action-interface';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { BEGIN_POSITION_2, WORD_PLACE_2 } from '@app/test/constants/boardScenarios/board-scenario-2';
import { BEGIN_POSITION_4, SCENARIO_4_TILES, WORD_PLACE_4 } from '@app/test/constants/boardScenarios/board-scenario-4';
import { Orientation } from '@common/enums/orientation';
import { expect } from 'chai';
import { assert, createStubInstance, restore, SinonStubbedInstance, stub } from 'sinon';

describe('EndGame', () => {
    let rule: EndGame;
    let action: Action;
    let visitor: RulesVisitorResponse;
    let gameStub: SinonStubbedInstance<Game>;
    let game: Game;
    let player1: SinonStubbedInstance<RealPlayer>;
    let player2: SinonStubbedInstance<RealPlayer>;
    let easel1: SinonStubbedInstance<Easel>;
    let easel2: SinonStubbedInstance<Easel>;
    let stash: SinonStubbedInstance<LetterStash>;
    const initialScore = 0;
    const maxSkippingAllowed = 6;
    const initialEaselTotalScore = 13;

    beforeEach(() => {
        rule = new EndGame();
        gameStub = createStubInstance(Game);
        game = gameStub as unknown as Game;
        player1 = createStubInstance(RealPlayer);
        player2 = createStubInstance(RealPlayer);
        stash = createStubInstance(LetterStash);
        easel1 = createStubInstance(Easel);
        easel2 = createStubInstance(Easel);
        stub(game, 'activePlayer').get(() => player1);
        stub(game, 'otherPlayer').get(() => [player2]);
        player1.easel = easel1 as unknown as Easel;
        player2.easel = easel2 as unknown as Easel;
        game.letterStash = stash;
        game.players = [player1, player2];
        player1.score = initialScore;
        player2.score = initialScore;
        stub(easel1, 'totalScore').get(() => initialEaselTotalScore);
        stub(easel2, 'totalScore').get(() => initialEaselTotalScore);
    });

    afterEach(() => restore());

    it('should do nothing when it is not the right action', () => {
        visitor = {
            newBoard: new Board(SCENARIO_4_TILES()),
            gameModification: [],
            newlyFormedWordAsTile: [],
            score: initialScore,
            placedPosition: [],
        };
        action = new SkipTurn();
        const vis = rule.verify(action, game, visitor);

        expect(vis).to.be.eql(visitor);
    });

    it('should not call end on game when easel is not empty - scenario 2', () => {
        visitor = {
            newBoard: new Board(SCENARIO_4_TILES()),
            gameModification: [],
            newlyFormedWordAsTile: [],
            score: initialScore,
            placedPosition: [],
        };
        action = new PlaceLetters(WORD_PLACE_2, BEGIN_POSITION_2, Orientation.Horizontal);
        stub(stash, 'isEmpty').get(() => true);
        const letterLeft = 7;

        stub(easel1, 'size').get(() => letterLeft);
        const vis = rule.verify(action, game, visitor);

        expect(vis.score).to.be.equal(initialScore);
        vis.gameModification.forEach((func: (g: Game) => void) => func(game));
        assert.notCalled(gameStub.end);
        expect(player2.score).to.be.equal(initialScore);
    });

    it('should not call end on game when there is still letters in stash - scenario 2', () => {
        visitor = {
            newBoard: new Board(SCENARIO_4_TILES()),
            gameModification: [],
            newlyFormedWordAsTile: [],
            score: initialScore,
            placedPosition: [],
        };
        action = new PlaceLetters(WORD_PLACE_2, BEGIN_POSITION_2, Orientation.Horizontal);
        stub(stash, 'isEmpty').get(() => false);
        stub(easel1, 'size').get(() => WORD_PLACE_2.length);
        const vis = rule.verify(action, game, visitor);

        expect(vis.score).to.be.equal(initialScore);
        vis.gameModification.forEach((func: (g: Game) => void) => func(game));
        assert.notCalled(gameStub.end);
        expect(player2.score).to.be.equal(initialScore);
    });

    it('should call end on game when conditions are met and update score - scenario 4', () => {
        visitor = {
            newBoard: new Board(SCENARIO_4_TILES()),
            gameModification: [],
            newlyFormedWordAsTile: [],
            score: initialScore,
            placedPosition: [],
        };
        action = new PlaceLetters(WORD_PLACE_4(), BEGIN_POSITION_4, Orientation.Horizontal);
        stub(stash, 'isEmpty').get(() => true);
        stub(easel1, 'size').get(() => WORD_PLACE_4().length);
        const vis = rule.verify(action, game, visitor);

        expect(vis.score).to.be.equal(initialEaselTotalScore);
        vis.gameModification.forEach((func: (g: Game) => void) => func(game));
        assert.calledOnce(gameStub.end);
        expect(player2.score).to.be.equal(-initialEaselTotalScore);
    });

    it('should call end on game when 6 skips occur - scenario 4', () => {
        visitor = {
            newBoard: new Board(SCENARIO_4_TILES()),
            gameModification: [],
            newlyFormedWordAsTile: [],
            score: initialScore,
            placedPosition: [],
        };
        action = new SkipTurn();
        for (let i = 0; i < maxSkippingAllowed; i++) {
            visitor = rule.verify(action, game, visitor);
            // eslint-disable-next-line no-loop-func -- il est necessaire d'utiliser le mock comme argument dans l'execution de la fonction de rappel
            visitor.gameModification.forEach((func: (game2: Game) => void) => func(game));
            visitor.gameModification = [];
        }
        assert.calledOnce(gameStub.end);
        expect(player1.score).to.be.equal(-initialEaselTotalScore);
        expect(player2.score).to.be.equal(-initialEaselTotalScore);
    });

    it('should not call end on game when 5 skips occur - scenario 4', () => {
        visitor = {
            newBoard: new Board(SCENARIO_4_TILES()),
            gameModification: [],
            newlyFormedWordAsTile: [],
            score: initialScore,
            placedPosition: [],
        };
        action = new SkipTurn();
        for (let i = 0; i < maxSkippingAllowed - 1; i++) {
            visitor = rule.verify(action, game, visitor);
            // eslint-disable-next-line no-loop-func -- il est necessaire d'utiliser le mock comme argument dans l'execution de la fonction de rappel
            visitor.gameModification.forEach((func: (g: Game) => void) => func(game));
            visitor.gameModification = [];
            assert.notCalled(gameStub.end);
            expect(player1.score).to.be.equal(initialScore);
            expect(player2.score).to.be.equal(initialScore);
        }
    });

    it('should call end on game when 6 skips occur when other actions before - scenario 4', () => {
        visitor = {
            newBoard: new Board(SCENARIO_4_TILES()),
            gameModification: [],
            newlyFormedWordAsTile: [],
            score: initialScore,
            placedPosition: [],
        };
        const skips = [new SkipTurn(), new SkipTurn(), new SkipTurn(), new SkipTurn(), new SkipTurn(), new SkipTurn()];
        const actions = [new PlaceLetters(WORD_PLACE_4(), BEGIN_POSITION_4, Orientation.Horizontal), new TradeLetter(WORD_PLACE_4()), ...skips];

        stub(stash, 'isEmpty').get(() => false);
        stub(easel1, 'size').get(() => WORD_PLACE_4().length);

        actions.forEach((actionTest: Action) => {
            visitor = rule.verify(actionTest, game, visitor);
            // eslint-disable-next-line max-nested-callbacks -- depasse le nombre vu que c'est dans un describe
            visitor.gameModification.forEach((func: (g: Game) => void) => func(game));
        });
        assert.calledOnce(gameStub.end);
        expect(player1.score).to.be.equal(-initialEaselTotalScore);
        expect(player2.score).to.be.equal(-initialEaselTotalScore);
    });

    it('should not call end on game when skips occur with other actions - scenario 4', () => {
        visitor = {
            newBoard: new Board(SCENARIO_4_TILES()),
            gameModification: [],
            newlyFormedWordAsTile: [],
            score: initialScore,
            placedPosition: [],
        };
        const skips = (): SkipTurn[] => [new SkipTurn(), new SkipTurn(), new SkipTurn()];
        const actions = [
            new PlaceLetters(WORD_PLACE_4(), BEGIN_POSITION_4, Orientation.Horizontal),
            new TradeLetter(WORD_PLACE_4()),
            ...skips(),
            new TradeLetter(WORD_PLACE_4()),
            new TradeLetter(WORD_PLACE_4()),
            new TradeLetter(WORD_PLACE_4()),
            ...skips(),
            new TradeLetter(WORD_PLACE_4()),
            new PlaceLetters(WORD_PLACE_4(), BEGIN_POSITION_4, Orientation.Horizontal),
            new PlaceLetters(WORD_PLACE_4(), BEGIN_POSITION_4, Orientation.Horizontal),
            new PlaceLetters(WORD_PLACE_4(), BEGIN_POSITION_4, Orientation.Horizontal),
            new TradeLetter(WORD_PLACE_4()),
            new TradeLetter(WORD_PLACE_4()),
            new TradeLetter(WORD_PLACE_4()),
            ...skips(),
        ];

        stub(stash, 'isEmpty').get(() => false);
        stub(easel1, 'size').get(() => WORD_PLACE_4().length);

        actions.forEach((actionTest: Action) => {
            visitor = rule.verify(actionTest, game, visitor);
            visitor.gameModification.forEach((func: (g: Game) => void) => func(game));
        });
        assert.notCalled(gameStub.end);
        expect(player1.score).to.be.equal(initialScore);
        expect(player2.score).to.be.equal(initialScore);
    });
});
