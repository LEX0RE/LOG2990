import { Log2990Mode } from '@app/classes/game-mode/log2990/log2990';
import { Game } from '@app/classes/game/game';
import { RuleName } from '@app/enum/rules';
import { Action } from '@app/interface/action-interface';
import { Rule } from '@app/interface/rule-interface';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';

export class MustSendGoals implements Rule {
    name: string;

    constructor() {
        this.name = RuleName.MustSendGoals;
    }

    verify(_action: Action, _game: Game, rulesVisitorResponse: RulesVisitorResponse): RulesVisitorResponse {
        rulesVisitorResponse.gameModification.push(this.sendGoalUpdate);
        return rulesVisitorResponse;
    }

    private sendGoalUpdate(game: Game): void {
        (game.gameMode as Log2990Mode).sendGoals(game);
    }
}
