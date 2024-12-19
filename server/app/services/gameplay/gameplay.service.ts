import { Game } from '@app/classes/game/game';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { WordsFind } from '@app/classes/words-find/words-find';
import { END_OF_LINE, MAX_HINTS, STASH_LETTERS } from '@app/constants/command-formatting';
import { ANY } from '@app/constants/end-searching';
import { NOT_PLAYER_TURN_ERROR } from '@app/constants/error/error-messages';
import { END_GAME } from '@app/constants/error/letter-stash';
import { HINT_COMMAND, NO_HINT, STASH_COMMAND, WARN_HINT } from '@app/constants/system-message';
import { SOME_TIME_TO_PLAY } from '@app/constants/turn-times';
import { Action } from '@app/interface/action-interface';
import { EndSearching } from '@app/interface/end-searching';
import { Hint } from '@app/interface/hint';
import { PlayerTurnsQueueEntry } from '@app/interface/player-turns-queue-entry';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { BOARD_UPDATE, EASEL_UPDATE, GAME_UPDATE } from '@common/constants/communication';
import { BoardUpdate } from '@common/interfaces/board-update';
import { EaselUpdate } from '@common/interfaces/easel-update';
import { GameUpdate } from '@common/interfaces/game-update';
import { Container, Service } from 'typedi';

@Service()
export class Gameplay {
    invalidRuleError: string;
    playerTurnsQueue: PlayerTurnsQueueEntry[];
    socketManager: SocketManager;
    gameManager: GameManager;

    constructor() {
        this.invalidRuleError = '';
        this.playerTurnsQueue = [];
        this.socketManager = Container.get(SocketManager);
        this.gameManager = Container.get(GameManager);
    }

    sendGameInfo(playerId: string, update: GameUpdate): void {
        this.socketManager.sendPrivate(GAME_UPDATE, playerId, update);
    }

    sendBoard(playerId: string, update: BoardUpdate): void {
        this.socketManager.sendPrivate(BOARD_UPDATE, playerId, update);
    }

    sendEasel(playerId: string, update: EaselUpdate): void {
        this.socketManager.sendPrivate(EASEL_UPDATE, playerId, update);
    }

    async checkIfPlayerTurn(socketId: string, action: Action): Promise<void> {
        const activePlayer = this.endPlayerTurn(socketId, action);

        if (!activePlayer) throw new Error(NOT_PLAYER_TURN_ERROR);

        const activeGame = this.gameManager.getGameByPlayerId(activePlayer.player.id);

        await this.checkIfMoveValid(activeGame);

        if (this.invalidRuleError) throw new Error(this.invalidRuleError);
    }

    async checkIfMoveValid(activeGame: Game | undefined): Promise<void> {
        if (activeGame) {
            await activeGame.watchTower.errorInTurn().then((err) => {
                this.invalidRuleError = err;
            });
        }
    }

    endPlayerTurn(socketId: string, action: Action): PlayerTurnsQueueEntry | undefined {
        const activePlayer = this.searchActivePlayer(socketId);
        const activeGame = this.gameManager.getGameByPlayerId(activePlayer.player.id);

        activePlayer.resolve(action);
        this.playerTurnsQueue.splice(this.playerTurnsQueue.indexOf(activePlayer), 1);
        activeGame?.timer.setEndTimer(null);

        return activePlayer;
    }

    searchActivePlayer(socketId: string) {
        const activePlayer = this.playerTurnsQueue.find((player) => player.player.id === socketId);

        if (!activePlayer) throw new Error(NOT_PLAYER_TURN_ERROR);
        return activePlayer;
    }

    stashInfo(socketId: string): string {
        const game = this.gameManager.getGameByPlayerId(socketId);

        if (!game) return END_GAME;
        const occurrencesMap = game.letterStash.toOccurrences;

        return MathUtils.accumulator(STASH_LETTERS, STASH_COMMAND, (output: string, letter: string) => {
            let nOccurrence = occurrencesMap.get(letter.toLowerCase());

            if (!nOccurrence) nOccurrence = 0;
            output += letter.toUpperCase() + ': ' + nOccurrence.toString() + END_OF_LINE;
            return output;
        });
    }

    async getPossibilities(playerId: string, end: EndSearching = ANY): Promise<Hint[]> {
        const fastFinder: WordsFind = new WordsFind();
        const gameFound = this.gameManager.getGameByPlayerId(playerId);
        const player = gameFound?.players.find((playerIterator) => playerIterator.id === playerId);

        if (gameFound) {
            const time = gameFound.timer.remainingTime();

            if (end === ANY) end = time > SOME_TIME_TO_PLAY ? { maxTime: time - SOME_TIME_TO_PLAY } : { found: MAX_HINTS };
            if (player) {
                gameFound.hintUsed.hint = await fastFinder.fastActions(player.easel, gameFound, end);
                gameFound.hintUsed.wasUsed = true;
                return Promise.resolve(gameFound.hintUsed.hint);
            }
        }
        return Promise.resolve([]);
    }

    async getHint(playerId: string): Promise<string> {
        const gameFound = this.gameManager.getGameByPlayerId(playerId);
        let hints: Hint[] = [];
        let result: string;

        if (gameFound) {
            hints = gameFound.hintUsed.wasUsed ? gameFound.hintUsed.hint : await this.getPossibilities(playerId);
            gameFound.hintUsed.hintInProgress = false;
        }

        if (!hints.length) return NO_HINT;
        else if (hints.length < MAX_HINTS) result = WARN_HINT;
        else {
            if (hints.length > MAX_HINTS) hints = MathUtils.randomInArray(hints, MAX_HINTS);
            result = HINT_COMMAND;
        }
        MathUtils.shuffleArray(hints);

        return result + this.formatHints(hints);
    }

    async addToPlayerTurnQueue(playerTurn: PlayerTurnsQueueEntry): Promise<void> {
        const activeGame = this.gameManager.getGameByPlayerId(playerTurn.player.id);

        if (activeGame) {
            activeGame.timer.setEndTimer(playerTurn.endAction);
            this.playerTurnsQueue.push(playerTurn);
        }
    }

    private formatHints(hints: Hint[]): string {
        let result = '';

        hints.forEach((hint: Hint) => {
            const hintMessage = END_OF_LINE + hint.action.toString();

            result += hintMessage;
        });

        return result;
    }
}
