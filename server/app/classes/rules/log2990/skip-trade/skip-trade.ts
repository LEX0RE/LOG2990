import { TradeLetter } from '@app/classes/actions/trade-letters/trade-letters';
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
import { SKIP_TRADE_BONUS, SKIP_TRADE_DESCRIPTION } from '@app/constants/log2990';
import { RuleName } from '@app/enum/rules';
import { Action } from '@app/interface/action-interface';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { ActionType } from '@common/enums/action-type';

export class SkipTrade extends GoalRule {
    name: string;
    players: Player[];
    bonus: number;
    description: string;
    skipTurnHasOccurred: Map<number, boolean>;

    // eslint-disable-next-line no-unused-vars -- necessaire pour avoir des constructeurs uniforme pour l'usine
    constructor(players: Player[], _game: Game) {
        super();
        this.name = RuleName.SkipTrade;
        this.players = players;
        this.description = SKIP_TRADE_DESCRIPTION;
        this.bonus = SKIP_TRADE_BONUS;
        this.skipTurnHasOccurred = new Map<number, boolean>();
        players.forEach((_player: Player, index: number) => this.skipTurnHasOccurred.set(index, false));
    }

    protected isCompleted(action: Action, game: Game, rulesVisitorResponse: RulesVisitorResponse): boolean {
        if (action.actionType === ActionType.SkipTurn) {
            if (game.actionChoose) rulesVisitorResponse.gameModification.push(this.addSkipTurn(this, game.activePlayerIndex));
            return false;
        }
        if (this.isTradeTurn(action, game.activePlayerIndex)) {
            const trade = action as TradeLetter;

            if (trade.letters.length === game.activePlayer.easel.size) return true;
        }
        if (game.actionChoose) rulesVisitorResponse.gameModification.push(this.resetSkipTurn(this, game.activePlayerIndex));
        return false;
    }

    private addSkipTurn(goal: SkipTrade, playerIndex: number) {
        return () => goal.skipTurnHasOccurred.set(playerIndex, true);
    }

    private resetSkipTurn(goal: SkipTrade, playerIndex: number) {
        return () => goal.skipTurnHasOccurred.set(playerIndex, false);
    }

    private isTradeTurn(action: Action, playerIndex: number): boolean {
        const hasSkipTurn = this.skipTurnHasOccurred.get(playerIndex);

        return hasSkipTurn ? hasSkipTurn && action.actionType === ActionType.Trade : false;
    }
}
