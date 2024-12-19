import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
import { isSamePosition } from '@app/classes/utils/vector-2d/vector-2d';
import { CORNERS, CORNER_BONUS, CORNER_DESCRIPTION } from '@app/constants/log2990';
import { RuleName } from '@app/enum/rules';
import { Action } from '@app/interface/action-interface';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { Vector2D } from '@app/interface/vector-2d-interface';

export class Corner extends GoalRule {
    name: string;
    players: Player[];
    bonus: number;
    description: string;

    // eslint-disable-next-line no-unused-vars -- necessaire pour avoir des constructeurs uniforme pour l'usine
    constructor(players: Player[], _game: Game) {
        super();
        this.name = RuleName.Corner;
        this.players = players;
        this.bonus = CORNER_BONUS;
        this.description = CORNER_DESCRIPTION;
    }

    protected isCompleted(_action: Action, _game: Game, rulesVisitorResponse: RulesVisitorResponse): boolean {
        let completed = false;

        CORNERS.forEach((corner: Vector2D) => {
            if (rulesVisitorResponse.placedPosition.find((position: Vector2D) => isSamePosition(position, corner))) completed = true;
        });
        return completed;
    }
}
