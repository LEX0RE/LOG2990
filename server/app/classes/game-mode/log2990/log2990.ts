import { ClassicMode } from '@app/classes/game-mode/classic-mode/classic-mode';
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { MustSendGoals } from '@app/classes/rules/log2990/must-send-goals/must-send-goals';
import { START_EVENT } from '@app/constants/game';
import { Goal } from '@app/interface/goal';
import { GoalFactory } from '@app/services/goal-factory/goal-factory.service';
import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { GOAL_UPDATE, RECONNECTION } from '@common/constants/communication';
import { LOG2990 } from '@common/constants/game-modes';
import { GoalType } from '@common/enums/goal-type';
import { CommonGoal } from '@common/interfaces/goal';
import { GoalUpdate } from '@common/interfaces/goal-update';
import { Container } from 'typedi';

export class Log2990Mode extends ClassicMode {
    factory: GoalFactory;
    socketService: SocketManager;
    goals: Goal[];

    constructor(game: Game) {
        super();
        this.socketService = Container.get(SocketManager);
        this.factory = Container.get(GoalFactory);
        this.goals = this.factory.createGoals(game);
        this.mode = LOG2990;

        this.addRules();
        game.events.on(START_EVENT, this.onStartEvent(this));
        game.events.on(RECONNECTION, this.onStartEvent(this));
    }

    removeRule(ruleName: string): void {
        super.removeRule(ruleName);
        const goalFound = this.goals.find((goal: Goal) => goal.rule.name === ruleName);

        if (goalFound) goalFound.isCompleted = true;
    }

    sendGoals(game: Game): void {
        game.players.forEach((player: Player) => this.sendGoalForPlayer(player));
    }

    private onStartEvent(gameMode: Log2990Mode): (game: Game) => void {
        return (game: Game) => gameMode.sendGoals(game);
    }

    private sendGoalForPlayer(player: Player): void {
        if (!player.requiredUpdates) return;
        const update: GoalUpdate = { goals: [] };

        this.goals.forEach((goal: Goal) => {
            const restricted = this.isPrivateGoal(goal) ? GoalType.Private : GoalType.Public;

            if (goal.rule.players.find((playerIterator) => player.id === playerIterator.id)) update.goals.push(this.formatGoal(goal, restricted));
            else if (goal.isCompleted) update.goals.push(this.formatGoal(goal, GoalType.OtherPrivate));
        });

        this.socketService.sendPrivate(GOAL_UPDATE, player.id, update);
    }

    private formatGoal(goal: Goal, type: GoalType): CommonGoal {
        return {
            description: goal.rule.description,
            isCompleted: goal.isCompleted,
            type,
            bonus: goal.rule.bonus,
        };
    }

    private isPrivateGoal(goal: Goal): boolean {
        return goal.rule.players.length === 1;
    }

    private addRules(): void {
        this.goals.forEach((goal: Goal) => {
            this.rules.push(goal.rule);
        });
        this.rules.push(new MustSendGoals());
    }
}
