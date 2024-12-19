import { Injectable } from '@angular/core';
import { INITIAL_PLACEMENT } from '@app/constants/grid';
import { PlacementStep } from '@app/enum/placements';
import { Placement } from '@app/interface/placement';
import { PositionLetter } from '@app/interface/position-letter';
import { Vector2D } from '@app/interface/vector-2d';
import { CommandConversionService } from '@app/services/command-conversion/command-conversion.service';
import { Orientation } from '@common/enums/orientation';
@Injectable({
    providedIn: 'root',
})
export class GridContextService {
    gridContext: CanvasRenderingContext2D;
    saveLetterSquare: PositionLetter[];
    placement: Placement;
    conversionService: CommandConversionService;

    constructor(conversion: CommandConversionService) {
        this.saveLetterSquare = [];
        this.placement = {
            initialPlacement: INITIAL_PLACEMENT,
            orientation: Orientation.None,
            step: PlacementStep.NoClick,
            letters: [],
        };
        this.conversionService = conversion;
    }

    comparePosition(position1: Vector2D, position2: Vector2D): boolean {
        return position1.x === position2.x && position1.y === position2.y;
    }
}
