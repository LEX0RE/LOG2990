import { Chat } from '@app/interface/chat-room';
import { FAKE_PLAYER_1_NAME, FAKE_SOCKET_ID_PLAYER_1 } from '@app/test/constants/fake-player';
import { ROOM_ONE } from '@app/test/constants/fake-room-id';
import { Message } from '@common/interfaces/message';

export const FAKE_CHAT = (): Chat => {
    return { id: ROOM_ONE, userMessages: new Map<string, Message[]>() };
};

export const FAKE_MESSAGE_CONTENT = 'hello wolrd!';

export const FAKE_MESSAGE = (): Message => {
    return { content: FAKE_MESSAGE_CONTENT, senderId: FAKE_SOCKET_ID_PLAYER_1, senderName: FAKE_PLAYER_1_NAME, time: new Date() };
};
