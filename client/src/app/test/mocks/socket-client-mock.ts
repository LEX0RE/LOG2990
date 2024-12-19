import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { DO_NOTHING } from '@app/test/constants/do-nothing-function';

export class SocketClientServiceMock extends SocketClientService {
    override connect = DO_NOTHING;
}
