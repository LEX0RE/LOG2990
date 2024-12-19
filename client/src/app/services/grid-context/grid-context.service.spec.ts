import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Vector2D } from '@app/interface/vector-2d';
import { GridContextService } from '@app/services/grid-context/grid-context.service';

describe('GridContextService', () => {
    let service: GridContextService;
    let position1: Vector2D;
    let position2: Vector2D;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
        });
        service = TestBed.inject(GridContextService);
        position1 = { x: 0, y: 1 };
        position2 = { x: 1, y: 0 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('comparePosition should give false if two position is not the same', () => {
        service.comparePosition(position1, position2);
        expect(service.comparePosition(position1, position2)).toBeFalse();
    });

    it('comparePosition should give true if two position is  the same', () => {
        service.comparePosition(position1, position1);
        expect(service.comparePosition(position1, position2)).toBeFalse();
    });
});
