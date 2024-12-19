import { PlayerTurnsQueueEntry } from '@app/interface/player-turns-queue-entry';
import { stubPlayer1 } from '@app/test/classes-stubs/player-stub';
import { stub } from 'sinon';

export const FAKE_PLAYER_1_NAME = 'fake_player_1_name';
export const FAKE_SOCKET_ID_PLAYER_1 = 'fake_socket_id_player_1';
export const FAKE_SCORE_PLAYER_1 = 23;

export const FAKE_PLAYER_2_NAME = 'fake_player_2_name';
export const FAKE_SOCKET_ID_PLAYER_2 = 'fake_socket_id_player_2';
export const FAKE_SCORE_PLAYER_2 = 243;

export const FAKE_PLAYER_TURN_ENTRY = (): PlayerTurnsQueueEntry => {
    return { endAction: stub(), player: stubPlayer1(), resolve: stub() };
};
