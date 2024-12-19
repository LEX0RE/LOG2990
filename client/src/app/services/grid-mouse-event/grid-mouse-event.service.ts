import { Injectable } from '@angular/core';
import { PositionLetter } from '@app/interface/position-letter';
import { Vector2D } from '@app/interface/vector-2d';
import { GridMouseEventLogic } from '@app/services/grid-mouse-event/logic/grid-mouse-event-logic.service';
import { GridMouseEventView } from '@app/services/grid-mouse-event/view/grid-mouse-event-view.service';

@Injectable({
    providedIn: 'root',
})
export class GridMouseEvent {
    letterInGrid: PositionLetter[];
    private gridMouseEventLogic: GridMouseEventLogic;
    private gridMouseEventView: GridMouseEventView;

    constructor(gridMouseEventLogic: GridMouseEventLogic, gridMouseEventView: GridMouseEventView) {
        this.gridMouseEventLogic = gridMouseEventLogic;
        this.gridMouseEventView = gridMouseEventView;
    }

    mouseClick(coordinateClick: Vector2D): void {
        this.gridMouseEventLogic.mouseClick(coordinateClick);
    }

    keyboardClick(event: string): void {
        this.gridMouseEventLogic.keyboardClick(event);
    }

    update(): void {
        this.gridMouseEventView.updateView();
    }

    sendToServer(): void {
        this.gridMouseEventLogic.sendToServer();
    }

    reset(): void {
        this.gridMouseEventLogic.reset();
    }

    gridReset(): void {
        this.gridMouseEventLogic.gridReset();
    }
}
