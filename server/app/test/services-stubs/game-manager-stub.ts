import { GameManager } from '@app/services/game-manager/game-manager.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

export const stubGameManager = (): SinonStubbedInstance<GameManager> => {
    const service = createStubInstance(GameManager);

    service.waitingGames = [];
    return service;
};
