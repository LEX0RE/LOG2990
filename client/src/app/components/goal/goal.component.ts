import { Component, Input } from '@angular/core';
import { GoalType } from '@common/enums/goal-type';
import { CommonGoal } from '@common/interfaces/goal';

@Component({
    selector: 'app-goal',
    templateUrl: './goal.component.html',
    styleUrls: ['./goal.component.scss'],
})
export class GoalComponent {
    @Input() goal: CommonGoal | undefined | null;

    get goalInformation(): CommonGoal {
        if (this.goal) return this.goal;
        return { description: '', isCompleted: false, type: GoalType.Public, bonus: 0 };
    }
}
