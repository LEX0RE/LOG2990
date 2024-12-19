import { Game } from '@app/classes/game/game';
import { GameInfoHistory } from '@common/interfaces/game-information';
import { Service } from 'typedi';

@Service()
export class GameInfoFormattingService {
    formatGameInfoHistory(game: Game): GameInfoHistory {
        const isSurrendered = Boolean(game.watchTower.surrenderedPlayerId);

        return {
            beginningDate: game.beginningDate,
            duration: this.getDuration(game.beginningDate, game.endingDate),
            player1: { name: game.players[0].name, score: game.players[0].score },
            player2: { name: game.players[1].name, score: game.players[1].score },
            gameModeName: game.gameConfig.gameModeName,
            isSurrendered,
        };
    }

    private getDuration(beginningDate: Date, endingDate: Date): number {
        return endingDate.getTime() - beginningDate.getTime();
    }
}
