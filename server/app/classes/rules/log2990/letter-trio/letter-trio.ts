import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
import { Tile } from '@app/classes/tiles/tile';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { DEFAULT_LETTER_TRIO, LETTERS_3_BONUS, LETTER_TRIO_DESCRIPTION, TARGET_MINIMUM_QUANTITY, THREE_LETTERS } from '@app/constants/log2990';
import { RuleName } from '@app/enum/rules';
import { Action } from '@app/interface/action-interface';
import { QuantityEntry } from '@app/interface/letter-quantities';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';

export class LetterTrio extends GoalRule {
    name: string;
    players: Player[];
    bonus: number;
    description: string;
    private letter: string;

    constructor(players: Player[], game: Game) {
        super();
        this.name = RuleName.LetterTrio;
        this.players = players;
        this.letter = MathUtils.randomInArray(this.getValidLetters(game), 1)[0];
        this.description = LETTER_TRIO_DESCRIPTION(this.letter);
        this.bonus = LETTERS_3_BONUS;
    }

    protected isCompleted(_action: Action, _game: Game, rulesVisitorResponse: RulesVisitorResponse): boolean {
        let completed = false;

        rulesVisitorResponse.newlyFormedWordAsTile.forEach((word: Tile[]) => {
            const nOccurrence = MathUtils.accumulator(word, 0, (total: number, tile: Tile) => {
                if (tile.letter.letter.toLowerCase() === this.letter.toLowerCase()) total++;
                return total;
            });

            if (nOccurrence >= THREE_LETTERS) completed = true;
        });

        return completed;
    }

    private getValidLetters(game: Game): string[] {
        return MathUtils.accumulator(game.letterStash.letterQuantities, [DEFAULT_LETTER_TRIO], (letters: string[], entry: QuantityEntry) => {
            if (entry.quantity >= TARGET_MINIMUM_QUANTITY) letters.push(entry.letter);
            return letters;
        });
    }
}
