import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { BonusMaster } from '@app/classes/rules/log2990/bonus-master/bonus-master';
import { Corner } from '@app/classes/rules/log2990/corner/corner';
import { FormedWordLengthX } from '@app/classes/rules/log2990/formed-word-length-x/formed-word-length-x';
import { GoalRule } from '@app/classes/rules/log2990/goal-rule/goal-rule';
import { LetterTrio } from '@app/classes/rules/log2990/letter-trio/letter-trio';
import { QuickPlacement } from '@app/classes/rules/log2990/quick-placement/quick-placement';
import { RageTime } from '@app/classes/rules/log2990/rage-time/rage-time';
import { ScoreOnePoint } from '@app/classes/rules/log2990/score-one-point/score-one-point';
import { SkipTrade } from '@app/classes/rules/log2990/skip-trade/skip-trade';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/constants/game';
import { GOAL_COUNT } from '@app/constants/log2990';
import { Goal } from '@app/interface/goal';
import { Service } from 'typedi';

@Service()
export class GoalFactory {
    private readonly rulesFactoryMethods: (new (players: Player[], game: Game) => GoalRule)[];

    constructor() {
        this.rulesFactoryMethods = [BonusMaster, Corner, FormedWordLengthX, LetterTrio, QuickPlacement, RageTime, ScoreOnePoint, SkipTrade];
    }

    createGoals(game: Game): Goal[] {
        const goalRules = MathUtils.randomInArray(this.rulesFactoryMethods, GOAL_COUNT);
        const players: Player[][] = [[game.players[PLAYER_ONE_INDEX]], [game.players[PLAYER_TWO_INDEX]], game.players, game.players];

        return goalRules.map((rule: new (players: Player[], game: Game) => GoalRule, index: number) => {
            return { isCompleted: false, rule: new rule(players[index], game) };
        });
    }
}
