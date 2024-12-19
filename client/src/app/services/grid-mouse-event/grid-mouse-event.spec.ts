/* eslint-disable dot-notation -- Propriété/Méthode privée */
import { TestBed } from '@angular/core/testing';
import { Vector2D } from '@app/interface/vector-2d';
import { GridMouseEvent } from '@app/services/grid-mouse-event/grid-mouse-event.service';
import { GridMouseEventLogic } from '@app/services/grid-mouse-event/logic/grid-mouse-event-logic.service';
import { GridMouseEventView } from '@app/services/grid-mouse-event/view/grid-mouse-event-view.service';
import { mockGridMouseEventLogic, mockGridMouseEventView } from '@app/test/mocks/grid-mouse-event-mock';

describe('GridMouseEvent', () => {
    let service: GridMouseEvent;
    let coordinate: Vector2D;
    let logic: GridMouseEventLogic;
    let view: GridMouseEventView;

    beforeEach(() => {
        logic = mockGridMouseEventLogic();
        view = mockGridMouseEventView();
        TestBed.configureTestingModule({
            providers: [
                { provide: GridMouseEventLogic, useValue: logic },
                { provide: GridMouseEventView, useValue: view },
            ],
        });
        service = TestBed.inject(GridMouseEvent);

        service['gridMouseEventLogic'] = logic;

        service['gridMouseEventView'] = view;
        coordinate = { x: 0, y: 0 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('mouseClick should call to mouseClick from gridMouseEventLogic', () => {
        service.mouseClick(coordinate);

        expect(service['gridMouseEventLogic'].mouseClick).toHaveBeenCalledWith(coordinate);
    });

    it('keyboardClick should call to keyboardClick from gridMouseEventLogic', () => {
        service.keyboardClick('');

        expect(service['gridMouseEventLogic'].keyboardClick).toHaveBeenCalledWith('');
    });

    it('sendToServer should call to sendToServer from gridMouseEventLogic', () => {
        service.sendToServer();

        expect(service['gridMouseEventLogic'].sendToServer).toHaveBeenCalled();
    });

    it('reset should call to reset from gridMouseEventLogic', () => {
        service.reset();

        expect(service['gridMouseEventLogic'].reset).toHaveBeenCalled();
    });

    it('update should call to update from gridMouseEventView', () => {
        service.update();
        expect(service['gridMouseEventView'].updateView).toHaveBeenCalled();
    });
});
