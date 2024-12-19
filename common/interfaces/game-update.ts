import { CommonStash } from '@common/interfaces/game-view-related/common-stash';
import { CommonPlayerInfo } from '../../client/src/app/interface/common-player-info';

export interface GameUpdate {
    playerInfo: CommonPlayerInfo;
    otherInfo: CommonPlayerInfo;
    stash: CommonStash;
}
