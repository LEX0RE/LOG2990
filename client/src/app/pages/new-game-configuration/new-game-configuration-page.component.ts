import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ACCEPTED_CHARACTERS, MAX_CHARACTERS, MIN_CHARACTERS } from '@app/constants/borders-player-name';
import { DEFAULT_DICTIONARY, DEFAULT_INDEX_TURN_TIMES } from '@app/constants/new-configuration';
import { Dictionary } from '@app/interface/dictionary';
import { ExchangeServicePlayer1POV } from '@app/services/initialize-game-exchange/player-1/initialize-game-player-1-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { PlayerMode } from '@common/enums/player-mode';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';

@Component({
    selector: 'app-new-game-configuration-page',
    templateUrl: './new-game-configuration-page.component.html',
    styleUrls: ['./new-game-configuration-page.component.scss'],
})
export class NewGameConfigurationComponent implements OnInit {
    readonly minCharacters: number;
    readonly maxCharacters: number;
    newGameConfigForm: FormGroup;
    dictionaries: Dictionary[];
    turnTimes: CommonTimer[];
    turnTimeIndex: number;
    chosenDictionaryDescription: string;
    gameHasBeenCreated: boolean;
    dictionaryDescription: string;
    private newGameConfigurationService: NewGameConfigurationService;
    private router: Router;
    private formBuilder: FormBuilder;
    private exchangeServicePlayer1POV: ExchangeServicePlayer1POV;

    // eslint-disable-next-line max-params -- Importation de services
    constructor(
        newGameConfigurationService: NewGameConfigurationService,
        router: Router,
        formBuilder: FormBuilder,
        exchangeServicePlayer1POV: ExchangeServicePlayer1POV,
    ) {
        this.minCharacters = MIN_CHARACTERS;
        this.maxCharacters = MAX_CHARACTERS;
        this.gameHasBeenCreated = false;
        this.newGameConfigurationService = newGameConfigurationService;
        this.router = router;
        this.formBuilder = formBuilder;
        this.exchangeServicePlayer1POV = exchangeServicePlayer1POV;
        this.initNewGameConfig();
        this.dictionaries = [];
    }

    get gameMode(): string {
        return this.newGameConfigurationService.gameMode;
    }

    ngOnInit(): void {
        this.turnTimeIndex = DEFAULT_INDEX_TURN_TIMES;
        this.fetchDictionaries();
        this.fetchTurnTimes();
    }

    hasValidGameMode(): boolean {
        return this.newGameConfigurationService.hasValidGameMode();
    }

    openErrorCreatingGameOverlay(): boolean {
        return this.newGameConfigurationService.openErrorCreatingGameOverlay;
    }

    displayTurnDuration(): void {
        if (!this.turnTimes || this.turnTimes === []) return;
        if (this.turnTimeIndex >= this.turnTimes.length) return;
        const timer = this.turnTimes[this.turnTimeIndex];
        const timeString: string = this.convertTimeToString(timer);

        this.newGameConfigForm.controls.turnDuration.setValue(timeString);
    }

    changeDictionaryDescription(): void {
        const dictionary: string | undefined = this.dictionaries.find(
            (dict: Dictionary) => dict.title === this.newGameConfigForm.value.dictionary,
        )?.description;

        if (dictionary) this.dictionaryDescription = dictionary;
    }

    onSubmit(): void {
        this.displayTurnDuration();
        if (this.hasValidGameMode()) {
            this.newGameConfigurationService.configureGame(this.newGameConfigForm, this.turnTimes[this.turnTimeIndex]);
            this.nextPage();
        }
    }

    fetchDictionaries(): void {
        this.newGameConfigurationService.fetchDictionaries().subscribe((receivedDictionaries) => {
            this.dictionaries = receivedDictionaries;
            this.changeDictionaryDescription();
        });
    }

    fetchTurnTimes(): void {
        this.newGameConfigurationService.fetchTurnTimes().subscribe((receivedTurnTimes) => {
            this.turnTimes = receivedTurnTimes;
            this.displayTurnDuration();
        });
    }

    incrementTurnDuration(): void {
        const upperBound = this.turnTimes.length;
        const potentialNewIndex = this.turnTimeIndex + 1;

        if (potentialNewIndex >= upperBound) return;
        this.turnTimeIndex = potentialNewIndex;
        this.displayTurnDuration();
    }

    decrementTurnDuration(): void {
        const lowerBound = 0;
        const potentialNewIndex = this.turnTimeIndex - 1;

        if (potentialNewIndex < lowerBound) return;
        this.turnTimeIndex = potentialNewIndex;
        this.displayTurnDuration();
    }

    isMultiplayer(): boolean {
        return this.newGameConfigurationService.playerMode === PlayerMode.Multiplayer;
    }

    private initNewGameConfig(): void {
        const validator = [];

        validator.push(Validators.required);
        validator.push(Validators.minLength(MIN_CHARACTERS));
        validator.push(Validators.maxLength(MAX_CHARACTERS));
        validator.push(Validators.pattern(ACCEPTED_CHARACTERS));
        this.newGameConfigForm = this.formBuilder.group({
            playerName: ['', { validators: validator, updateOn: 'change' }],
            dictionary: [DEFAULT_DICTIONARY],
            turnDuration: [''],
        });
    }

    private convertTimeToString(timer: CommonTimer): string {
        return (
            timer.minute.toString() +
            ' min ' +
            timer.second.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false,
            }) +
            ' sec'
        );
    }

    private nextPage(): void {
        if (this.newGameConfigurationService.playerMode === PlayerMode.Multiplayer)
            this.exchangeServicePlayer1POV.createGame(this.newGameConfigurationService.gameInfo, this.newGameConfigurationService.timer);
        else if (this.newGameConfigurationService.playerMode === PlayerMode.Solo) this.router.navigate(['botDifficulty']);
    }
}
