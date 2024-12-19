import { Component } from '@angular/core';
import { CommandConversionService } from '@app/services/command-conversion/command-conversion.service';

@Component({
    selector: 'app-help-button',
    templateUrl: './help-button.component.html',
    styleUrls: ['./help-button.component.scss'],
})
export class HelpButtonComponent {
    isTouched: boolean;
    private readonly conversionService: CommandConversionService;

    constructor(conversion: CommandConversionService) {
        this.conversionService = conversion;
    }

    askHelp() {
        this.conversionService.sendHelp();
    }
}
