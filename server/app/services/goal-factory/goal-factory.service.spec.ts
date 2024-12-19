import { Game } from '@app/classes/game/game';
import { GOAL_COUNT } from '@app/constants/log2990';
import { GoalFactory } from '@app/services/goal-factory/goal-factory.service';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { expect } from 'chai';
describe('GoalFactoryService', () => {
    let factory: GoalFactory;
    let game: Game;

    beforeEach(() => {
        game = stubGame();
        factory = new GoalFactory();
    });

    it('should create an instance', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions -- sert pour assert
        expect(factory).to.exist;
    });

    it('should create goals', () => expect(factory.createGoals(game).length).to.be.eql(GOAL_COUNT));
});
