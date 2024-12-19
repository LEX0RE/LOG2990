import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalComponent } from '@app/components/goal/goal.component';
import { FAKE_PRIVATE_GOAL } from '@app/test/constants/fake-game-update';
import { GoalType } from '@common/enums/goal-type';

describe('GoalComponent', () => {
    let component: GoalComponent;
    let fixture: ComponentFixture<GoalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GoalComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GoalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.goal = FAKE_PRIVATE_GOAL()[0];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('goalInformation should return goal', () => {
        expect(component.goalInformation).toEqual(FAKE_PRIVATE_GOAL()[0]);
    });

    it('goalInformation should return fake goals', () => {
        const expectedGoal = { description: '', isCompleted: false, type: GoalType.Public, bonus: 0 };

        component.goal = null;
        expect(component.goalInformation).toEqual(expectedGoal);
    });
});
