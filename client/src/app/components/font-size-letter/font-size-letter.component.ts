import { Component } from '@angular/core';
import { FontSizeService } from '@app/services/font-size/font-size.service';

@Component({
    selector: 'app-font-size-letter',
    templateUrl: './font-size-letter.component.html',
    styleUrls: ['./font-size-letter.component.scss'],
})
export class FontSizeLetterComponent {
    private readonly fontSizeService: FontSizeService;

    constructor(fontSizeService: FontSizeService) {
        this.fontSizeService = fontSizeService;
    }

    onClickUp(): void {
        this.fontSizeService.onClickUp();
    }

    onClickDown(): void {
        this.fontSizeService.onClickDown();
    }
}
