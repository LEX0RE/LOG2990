import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BestScoresBoardsComponent } from '@app/components/best-scores-boards/best-scores-boards.component';
import { BestScoresAdminComponent } from '@app/pages/best-scores-admin/best-scores-admin.component';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { DO_NOTHING } from '@app/test/constants/do-nothing-function';
import { NewHttpRequestManagerStub } from '@app/test/mocks/stubs/new-http-request-manager-service-stub';
import { CLASSIC, LOG2990 } from '@common/constants/game-modes';

describe('BestScoresAdminComponent', () => {
    let component: BestScoresAdminComponent;
    let fixture: ComponentFixture<BestScoresAdminComponent>;
    let httpService: NewHttpRequestManagerStub;

    beforeEach(async () => {
        httpService = new NewHttpRequestManagerStub();
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: HttpRequestManagerService, useValue: httpService }],
            declarations: [BestScoresAdminComponent, BestScoresBoardsComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BestScoresAdminComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => expect(component).toBeTruthy());

    it('resetBestScores should set serverValid to true if deleteBestScores request is resolved and call fetcheBestScores twice', () => {
        const spyFetchBestScores = spyOn(component.bestScoresBoards, 'fetchBestScores').and.callFake(DO_NOTHING);
        const expectedNumberOfCalls = 2;

        component.isServerValid = false;
        component.resetBestScores();
        expect(component.isServerValid).toBeTruthy();
        expect(spyFetchBestScores).toHaveBeenCalledWith(CLASSIC);
        expect(spyFetchBestScores).toHaveBeenCalledWith(LOG2990);
        expect(spyFetchBestScores).toHaveBeenCalledTimes(expectedNumberOfCalls);
    });

    it('resetBestScores should set serverValid to false if deleteBestScores request is rejected and should not call fetchBestScores', () => {
        component.isServerValid = true;
        const spyFetchBestScores = spyOn(component.bestScoresBoards, 'fetchBestScores').and.callFake(DO_NOTHING);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour mock le subscribe
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());

        component.resetBestScores();
        expect(component.isServerValid).toBeFalse();
        expect(spyFetchBestScores).not.toHaveBeenCalled();
    });
});
