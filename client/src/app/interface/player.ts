import { CommonPlayerInfo } from '@app/interface/common-player-info';

export class Player implements CommonPlayerInfo {
    name: string;
    score: number;
    nLetterLeft: number;
    turn: boolean;
}
