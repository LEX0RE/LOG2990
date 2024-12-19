import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { BASE_POINT, MAX_BONUS_TILE, MIN_BONUS_TILE } from '@app/constants/log2990';
import { RuleName } from '@app/enum/rules';
import { Action } from '@app/interface/action-interface';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { Vector2D } from '@app/interface/vector-2d-interface';

export class BonusMaster extends GoalRule {
    name: string;
    players: Player[];
    bonus: number;
    description: string;
    private nBonus: number;

    // eslint-disable-next-line no-unused-vars -- necessaire pour avoir des constructeurs uniforme pour l'usine
    constructor(players: Player[], _game: Game) {
        super();
        this.name = RuleName.BonusMaster;
        this.players = players;
        this.nBonus = MathUtils.randomNumberInInterval(MIN_BONUS_TILE, MAX_BONUS_TILE);
        this.bonus = Math.pow(BASE_POINT, this.nBonus);
        this.description = `Activer ${this.nBonus} nombre de bonus sur le même placement`;
    }

    protected isCompleted(_action: Action, game: Game, rulesVisitorResponse: RulesVisitorResponse): boolean {
        let nBonusActivated = 0;

        rulesVisitorResponse.placedPosition.forEach((position: Vector2D) => {
            if (game.board.getTile(position).isBonusActive) nBonusActivated++;
        });

        return nBonusActivated >= this.nBonus;
    }
}
