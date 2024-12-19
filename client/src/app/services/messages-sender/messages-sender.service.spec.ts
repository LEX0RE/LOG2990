import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageSenderService } from '@app/services/messages-sender/messages-sender.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { SocketClientServiceMock } from '@app/test/mocks/socket-client-mock';
import { SocketTestHelper } from '@app/test/mocks/socket-helper/socket-test-helper';
import { CONNECT, ID, MESSAGE, RECONNECTION, SURRENDER_EVENT } from '@common/constants/communication';
import { Message } from '@common/interfaces/message';
import { Socket } from 'socket.io-client';

describe('MessageSenderService', () => {
    let service: MessageSenderService;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let testMessage: string;
    let routerMock: jasmine.SpyObj<Router>;

    beforeEach(() => {
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();

        // eslint-disable-next-line dot-notation -- Propriété privée
        socketServiceMock['socket'] = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            imports: [FormsModule, RouterTestingModule.withRoutes([])],
            providers: [{ provide: SocketClientService, useValue: socketServiceMock }],
            declarations: [],
        }).compileComponents();
    });

    beforeEach(() => {
        service = TestBed.inject(MessageSenderService);
        service.socketService = socketServiceMock;

        localStorage.clear();

        testMessage = 'test message';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('connect should call socketServer.isSocketAlive', () => {
        const spy = spyOn(service.socketService, 'isSocketAlive');

        service = new MessageSenderService(socketServiceMock, routerMock);

        expect(spy).toHaveBeenCalled();
    });

    it('connect should call socketServer.connect', () => {
        service.socketService.disconnect();

        const connectSpy = spyOn(service.socketService, 'connect');

        service = new MessageSenderService(socketServiceMock, routerMock);

        expect(connectSpy).toHaveBeenCalled();
    });

    it('connect should not call socketServer.connect when already connected', () => {
        // eslint-disable-next-line dot-notation -- Propriété privée
        service.socketService['socket'].connected = true;

        const connectSpy = spyOn(service.socketService, 'connect').and.callThrough();

        service = new MessageSenderService(socketServiceMock, routerMock);

        expect(connectSpy).not.toHaveBeenCalled();
    });

    it('disconnect should call socketServer.disconnect and localStorage.clear', () => {
        const disconnectSpy = spyOn(service.socketService, 'disconnect');
        const clearSpy = spyOn(localStorage, 'clear');

        service.disconnect();

        expect(disconnectSpy).toHaveBeenCalled();
        expect(clearSpy).toHaveBeenCalled();
    });

    it('should handle connect event', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Appel d'une méthode Privée
        const serviceSpy = spyOn<any>(service, 'userReconnection').and.callThrough();

        socketHelper.peerSideEmit(CONNECT);
        expect(serviceSpy).toHaveBeenCalled();
    });

    it('userReconnection should call getItem and clear of localStorage', () => {
        const getSpy = spyOn(localStorage, 'getItem').and.callThrough();
        const clearSpy = spyOn(localStorage, 'clear').and.callThrough();

        socketHelper.peerSideEmit(CONNECT);

        expect(getSpy).toHaveBeenCalled();
        expect(getSpy).toHaveBeenCalledWith(ID);

        expect(clearSpy).toHaveBeenCalled();
    });

    it('userReconnection should call sendToServer if id is found in localStorage', () => {
        localStorage.setItem(ID, 'Test');
        const spy = spyOn(service, 'sendToServer').and.callThrough();

        socketHelper.peerSideEmit(CONNECT);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(RECONNECTION, 'Test');
    });

    it('should renew serverMessages when receiving a list of messages from the server', () => {
        const serverMessages: Message[] = [{ time: new Date(), senderId: 'sender id', senderName: '', content: 'test text' }];

        socketHelper.peerSideEmit(MESSAGE, serverMessages);

        expect(service.message).toBe(serverMessages);
    });

    it('should renew serverMessages when receiving a empty list of messages from the server', () => {
        const serverMessages: Message[] = [];

        socketHelper.peerSideEmit(MESSAGE, serverMessages);

        expect(service.message).toEqual(serverMessages);
    });

    it('sendToServer should send message to socketService', () => {
        const spy = spyOn(service.socketService, 'send');
        const fakeEvent = 'test event';

        service.sendToServer(fakeEvent, testMessage);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(fakeEvent, jasmine.objectContaining({ content: testMessage }));
    });

    it('should call sendToServer when service call surrender', () => {
        const spy = spyOn(service, 'sendToServer');

        service.surrender();
        expect(spy).toHaveBeenCalledWith(SURRENDER_EVENT, service.socketService.socketId);
    });

    it('should call setItem in localStorage and put communication ID with socket Id when reloading page ', () => {
        const socketId = '1234';

        service = new MessageSenderService(socketServiceMock, routerMock);
        Object.defineProperty(service.socketService, 'socketId', { value: socketId });
        const spy = spyOn(localStorage, 'setItem');

        window.onbeforeunload = jasmine.createSpy();

        // eslint-disable-next-line dot-notation -- Méthode privée
        service['saveSocket']();
        window.dispatchEvent(new Event('beforeunload'));
        expect(spy).toHaveBeenCalledWith(ID, socketId);
    });
});
