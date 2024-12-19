import { TradeLetter } from '@app/classes/actions/trade-letters/trade-letters';
import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
import { Goal } from '@app/interface/goal';
import { stubPlayer1, stubPlayer2 } from '@app/test/classes-stubs/player-stub';
import { FAKE_LETTERS, FAKE_LETTERS_2 } from '@app/test/constants/fake-letter-easel';
import { GoalType } from '@common/enums/goal-type';
import { GoalUpdate } from '@common/interfaces/goal-update';
import { createStubInstance } from 'sinon';

export const FAKE_GOALS = (): Goal[] => [
    { isCompleted: false, rule: FAKE_GOAL_RULE() },
    { isCompleted: true, rule: FAKE_GOAL_RULE_2() },
    { isCompleted: false, rule: FAKE_GOAL_RULE_3() },
    { isCompleted: true, rule: FAKE_GOAL_RULE_4() },
];

export const FAKE_GOAL_NAME = 'fake-goal-rule';
export const FAKE_GOAL_RULE = (): GoalRule => {
    const goalRule = createStubInstance(GoalRule);

    goalRule.name = FAKE_GOAL_NAME;
    goalRule.players = [stubPlayer1()];
    goalRule.bonus = 15;
    goalRule.description = FAKE_GOAL_NAME;
    return goalRule as unknown as GoalRule;
};

export const FAKE_GOAL_NAME_2 = 'fake-goal-rule-2';
export const FAKE_GOAL_RULE_2 = (): GoalRule => {
    const goalRule = createStubInstance(GoalRule);

    goalRule.name = FAKE_GOAL_NAME_2;
    goalRule.players = [stubPlayer1(), stubPlayer2()];
    goalRule.bonus = 20;
    goalRule.description = FAKE_GOAL_NAME_2;
    return goalRule as unknown as GoalRule;
};

export const FAKE_GOAL_NAME_3 = 'fake-goal-rule-3';
export const FAKE_GOAL_RULE_3 = (): GoalRule => {
    const goalRule = createStubInstance(GoalRule);

    goalRule.name = FAKE_GOAL_NAME_3;
    goalRule.players = [stubPlayer1(), stubPlayer2()];
    goalRule.bonus = 40;
    goalRule.description = FAKE_GOAL_NAME_3;
    return goalRule as unknown as GoalRule;
};

export const FAKE_GOAL_NAME_4 = 'fake-goal-rule-3';
export const FAKE_GOAL_RULE_4 = (): GoalRule => {
    const goalRule = createStubInstance(GoalRule);

    goalRule.name = FAKE_GOAL_NAME_4;
    goalRule.players = [stubPlayer2()];
    goalRule.bonus = 10;
    goalRule.description = FAKE_GOAL_NAME_4;
    return goalRule as unknown as GoalRule;
};

export const FAKE_GOAL_UPDATE_1 = (): GoalUpdate => {
    return {
        goals: [
            { description: FAKE_GOAL_NAME, isCompleted: false, type: GoalType.Private, bonus: 15 },
            { description: FAKE_GOAL_NAME_2, isCompleted: true, type: GoalType.Public, bonus: 20 },
            { description: FAKE_GOAL_NAME_3, isCompleted: false, type: GoalType.Public, bonus: 40 },
            { description: FAKE_GOAL_NAME_4, isCompleted: true, type: GoalType.OtherPrivate, bonus: 10 },
        ],
    };
};

export const FAKE_GOAL_UPDATE_2 = (): GoalUpdate => {
    return {
        goals: [
            { description: FAKE_GOAL_NAME_2, isCompleted: true, type: GoalType.Public, bonus: 20 },
            { description: FAKE_GOAL_NAME_3, isCompleted: false, type: GoalType.Public, bonus: 40 },
            { description: FAKE_GOAL_NAME_4, isCompleted: true, type: GoalType.Private, bonus: 10 },
        ],
    };
};

export const FAKE_FULL_TRADE_ACTION = (): TradeLetter => new TradeLetter(FAKE_LETTERS());
export const FAKE_PARTIAL_TRADE_ACTION = (): TradeLetter => new TradeLetter(FAKE_LETTERS_2());
