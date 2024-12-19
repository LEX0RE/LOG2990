import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { FormedWordLengthX } from '@app/classes/rules/log2990/formed-word-length-x/formed-word-length-x';
import { Tile } from '@app/classes/tiles/tile';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { defaultStandardTile } from '@app/constants/default/default-tile';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { stubPlayer1 } from '@app/test/classes-stubs/player-stub';
import { EXPECTED_NEW_WORD_3 } from '@app/test/constants/boardScenarios/board-scenario-3';
import { FAKE_PLACE_ACTION } from '@app/test/constants/fake-hints';
import { FAKE_RULE_RESPONSE_EMPTY } from '@app/test/constants/fake-words-find-constants';
import { expect } from 'chai';
import { restore, stub } from 'sinon';

describe('FormedWordLengthX', () => {
    let goal: FormedWordLengthX;
    let player: Player;
    let game: Game;
    let visitor: RulesVisitorResponse;
    const targetLength = 6;
    const bonus = 24;

    beforeEach(() => {
        stub(MathUtils, 'randomNumberInInterval').returns(targetLength);
        player = stubPlayer1();
        game = stubGame();
        goal = new FormedWordLengthX([player], game);
        visitor = FAKE_RULE_RESPONSE_EMPTY();
    });

    afterEach(() => restore());

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(goal).to.exist;
    });

    it('isGoalCompleted should return true  when word formed is bigger or equal then targetLength', () => {
        visitor.newlyFormedWordAsTile = EXPECTED_NEW_WORD_3() as Tile[][];
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(true);
    });

    it('isGoalCompleted should return false when word formed is less then targetLength', () => {
        visitor.newlyFormedWordAsTile = [
            [defaultStandardTile(), defaultStandardTile(), defaultStandardTile(), defaultStandardTile(), defaultStandardTile()],
        ];
        // eslint-disable-next-line dot-notation -- membre privé
        expect(goal['isCompleted'](FAKE_PLACE_ACTION(), game, visitor)).to.be.eql(false);
    });

    it('should return the right score', () => {
        visitor.newlyFormedWordAsTile = EXPECTED_NEW_WORD_3() as Tile[][];
        goal.verify(FAKE_PLACE_ACTION(), game, visitor);
        expect(visitor.score).to.be.eql(bonus);
    });
});
