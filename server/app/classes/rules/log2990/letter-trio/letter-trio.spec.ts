import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { LetterTrio } from '@app/classes/rules/log2990/letter-trio/letter-trio';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { DEFAULT_LETTER_TRIO, LETTERS_3_BONUS } from '@app/constants/log2990';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { stubPlayer1 } from '@app/test/classes-stubs/player-stub';
import { FAKE_PLACE_ACTION } from '@app/test/constants/fake-hints';
import { FAKE_LETTERS_OVER_6, FAKE_WORD_WITH_2_E, FAKE_WORD_WITH_3_E, FAKE_WORD_WITH_3_E_AND_BLANKS } from '@app/test/constants/fake-letter-trio';
import { FAKE_RULE_RESPONSE_EMPTY } from '@app/test/constants/fake-words-find-constants';
import { expect } from 'chai';
import { assert, restore, SinonStub, stub } from 'sinon';

describe('LetterTrio', () => {
    let goal: LetterTrio;
    let player: Player;
    let game: Game;
    let visitor: RulesVisitorResponse;
    let randomInArrayStub: SinonStub<[array: unknown[], numberOfElementsToChose: number], unknown[]>;

    beforeEach(() => {
        randomInArrayStub = stub(MathUtils, 'randomInArray').returns([DEFAULT_LETTER_TRIO]);
        player = stubPlayer1();
        game = stubGame();
        goal = new LetterTrio([player], game);
        visitor = FAKE_RULE_RESPONSE_EMPTY();
    });

    afterEach(() => restore());

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(goal).to.exist;
        assert.calledWith(randomInArrayStub, FAKE_LETTERS_OVER_6());
    });

    it('isGoalCompleted should return true when word formed has 3 E', () => {
        visitor.newlyFormedWordAsTile = FAKE_WORD_WITH_3_E();
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return true event with blank', () => {
        visitor.newlyFormedWordAsTile = FAKE_WORD_WITH_3_E_AND_BLANKS();
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return false when word formed has 2 E', () => {
        visitor.newlyFormedWordAsTile = FAKE_WORD_WITH_2_E();
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(false);
    });

    it('should return the right score', () => {
        visitor.newlyFormedWordAsTile = FAKE_WORD_WITH_3_E();
        goal.verify(FAKE_PLACE_ACTION(), game, visitor);
        expect(visitor.score).to.be.eql(LETTERS_3_BONUS);
    });
});
