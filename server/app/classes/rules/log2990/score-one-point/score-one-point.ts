import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
import { ONE_POINT } from '@app/constants/default/default-letter';
import { SCORE_ONE_POINT_BONUS, SCORE_ONE_POINT_DESCRIPTION } from '@app/constants/log2990';
import { RuleName } from '@app/enum/rules';
import { Action } from '@app/interface/action-interface';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';

export class ScoreOnePoint extends GoalRule {
    name: string;
    players: Player[];
    bonus: number;
    description: string;

    // eslint-disable-next-line no-unused-vars -- necessaire pour avoir des constructeurs uniforme pour l'usine
    constructor(players: Player[], _game: Game) {
        super();
        this.name = RuleName.ScoreOnePoint;
        this.players = players;
        this.description = SCORE_ONE_POINT_DESCRIPTION;
        this.bonus = SCORE_ONE_POINT_BONUS;
    }

    protected isCompleted(_action: Action, _game: Game, rulesVisitorResponse: RulesVisitorResponse): boolean {
        return rulesVisitorResponse.score === ONE_POINT;
    }
}
