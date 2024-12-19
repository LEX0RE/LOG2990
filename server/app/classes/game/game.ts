import { PlaceLetters } from '@app/classes/actions/place-letters/places-letter';
import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { Board } from '@app/classes/board/board';
import { ClassicMode } from '@app/classes/game-mode/classic-mode/classic-mode';
import { Log2990Mode } from '@app/classes/game-mode/log2990/log2990';
import { GameWatchTower } from '@app/classes/game/game-watch-tower/game-watch-tower';
import { LetterStash } from '@app/classes/letter-stash/letter-stash';
import { Player } from '@app/classes/players/player-abstract';
import { PlacementMustBeValid } from '@app/classes/rules/placement-must-valid/placement-must-be-valid';
import { Timer } from '@app/classes/timer/timer';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { ERROR_IN_TURN } from '@app/constants/error/error-messages';
import { PLAYER_ONE_INDEX, PLAYER_TWO_INDEX, START_EVENT } from '@app/constants/game';
import { EASEL_SIZE } from '@app/constants/miscellaneous';
import { RuleName } from '@app/enum/rules';
import { Action } from '@app/interface/action-interface';
import { GameFlags } from '@app/interface/game-flags';
import { GameMode } from '@app/interface/game-mode';
import { HintUsed } from '@app/interface/hint-used';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { GameInfoFormattingService } from '@app/services/game-information-formatting/game-information-formatting';
import { LOG2990 } from '@common/constants/game-modes';
import { ActionType } from '@common/enums/action-type';
import { CommonGameConfig } from '@common/interfaces/common-game-config';
import { EventEmitter } from 'stream';
import { Container } from 'typedi';

export class Game {
    readonly gameId: string;
    gameConfig: CommonGameConfig;
    players: Player[];
    letterStash: LetterStash;
    board: Board;
    invalidRuleError: string;
    winners: Player[];
    watchTower: GameWatchTower;
    timer: Timer;
    events: EventEmitter;
    gameMode: GameMode;
    flags: GameFlags;
    beginningDate: Date;
    endingDate: Date;
    actionChoose: boolean;
    outsideResolveError!: (value: string | PromiseLike<string>) => void;
    hintUsed: HintUsed;
    private gameInfoFormattingService: GameInfoFormattingService;
    private dictionaryService: DictionaryService;

    constructor(gameId: string, gameConfig: CommonGameConfig, players: Player[]) {
        MathUtils.shuffleArray(players);
        this.gameId = gameId;
        this.gameConfig = gameConfig;
        this.players = players;
        this.letterStash = new LetterStash();
        this.board = new Board();
        this.invalidRuleError = '';
        this.winners = [];
        this.watchTower = new GameWatchTower(this);
        this.timer = new Timer(gameId, this.gameConfig.turnTimer);
        this.events = new EventEmitter();
        this.gameMode = this.gameConfig.gameModeName === LOG2990 ? new Log2990Mode(this) : new ClassicMode();
        this.flags = { firstTimePlacingLetter: true, isPlayerOneTurn: true, isGameOver: false };
        this.beginningDate = new Date(0);
        this.endingDate = new Date(0);
        this.gameInfoFormattingService = Container.get(GameInfoFormattingService);
        this.hintUsed = { wasUsed: false, hint: [], hintInProgress: false };
        this.dictionaryService = Container.get(DictionaryService);
        this.actionChoose = false;
    }

    get activePlayer(): Player {
        return this.flags.isPlayerOneTurn ? this.players[PLAYER_ONE_INDEX] : this.players[PLAYER_TWO_INDEX];
    }

    get otherPlayer(): Player[] {
        const activePlayer = this.activePlayer;

        return this.players.filter((player: Player) => player.name !== activePlayer.name);
    }

    get activePlayerIndex(): number {
        return this.flags.isPlayerOneTurn ? PLAYER_ONE_INDEX : PLAYER_TWO_INDEX;
    }

    async start(): Promise<void> {
        await this.loadDictionary();
        this.preparationGame();
        this.events.emit(START_EVENT, this);
        while (!this.flags.isGameOver) {
            this.timer.start();
            this.watchTower.update();
            await this.makeAction();
            this.changeTurn();
        }
        await this.preparationEndGame();
    }

