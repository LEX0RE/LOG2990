import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { RealPlayer } from '@app/classes/players/real-player/real-player';
import { BeginnerPlayer } from '@app/classes/players/virtual-player/beginner-player/beginner-player';
import { ExpertPlayer } from '@app/classes/players/virtual-player/expert-player/expert-player';
import { INDEX_NOT_FOUND } from '@app/constants/miscellaneous';
import { WaitingGame } from '@app/interface/waiting-game';
import { Difficulty } from '@common/enums/difficulty';
import { CommonGameConfig } from '@common/interfaces/common-game-config';
import { Service } from 'typedi';

@Service()
export class GameManager {
    waitingGames: WaitingGame[];
    private games: Game[];

    constructor() {
        this.waitingGames = [];
        this.games = [];
    }

    createWaitingGame(gameConfig: CommonGameConfig): boolean {
        const gameFound = this.waitingGames.find((game) => game.gameId === gameConfig.gameId);

        if (gameFound) return false;
        const player = new RealPlayer(gameConfig.player1Name, gameConfig.player1SocketId);
        const waitingGame: WaitingGame = { gameId: gameConfig.gameId, gameConfig, player, isWaitingForConfirmation: false };

        this.waitingGames.push(waitingGame);
        return true;
    }

    joinMultiplayerGame(playerId: string, name: string, gameId: string): Game | undefined {
        const foundGame = this.findGameToJoin(gameId);

        // eslint-disable-next-line no-undefined -- undefined sert de valeur dans ce cas-ci
        if (!foundGame) return undefined;
        const player = new RealPlayer(name, playerId);

        return this.sendGame(foundGame.index, foundGame.waitingGame, player);
    }

    joinSoloGame(name: string, gameId: string, difficulty: Difficulty): Game | undefined {
        const foundGame = this.findGameToJoin(gameId);

        // eslint-disable-next-line no-undefined -- undefined sert de valeur dans ce cas-ci
        if (!foundGame) return undefined;

        return this.sendGame(foundGame.index, foundGame.waitingGame, this.chooseDifficulty(name, difficulty, foundGame.waitingGame.player.id));
    }

    getGame(gameId: string): Game | undefined {
        return this.games.find((game: Game) => game.gameId === gameId);
    }

    getGameByPlayerId(socketId: string): Game | undefined {
        return this.games.find((game: Game) => game.players.find((player: Player) => player.id === socketId));
    }

    getWaitingGame(gameId: string): WaitingGame | undefined {
        return this.waitingGames.find((game: WaitingGame) => game.gameId === gameId);
    }

    deleteWaitingGame(player1SocketId: string): void {
        this.waitingGames = this.waitingGames.filter((game: WaitingGame) => game.player.id !== player1SocketId);
    }

    deleteGame(gameId: string): void {
        this.games = this.games.filter((game: Game) => game.gameId !== gameId);
    }

    private findGameToJoin(gameId: string): { waitingGame: WaitingGame; index: number } | undefined {
        const gameFound = this.waitingGames.find((game) => game.gameId === gameId);
        const gameIndex = this.waitingGames.findIndex((game) => game.gameId === gameId);

        if (gameFound && gameIndex !== INDEX_NOT_FOUND) return { waitingGame: gameFound, index: gameIndex };
        // eslint-disable-next-line no-undefined -- undefined sert de valeur dans ce cas-ci
        return undefined;
    }

    private sendGame(index: number, gameFound: WaitingGame, player: Player): Game {
        this.waitingGames.splice(index, 1);
        const gameStart = new Game(gameFound.gameId, gameFound.gameConfig, [gameFound.player, player]);

        this.games.push(gameStart);
        return gameStart;
    }

    private chooseDifficulty(name: string, difficulty: Difficulty, playerId: string): Player {
        switch (difficulty) {
            case Difficulty.Easy:
                return new BeginnerPlayer(name, playerId);
            case Difficulty.Hard:
                return new ExpertPlayer(name, playerId);
            default:
                return new BeginnerPlayer(name, playerId);
        }
    }
}
