import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
export interface Goal {
    isCompleted: boolean;
    rule: GoalRule;
}
