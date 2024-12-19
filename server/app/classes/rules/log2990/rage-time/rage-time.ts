import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
import { RAGE_TIME_BONUS, RAGE_TIME_DEFAULT, RAGE_TIME_DESCRIPTION, RAGE_TIME_N_TURNS } from '@app/constants/log2990';
import { THREE_SECOND } from '@app/constants/miscellaneous';
import { RuleName } from '@app/enum/rules';
import { Action } from '@app/interface/action-interface';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { ActionType } from '@common/enums/action-type';

export class RageTime extends GoalRule {
    name: string;
    players: Player[];
    bonus: number;
    description: string;
    nTurns: Map<number, number>;

    // eslint-disable-next-line no-unused-vars -- necessaire pour avoir des constructeurs uniforme pour l'usine
    constructor(players: Player[], _game: Game) {
        super();
        this.name = RuleName.RageTime;
        this.players = players;
        this.description = RAGE_TIME_DESCRIPTION;
        this.bonus = RAGE_TIME_BONUS;
        this.nTurns = new Map<number, number>();
        players.forEach((_player: Player, index: number) => this.nTurns.set(index, RAGE_TIME_DEFAULT));
    }

    protected isCompleted(action: Action, game: Game, rulesVisitorResponse: RulesVisitorResponse): boolean {
        if (!this.isAConsecutivePlacement(action, game)) {
            if (game.actionChoose) rulesVisitorResponse.gameModification.push(this.resetTurnToSequence(this, game.activePlayerIndex));
            return false;
        }
        if (game.actionChoose) rulesVisitorResponse.gameModification.push(this.addTurnToSequence(this, game.activePlayerIndex));

        let numberOfTurn = this.nTurns.get(game.activePlayerIndex);

        if (!numberOfTurn) return false;
        numberOfTurn = game.actionChoose ? numberOfTurn : numberOfTurn + 1;
        return numberOfTurn >= RAGE_TIME_N_TURNS;
    }

    private isAConsecutivePlacement(action: Action, game: Game): boolean {
        return action.actionType === ActionType.PlaceLetters && game.timer.remainingTime() <= THREE_SECOND;
    }

    private addTurnToSequence(goal: RageTime, playerIndex: number) {
        return () => {
            const getNumber = goal.nTurns.get(playerIndex);
            const number = getNumber ? getNumber + 1 : RAGE_TIME_DEFAULT + 1;

            goal.nTurns.set(playerIndex, number);
        };
    }

    private resetTurnToSequence(goal: RageTime, playerIndex: number) {
        return () => goal.nTurns.set(playerIndex, RAGE_TIME_DEFAULT);
    }
}
