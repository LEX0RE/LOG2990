import { CommonBestScore } from '@common/interfaces/game-view-related/common-best-score';

export interface BestScore extends CommonBestScore {
    playerId: string;
}
