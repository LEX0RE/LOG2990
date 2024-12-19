import { Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Dictionary } from '@app/interface/dictionary';
import { ExchangeServicePlayer1POV } from '@app/services/initialize-game-exchange/player-1/initialize-game-player-1-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { Difficulty } from '@common/enums/difficulty';

@Component({
    selector: 'app-bot-difficulty',
    templateUrl: './bot-difficulty.component.html',
    styleUrls: ['./bot-difficulty.component.scss'],
})
export class BotDifficultyComponent {
    @Input() start: boolean;
    difficulty: Difficulty;
    easyMode: number;
    hardMode: number;
    formBuilder: FormBuilder;
    private newGameConfigurationService: NewGameConfigurationService;
    private initializeGameExchangeService: ExchangeServicePlayer1POV;

    constructor(
        newGameConfigurationService: NewGameConfigurationService,
        initializeGameExchangeService: ExchangeServicePlayer1POV,
        formBuilder: FormBuilder,
    ) {
        this.start = true;
        this.easyMode = 0;
        this.hardMode = 0;
        this.newGameConfigurationService = newGameConfigurationService;
        this.initializeGameExchangeService = initializeGameExchangeService;
        this.formBuilder = formBuilder;
    }

    onClick(): void {
        this.newGameConfigurationService.fetchDictionaries().subscribe((receivedDictionaries) => {
            const foundDictionary = receivedDictionaries.find(
                (dictionary: Dictionary) => dictionary.title === this.newGameConfigurationService.gameInfo.value.dictionary,
            );

            if (!foundDictionary) this.newGameConfigurationService.openDictionaryOverlay = true;
            else
                this.initializeGameExchangeService.createSoloGame(
                    this.newGameConfigurationService.gameInfo,
                    this.newGameConfigurationService.timer,
                    this.newGameConfigurationService.difficulty,
                );
        });
    }

    changeToEasy(): void {
        this.difficulty = Difficulty.Easy;
        this.newGameConfigurationService.difficulty = Difficulty.Easy;
        this.easyMode = 1;
        this.hardMode = 0;
        this.start = false;
    }

    changeToHard(): void {
        this.difficulty = Difficulty.Hard;
        this.newGameConfigurationService.difficulty = Difficulty.Hard;
        this.easyMode = 0;
        this.hardMode = 1;
        this.start = false;
    }

    openUnavailableDictionary(): boolean {
        return this.newGameConfigurationService.openDictionaryOverlay;
    }
}
