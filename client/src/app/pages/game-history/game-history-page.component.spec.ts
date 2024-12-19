import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameHistoryPageComponent } from '@app/pages/game-history/game-history-page.component';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { DO_NOTHING } from '@app/test/constants/do-nothing-function';
import { FAKE_HISTORY } from '@app/test/constants/fake-game-history';
import { NewHttpRequestManagerStub } from '@app/test/mocks/stubs/new-http-request-manager-service-stub';

describe('GameHistoryPageComponent', () => {
    let component: GameHistoryPageComponent;
    let fixture: ComponentFixture<GameHistoryPageComponent>;
    let httpService: NewHttpRequestManagerStub;

    beforeEach(() => {
        httpService = new NewHttpRequestManagerStub();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: HttpRequestManagerService, useValue: httpService }],
            declarations: [GameHistoryPageComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(GameHistoryPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch game History', () => {
        component.fetchGameHistory();
        expect(component.gamesInfoHistory).toBeTruthy();
        expect(component.isServerValid).toBeTrue();
        expect(component.gamesInfoHistory).toEqual(FAKE_HISTORY());
    });

    it('fetchGameHistory should set serverValid to false if error', () => {
        component.isServerValid = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour mock le subscribe
        spyOn(httpService.fakeHistory, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());
        component.fetchGameHistory();
        expect(component.isServerValid).toBeFalse();
    });

    it('should delete game History', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        const spyFetchGames = spyOn<any>(component, 'fetchGameHistory').and.callFake(DO_NOTHING);

        component.isServerValid = false;
        component.resetHistory();
        expect(component.isServerValid).toBeTruthy();
        expect(spyFetchGames).toHaveBeenCalled();
    });

    it('resetHistory should set serverValid to false if error', () => {
        component.isServerValid = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour mock le subscribe
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());
        component.resetHistory();
        expect(component.isServerValid).toBeFalse();
    });

    it('should formatDate', () => {
        const date = new Date('July 02, 2000 03:24:50');
        const expected = `2 juillet 2000`;

        expect(component.formatDate(date)).toEqual(expected);
    });

    it('should formatTime', () => {
        let date = new Date('July 02, 2000 03:24:50');
        let expected = '03h24';

        expect(component.formatTime(date)).toEqual(expected);

        date = new Date('July 02, 2000 03:04:50');
        expected = '03h04';
        expect(component.formatTime(date)).toEqual(expected);

        date = new Date('July 02, 2000 23:00:50');
        expected = '23h00';
        expect(component.formatTime(date)).toEqual(expected);

        date = new Date('July 02, 2000 00:10:99');
        expected = '00h10';
        expect(component.formatTime(date)).toEqual(expected);
    });

    it('should formatDuration', () => {
        const duration = 350005;
        const expected = '5min 50s';

        expect(component.formatDuration(duration)).toEqual(expected);
    });
});
