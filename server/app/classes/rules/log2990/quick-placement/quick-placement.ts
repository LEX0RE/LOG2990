import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
import { TimeUtils } from '@app/classes/utils/time/time';
import { QUICK_PLACEMENT_BONUS, QUICK_PLACEMENT_DESCRIPTION } from '@app/constants/log2990';
import { BUFFER_TIME, TWO_SECOND } from '@app/constants/miscellaneous';
import { RuleName } from '@app/enum/rules';
import { Action } from '@app/interface/action-interface';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { ActionType } from '@common/enums/action-type';

export class QuickPlacement extends GoalRule {
    name: string;
    players: Player[];
    bonus: number;
    description: string;
    private remainingTimeTarget: number;

    constructor(players: Player[], game: Game) {
        super();
        this.name = RuleName.QuickPlacement;
        this.players = players;
        this.description = QUICK_PLACEMENT_DESCRIPTION;
        this.bonus = QUICK_PLACEMENT_BONUS;
        this.remainingTimeTarget = TimeUtils.toMS(game.gameConfig.turnTimer) - TWO_SECOND - BUFFER_TIME;
        if (this.remainingTimeTarget < 0) this.remainingTimeTarget = TimeUtils.toMS(game.gameConfig.turnTimer);
    }

    // eslint-disable-next-line no-unused-vars -- necessaire pour correspondre a l'interface de goalRule
    protected isCompleted(action: Action, game: Game, _rulesVisitorResponse: RulesVisitorResponse): boolean {
        if (action.actionType !== ActionType.PlaceLetters) return false;
        return game.timer.remainingTime() >= this.remainingTimeTarget;
    }
}
