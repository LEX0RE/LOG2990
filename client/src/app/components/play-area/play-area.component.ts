import { AfterViewInit, Component, DoCheck, ElementRef, ViewChild } from '@angular/core';
import { DEFAULT_SIZE } from '@app/constants/grid';
import { ENTER } from '@app/constants/keyboard';
import { PlacementStep } from '@app/enum/placements';
import { Vector2D } from '@app/interface/vector-2d';
import { CommandConversionService } from '@app/services/command-conversion/command-conversion.service';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { GridContextService } from '@app/services/grid-context/grid-context.service';
import { GridService } from '@app/services/grid/grid.service';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, DoCheck {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    isPlacement: boolean;
    readonly gameUpdate: GameUpdaterService;
    private canvasSize: number;
    private coordinateClick: Vector2D;
    private readonly gridService: GridService;
    private gridContext: GridContextService;
    private readonly commandSender: CommandConversionService;

    // eslint-disable-next-line max-params -- a besoin de ces 4 services pour fonctionner
    constructor(gridService: GridService, gridContext: GridContextService, gameUpdate: GameUpdaterService, commandSender: CommandConversionService) {
        this.gameUpdate = gameUpdate;
        this.canvasSize = DEFAULT_SIZE;
        this.gridService = gridService;
        this.gridContext = gridContext;
        this.commandSender = commandSender;
    }

    get size(): number {
        return this.canvasSize;
    }

    buttonDetect(event: KeyboardEvent): void {
        this.gridService.keyboardClick(event.key);
    }

    ngDoCheck(): void {
        if (this.gridContext.gridContext) {
            this.isPlacement = this.gridContext.placement.step === PlacementStep.KeyboardPlacement;
            this.gridService.drawGrid();
            this.gridService.putWord(this.gameUpdate.board);
            if (!this.gameUpdate.playerInfo.turn) this.gridService.gridReset();
            this.gridService.putPlacement();
        }
    }

    ngAfterViewInit(): void {
        this.gridContext.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.drawGrid();
        this.gridService.putWord(this.gameUpdate.board);
        this.gridCanvas.nativeElement.focus();
    }

    onClickPass(): void {
        if (this.gameUpdate.playerInfo.turn) this.commandSender.sendSkipTurn();
    }

    onMouseDown(event: MouseEvent): void {
        this.coordinateClick = { x: event.offsetX, y: event.offsetY };
        if (this.gameUpdate.playerInfo.turn) this.gridService.mouseClick(this.coordinateClick);
    }

    onClickPlay(): void {
        this.gridService.keyboardClick(ENTER);
    }

    onFocusOut(): void {
        if (this.gameUpdate.playerInfo.turn) this.gridService.reset();
    }
}
