import { PlayerInfoHistory } from './player-information';

export interface GameInfoHistory {
    beginningDate: Date;
    duration: number;
    player1: PlayerInfoHistory;
    player2: PlayerInfoHistory;
    gameModeName: string;
    isSurrendered: boolean;
}
