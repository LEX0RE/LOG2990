import { PlaceLetters } from '@app/classes/actions/place-letters/places-letter';
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { DELAY_INVALID_WORD, PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/constants/game';
import { BEGINNER_ID, EXPERT_ID } from '@app/constants/id-virtual-player';
import { BestScoreService } from '@app/services/best-score/best-score.service';
import { EndGameManager } from '@app/services/end-game-manager/end-game-manager.service';
import { GameHistory } from '@app/services/game-history/game-history.service';
import { Gameplay } from '@app/services/gameplay/gameplay.service';
import { GamePossibility } from '@common/enums/game-possibility';
import { BoardUpdate } from '@common/interfaces/board-update';
import { EaselUpdate } from '@common/interfaces/easel-update';
import { GameInfoHistory } from '@common/interfaces/game-information';
import { GameUpdate } from '@common/interfaces/game-update';
import { Container } from 'typedi';

export class GameWatchTower {
    surrenderedPlayerId: string;
    game: Game;
    gameplay: Gameplay;
    endGameManager: EndGameManager;
    bestScore: BestScoreService;
    gameHistory: GameHistory;

    constructor(game: Game) {
        this.surrenderedPlayerId = '';
        this.game = game;
        this.gameplay = Container.get(Gameplay);
        this.endGameManager = Container.get(EndGameManager);
        this.bestScore = Container.get(BestScoreService);
        this.gameHistory = Container.get(GameHistory);
    }

    update(): void {
        this.game.players.forEach((player: Player) => {
            if (player.requiredUpdates) {
                this.gameplay.sendGameInfo(player.id, this.setGameUpdate(player));
                this.updateBoard(player);
            }
        });
    }

    updateBoard(player: Player): void {
        if (player.requiredUpdates) this.gameplay.sendBoard(player.id, this.setBoardUpdate());
    }

    updateEasel(player: Player): void {
        if (player.requiredUpdates) this.gameplay.sendEasel(player.id, this.setEaselUpdate(player));
    }

    sendEndGame(): void {
        this.game.players.forEach((player) => {
            if (player.requiredUpdates) {
                if (this.game.winners.length !== this.game.players.length) this.decision(player);
                else this.endGameManager.sendEndGame(player.id, GamePossibility.Equality);
            }
        });
        this.endGameManager.sendEndMessage(this.game.players, this.game.gameId, this.game.letterStash.size);
    }

    async errorInTurn(): Promise<string> {
        return new Promise<string>((resolve) => {
            this.game.outsideResolveError = resolve;
        });
    }

    async delayWordEasel(action: PlaceLetters, invalidPlacement: boolean): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const newBoard = this.game.board.clone();
            const player = this.game.activePlayer;

            this.executeFakeAction(action, invalidPlacement);
            this.updateBoard(player);

            setTimeout(() => {
                if (invalidPlacement) this.game.board = newBoard;
                this.updateEasel(player);
                this.game.timer.stop();
                resolve(true);
            }, DELAY_INVALID_WORD);
        });
    }

    async addBestScores(players: Player[]): Promise<void> {
        await this.addBestScore(players[PLAYER_ONE_INDEX]);
        await this.addBestScore(players[PLAYER_TWO_INDEX]);
    }

    async addBestScore(player: Player): Promise<void> {
        if (this.isValidPlayer(player))
            await this.bestScore.addScore({ score: player.score, playerName: [player.name], playerId: player.id }, this.game.gameMode.mode);
    }

    async addGameHistory(gameInfo: GameInfoHistory): Promise<void> {
        await this.gameHistory.addGameToHistory(gameInfo);
    }

    private isValidPlayer(player: Player): boolean {
        return this.surrenderedPlayerId !== player.id && !player.id.includes(BEGINNER_ID) && !player.id.includes(EXPERT_ID);
    }

    private executeFakeAction(action: PlaceLetters, invalidPlacement: boolean): void {
        if (invalidPlacement) this.game.board.placeLetters(action);
    }

    private setGameUpdate(player: Player): GameUpdate {
        const isPlayerTurn = player.id === this.game.activePlayer.id;
        const otherPlayer =
            player === this.game.players[PLAYER_ONE_INDEX] ? this.game.players[PLAYER_TWO_INDEX] : this.game.players[PLAYER_ONE_INDEX];
        const playerInfo = { name: player.name, score: player.score, nLetterLeft: player.easel.size, turn: isPlayerTurn };
        const otherInfo = { name: otherPlayer.name, score: otherPlayer.score, nLetterLeft: otherPlayer.easel.size, turn: !isPlayerTurn };
        const stash = { nLettersLeft: this.game.letterStash.size };

        return { playerInfo, otherInfo, stash };
    }

    private setBoardUpdate(): BoardUpdate {
        const board = this.game.board.toCommonBoard;

        return { board };
    }

    private setEaselUpdate(player: Player): EaselUpdate {
        const easel = player.easel;

        return { easel };
    }

    private decision(player: Player): void {
        const decision = this.game.winners.includes(player) ? GamePossibility.Win : GamePossibility.Lost;

        this.endGameManager.sendEndGame(player.id, decision);
    }
}
