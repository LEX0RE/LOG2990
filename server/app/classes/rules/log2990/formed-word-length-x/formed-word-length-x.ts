import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
import { Tile } from '@app/classes/tiles/tile';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { BASE_POINT, MAX_WORD_LENGTH, MIN_WORD_LENGTH, WORD_LENGTH_X_DESCRIPTION } from '@app/constants/log2990';
import { RuleName } from '@app/enum/rules';
import { Action } from '@app/interface/action-interface';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';

export class FormedWordLengthX extends GoalRule {
    name: string;
    players: Player[];
    bonus: number;
    description: string;
    private targetLength: number;

    // eslint-disable-next-line no-unused-vars -- necessaire pour avoir des constructeurs uniforme pour l'usine
    constructor(players: Player[], _game: Game) {
        super();
        this.name = RuleName.FormedWordOfLengthX;
        this.players = players;
        this.targetLength = MathUtils.randomNumberInInterval(MIN_WORD_LENGTH, MAX_WORD_LENGTH);
        this.bonus = BASE_POINT * this.targetLength;
        this.description = WORD_LENGTH_X_DESCRIPTION(this.targetLength);
    }

    protected isCompleted(_action: Action, _game: Game, rulesVisitorResponse: RulesVisitorResponse): boolean {
        let completed = false;

        rulesVisitorResponse.newlyFormedWordAsTile.forEach((word: Tile[]) => {
            if (word.length >= this.targetLength) completed = true;
        });
        return completed;
    }
}
