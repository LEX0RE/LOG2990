import { CommonTimer } from './game-view-related/common-timer';

export interface CommonGameConfig {
    gameModeName: string;
    turnTimer: CommonTimer;
    dictionaryTitle: string;
    dictionaryId: number;
    player1Name: string;
    player1SocketId: string;
    gameId: string;
}
