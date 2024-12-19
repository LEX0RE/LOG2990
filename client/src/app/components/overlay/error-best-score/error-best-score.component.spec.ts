import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorBestScoreComponent } from '@app/components/overlay/error-best-score/error-best-score.component';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { SocketTestHelper } from '@app/test/mocks/socket-helper/socket-test-helper';
import { IMPOSSIBLE_TO_ADD_SCORE } from '@common/constants/communication';
import { Socket } from 'socket.io-client';

describe('ErrorBestScoreComponent', () => {
    let component: ErrorBestScoreComponent;
    let fixture: ComponentFixture<ErrorBestScoreComponent>;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [SocketClientService],
            declarations: [ErrorBestScoreComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorBestScoreComponent);
        component = fixture.componentInstance;
        socketHelper = new SocketTestHelper();
        // eslint-disable-next-line dot-notation -- Propriété privée
        component.socketService['socket'] = socketHelper as unknown as Socket;
        fixture.detectChanges();
        // eslint-disable-next-line dot-notation -- Méthode privée
        component['configureBaseSocketFeatures']();
        // eslint-disable-next-line dot-notation -- Propriété privée
        socketHelper['callbacks'].get(IMPOSSIBLE_TO_ADD_SCORE)?.[0](IMPOSSIBLE_TO_ADD_SCORE);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change visible to true when receiving a impossible_to_add_score from the server', () => {
        expect(component.visible).toEqual(true);
    });
});
