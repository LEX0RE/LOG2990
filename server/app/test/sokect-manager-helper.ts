import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { FAKE_EVENT } from '@app/test/constants/fake-event';
import { SinonStub, stub } from 'sinon';

export class SocketManagerHelper {
    customEventHandler: SinonStub;
    disconnectEventHandler: SinonStub;

    constructor() {
        this.customEventHandler = stub();
        this.disconnectEventHandler = stub();
    }

    addListeners(manager: SocketManager): void {
        manager.on(FAKE_EVENT, this.customEventHandler);
        manager.disconnect(this.disconnectEventHandler);
    }
}