    findIndexPlayer(socketId: string): number {
        return this.players.findIndex((player: Player) => player.id === socketId);
    }

    end() {
        this.flags.isGameOver = true;
        const maxScore = Math.max(...this.players.map((player: Player) => player.score));
        const playersWitHighestScore = this.players.filter((player: Player) => player.score === maxScore);

        this.winners = playersWitHighestScore;
        const virtualPlayer = this.flags.isPlayerOneTurn ? this.players[PLAYER_ONE_INDEX] : this.players[PLAYER_TWO_INDEX];

        if (!virtualPlayer.requiredUpdates && virtualPlayer.outsideResolve) virtualPlayer.outsideResolve(new SkipTurn());
    }

    private async executeTurn(action: Action): Promise<void> {
        const response = this.gameMode.verifyRules(action, this);

        this.board = response.newBoard;
        this.activePlayer.score += response.score;
        this.executeRulesVisitorCallBacks(response.gameModification);
        if (action.actionType === ActionType.PlaceLetters) await this.watchTower.delayWordEasel(action as unknown as PlaceLetters, false);
        this.watchTower.updateEasel(this.activePlayer);
    }

    private async makeAction(): Promise<void> {
        this.actionChoose = false;
        await this.activePlayer.nextAction().then(async (action: Action) => {
            this.actionChoose = true;
            await this.executeTurn(action)
                .then(() => {
                    if (this.flags.firstTimePlacingLetter) this.updateRules(action);
                })
                .catch(this.errorInTurnHandler(this, action));
        });
        if (this.outsideResolveError) this.outsideResolveError(this.invalidRuleError);
    }

    private errorInTurnHandler(game: Game, action: Action): (err: Error) => Promise<void> {
        return async (err: Error): Promise<void> => {
            if (err.message === ERROR_IN_TURN) await game.watchTower.delayWordEasel(action as unknown as PlaceLetters, true);

            await game.executeTurn(new SkipTurn());
            game.invalidRuleError = err.message;
        };
    }

    private executeRulesVisitorCallBacks(functions: ((g: Game) => void)[]): void {
        functions.forEach((func: (g: Game) => void) => func(this));
    }

    private preparationGame(): void {
        this.flags.isGameOver = false;
        this.winners = [];
        const playerOnesLetters = this.letterStash.removeLetters(EASEL_SIZE);
        const playerTwoLetters = this.letterStash.removeLetters(EASEL_SIZE);

        this.players[PLAYER_ONE_INDEX].easel.addLetters(playerOnesLetters);
        this.players[PLAYER_TWO_INDEX].easel.addLetters(playerTwoLetters);
        this.players.forEach((player: Player) => this.watchTower.updateEasel(player));
        this.beginningDate = new Date();
    }

    private changeTurn(): void {
        this.flags.isPlayerOneTurn = !this.flags.isPlayerOneTurn;
        this.invalidRuleError = '';
        this.hintUsed = { wasUsed: false, hint: [], hintInProgress: false };
    }

    private updateRules(action: Action): void {
        if (action.actionType === ActionType.PlaceLetters) {
            this.flags.firstTimePlacingLetter = false;
            this.gameMode.removeRule(RuleName.MustFirstPlacementBeValid);
            this.gameMode.addRule(new PlacementMustBeValid());
        }
    }

    private async preparationEndGame(): Promise<void> {
        this.watchTower.update();
        this.timer.stop();
        this.watchTower.sendEndGame();
        this.endingDate = new Date();
        await this.watchTower.addBestScores(this.players);
        await this.watchTower.addGameHistory(this.gameInfoFormattingService.formatGameInfoHistory(this));
        this.dictionaryService.unloadDictionary(this.gameConfig.dictionaryId);
    }

    private async loadDictionary() {
        await this.dictionaryService
            .loadDictionary(this.gameConfig.dictionaryTitle)
            .then((dictionaryId) => (this.gameConfig.dictionaryId = dictionaryId));
    }
}
