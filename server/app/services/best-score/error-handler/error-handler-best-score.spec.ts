import { ErrorHandlerBestScoreService } from '@app/services/best-score/error-handler/error-handler-best-score';
import { FAKE_SOCKET_ID_PLAYER_1 } from '@app/test/constants/fake-player';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { assert, restore, stub } from 'sinon';

describe('ErrorHandlerBestScoreService', () => {
    let errorHandler: ErrorHandlerBestScoreService;
    const stubs = new ServiceStubHelper();

    beforeEach(async () => {
        stubs.stubAllService();
        errorHandler = new ErrorHandlerBestScoreService();
        stubs.socketManager.disconnectClient(stubs.clientSocket);
        stubs.clientSocket.id = FAKE_SOCKET_ID_PLAYER_1;
        stubs.socketManager.connectClient(stubs.clientSocket);
    });

    afterEach(() => {
        restore();
    });

    it('sendErrorMessage should call sendPrivate', async () => {
        // eslint-disable-next-line dot-notation -- Propriété privée
        const spySendPrivate = stub(errorHandler['socketManager'], 'sendPrivate');

        errorHandler.sendErrorMessage(FAKE_SOCKET_ID_PLAYER_1);
        assert.called(spySendPrivate);
    });
});
