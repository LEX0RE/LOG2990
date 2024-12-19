import { Injectable } from '@angular/core';
import { MathUtils } from '@app/classes/utils/math-utils';
import {
    DECREASE_ADD_FONT_SIZE as DECREASE_FONT_SIZE,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_SIZE_EASEL,
    FONT_SIZE,
    FONT_SIZE_EASEL,
    INCREASE_FONT_SIZE,
} from '@app/constants/font-letter';
import { Interval } from '@app/interface/interval';
import { GridService } from '@app/services/grid/grid.service';

@Injectable({
    providedIn: 'root',
})
export class FontSizeService {
    fontSize: number;
    fontSizeEasel: number;
    private readonly gridService: GridService;

    constructor(gridService: GridService) {
        this.fontSize = DEFAULT_FONT_SIZE;
        this.fontSizeEasel = DEFAULT_FONT_SIZE_EASEL;
        this.gridService = gridService;
    }

    onClickUp(): void {
        this.changeFontSize(INCREASE_FONT_SIZE);
    }

    onClickDown(): void {
        this.changeFontSize(DECREASE_FONT_SIZE);
    }

    private changeFontSize(newSize: number): void {
        this.changeGrid(newSize);
        this.changeFontSizeEasel(newSize);
    }

    private changeGrid(newSize: number): void {
        this.fontSize = this.isGoodFontSize(FONT_SIZE, this.fontSize, this.fontSize + newSize);
        this.gridService.changeFontSize(this.fontSize);
    }

    private changeFontSizeEasel(number: number): void {
        this.fontSizeEasel = this.isGoodFontSize(FONT_SIZE_EASEL, this.fontSizeEasel, this.fontSizeEasel + number);
    }

    private isGoodFontSize(intervalSize: Interval, oldFontSize: number, newFontSize: number): number {
        return MathUtils.isInInterval(intervalSize, newFontSize) ? newFontSize : oldFontSize;
    }
}
