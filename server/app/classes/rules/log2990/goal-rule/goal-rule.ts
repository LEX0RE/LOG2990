import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { Action } from '@app/interface/action-interface';
import { Rule } from '@app/interface/rule-interface';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';

export abstract class GoalRule implements Rule {
    abstract name: string;
    abstract players: Player[];
    abstract bonus: number;
    abstract description: string;

    verify(action: Action, game: Game, rulesVisitorResponse: RulesVisitorResponse): RulesVisitorResponse {
        if (!this.doesItApplyToActivePlayer(game) || !this.isCompleted(action, game, rulesVisitorResponse)) return rulesVisitorResponse;
        rulesVisitorResponse.gameModification.push(this.remove(this));
        rulesVisitorResponse.score += this.bonus;
        return rulesVisitorResponse;
    }

    private remove(goal: GoalRule): (game: Game) => void {
        return (game: Game) => game.gameMode.removeRule(goal.name);
    }

    private doesItApplyToActivePlayer(game: Game): boolean {
        return Boolean(this.players.find((player: Player) => player.id === game.activePlayer.id));
    }

    protected abstract isCompleted(action: Action, game: Game, rulesVisitorResponse: RulesVisitorResponse): boolean;
}
