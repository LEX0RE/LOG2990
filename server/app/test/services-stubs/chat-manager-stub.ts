import { Chat } from '@app/interface/chat-room';
import { ChatManager } from '@app/services/chat-manager/chat-manager.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

export const stubChatManager = (): SinonStubbedInstance<ChatManager> => {
    const service = createStubInstance(ChatManager);

    service.userToChat = new Map<string, Chat>();
    service.roomIdToChat = new Map<string, Chat>();
    service.socketIdToName = new Map<string, string>();
    return service;
};
