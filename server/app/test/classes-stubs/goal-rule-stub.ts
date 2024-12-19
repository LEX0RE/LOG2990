import { Player } from '@app/classes/players/player-abstract';
import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
import { stubPlayer1 } from '@app/test/classes-stubs/player-stub';
import { FAKE_GOAL_NAME } from '@app/test/constants/fake-goals';
import { SinonStub, stub } from 'sinon';

export const FAKE_DESCRIPTION = 'fake-description';
export const FAKE_BONUS = 15;

export class ConcreteGoalRuleStub extends GoalRule {
    description: string;
    players: Player[];
    name: string;
    bonus: number;
    isCompleted: SinonStub;

    constructor() {
        super();
        this.description = FAKE_DESCRIPTION;
        this.players = [stubPlayer1()];
        this.name = FAKE_GOAL_NAME;
        this.bonus = FAKE_BONUS;
        this.isCompleted = stub();
    }
}
