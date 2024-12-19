import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BestScoresBoardsComponent } from '@app/components/best-scores-boards/best-scores-boards.component';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { NewHttpRequestManagerStub } from '@app/test/mocks/stubs/new-http-request-manager-service-stub';
import { CLASSIC, LOG2990 } from '@common/constants/game-modes';

describe('BestScoresBoardsComponent', () => {
    let component: BestScoresBoardsComponent;
    let fixture: ComponentFixture<BestScoresBoardsComponent>;
    let httpService: NewHttpRequestManagerStub;

    beforeEach(() => {
        httpService = new NewHttpRequestManagerStub();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: HttpRequestManagerService, useValue: httpService }],
            declarations: [BestScoresBoardsComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(BestScoresBoardsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('calling fetchBestScores() method should set bestScores for mode classic to received value', () => {
        const player1 = { score: 10, playerName: ['Bob'] };
        const player2 = { score: 5, playerName: ['Ron'] };

        component.fetchBestScores(CLASSIC);
        expect(component.bestScoresClassic).toBeTruthy();
        expect(component.bestScoresClassic).toEqual([player1, player2]);
    });

    it('calling fetchBestScores() method should set bestScores for mode log2990 to received value', () => {
        const player1 = { score: 10, playerName: ['Bob'] };
        const player2 = { score: 5, playerName: ['Ron'] };

        component.fetchBestScores(LOG2990);
        expect(component.bestScoresLog).toBeTruthy();
        expect(component.bestScoresLog).toEqual([player1, player2]);
    });

    it('newFontSizeClassic should return new fontSize based on number of name for a score', () => {
        const expected = 3;
        const index = 0;
        const player1 = { score: 10, playerName: ['Bob'] };

        component.bestScoresClassic = [player1];
        const result = component.newFontSize(component.bestScoresClassic[index]);

        expect(result).toEqual(expected);
    });

    it('newFontSizeLog should return new fontSize based on number of name for a score', () => {
        const expected = 1.5;
        const index = 0;
        const player1 = { score: 10, playerName: ['Bob', 'Ron'] };

        component.bestScoresLog = [player1];
        const result = component.newFontSize(component.bestScoresLog[index]);

        expect(result).toEqual(expected);
    });

    it('fetchBestScores should set serverValid to false', () => {
        component.isServerValid = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour mock le subscribe
        spyOn(httpService.fakeBestScore, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());
        component.fetchBestScores(CLASSIC);
        expect(component.isServerValid).toBeFalse();
    });
});
