import { Player } from '@app/classes/players/player-abstract';
import { RealPlayer } from '@app/classes/players/real-player/real-player';
import { stubEasel } from '@app/test/classes-stubs/easel-stub';
import {
    FAKE_PLAYER_1_NAME,
    FAKE_PLAYER_2_NAME,
    FAKE_SCORE_PLAYER_1,
    FAKE_SCORE_PLAYER_2,
    FAKE_SOCKET_ID_PLAYER_1,
    FAKE_SOCKET_ID_PLAYER_2,
} from '@app/test/constants/fake-player';
import { createStubInstance } from 'sinon';

export const stubPlayer1 = (): Player => {
    const player = createStubInstance(RealPlayer);

    player.requiredUpdates = true;
    player.timeLimit = 0;
    player.name = FAKE_PLAYER_1_NAME;
    player.id = FAKE_SOCKET_ID_PLAYER_1;
    player.score = FAKE_SCORE_PLAYER_1;
    player.easel = stubEasel();

    return player as unknown as Player;
};

export const stubPlayer2 = (): Player => {
    const player = createStubInstance(RealPlayer);

    player.requiredUpdates = false;
    player.timeLimit = 0;
    player.name = FAKE_PLAYER_2_NAME;
    player.id = FAKE_SOCKET_ID_PLAYER_2;
    player.score = FAKE_SCORE_PLAYER_2;
    player.easel = stubEasel();

    return player as unknown as Player;
};
