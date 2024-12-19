import { Message } from '@common/interfaces/message';

export interface Chat {
    userMessages: Map<string, Message[]>;
    id: string;
}
