import { MessageType } from '@app/enum/message-type';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler/chat-message-handler.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

export const stubChatFilter = (): SinonStubbedInstance<ChatMessageHandlerService> => {
    const service = createStubInstance(ChatMessageHandlerService);

    service.messageType = MessageType.All;
    return service;
};
