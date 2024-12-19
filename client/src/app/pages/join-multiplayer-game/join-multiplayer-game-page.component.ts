import { AfterContentInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MathUtils } from '@app/classes/utils/math-utils';
import { ACCEPTED_CHARACTERS, MAX_CHARACTERS, MIN_CHARACTERS } from '@app/constants/borders-player-name';
import { ExchangePlayer2PovService } from '@app/services/initialize-game-exchange/player-2/initialize-game-player-2-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { CommonGameConfig } from '@common/interfaces/common-game-config';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';

@Component({
    selector: 'app-join-multiplayer-game-page',
    templateUrl: './join-multiplayer-game-page.component.html',
    styleUrls: ['./join-multiplayer-game-page.component.scss'],
})
export class JoinMultiplayerGameComponent implements OnInit, AfterContentInit {
    tryingToJoinGame: boolean;
    twoPlayersHaveSameName: boolean;
    chosenGameIsStillAvailable: boolean;
    isAbleToJoinGame: boolean;
    chosenGame: string;
    potentialOpponentName: string;
    askPlayerName: FormGroup;
    private potentialDictionaryTitle: string;
    private potentialTimer: string;
    private newGameConfigurationService: NewGameConfigurationService;
    private exchangePlayer2PovService: ExchangePlayer2PovService;
    private formBuilder: FormBuilder;

    constructor(
        newGameConfigurationService: NewGameConfigurationService,
        exchangePlayer2PovService: ExchangePlayer2PovService,
        formBuilder: FormBuilder,
    ) {
        const validator = [];

        this.tryingToJoinGame = false;
        this.twoPlayersHaveSameName = false;
        this.isAbleToJoinGame = true;
        this.newGameConfigurationService = newGameConfigurationService;
        this.exchangePlayer2PovService = exchangePlayer2PovService;
        this.formBuilder = formBuilder;

        validator.push(Validators.required);
        validator.push(Validators.minLength(MIN_CHARACTERS));
        validator.push(Validators.maxLength(MAX_CHARACTERS));
        validator.push(Validators.pattern(ACCEPTED_CHARACTERS));
        this.askPlayerName = this.formBuilder.group({ playerName: ['', { validators: validator, updateOn: 'change' }] });
    }

    get availableGames(): CommonGameConfig[] {
        return this.exchangePlayer2PovService.availableGames;
    }

    get dictionaryTitle(): string {
        return this.potentialDictionaryTitle;
    }

    get timer(): string {
        return this.potentialTimer;
    }

    get gameMode(): string {
        return this.newGameConfigurationService.gameMode;
    }

    ngAfterContentInit(): void {
        if (this.newGameConfigurationService.randomJoin) this.joinRandomGame()();
    }

    ngOnInit(): void {
        this.exchangePlayer2PovService.getAvailableGames();
    }

    formatTimer(timer: CommonTimer): string {
        return (
            timer.minute.toString() +
            ' min ' +
            timer.second.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false,
                maximumFractionDigits: 0,
            }) +
            ' sec'
        );
    }

    getOpponentName(): string {
        return this.potentialOpponentName;
    }

    askPlayerForName(): void {
        this.tryingToJoinGame = true;
    }

    getHasBeenRejected(): boolean {
        return this.exchangePlayer2PovService.hasBeenRejected;
    }

    closeRejectedOverlay(): void {
        this.exchangePlayer2PovService.closeRejectedOverlay();
    }

    tryJoiningGame(game: CommonGameConfig) {
        this.chosenGame = game.gameId;
        this.tryingToJoinGame = true;
        this.potentialDictionaryTitle = game.dictionaryTitle;
        this.potentialTimer = this.formatTimer(game.turnTimer);
        this.potentialOpponentName = game.player1Name;
    }

    onSubmit(): void {
        if ((this.askPlayerName.value.playerName as string).toLocaleLowerCase() !== this.potentialOpponentName.toLocaleLowerCase()) {
            this.tryingToJoinGame = false;
            this.exchangePlayer2PovService.tryJoinGame(this.chosenGame, this.askPlayerName.value.playerName);
        } else this.twoPlayersHaveSameName = true;
    }

    getMinCharacters(): number {
        return MIN_CHARACTERS;
    }

    getMaxCharacters(): number {
        return MAX_CHARACTERS;
    }

    joinRandomGame(): () => void {
        return (): void => {
            this.newGameConfigurationService.randomJoin = false;
            if (!this.availableGames.length) return;
            const randomIndex = MathUtils.randomNumberInInterval(0, this.availableGames.length - 1);
            const randomGame = this.availableGames[randomIndex];

            this.tryJoiningGame(randomGame);
        };
    }
}
