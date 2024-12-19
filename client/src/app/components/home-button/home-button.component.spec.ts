import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeButtonComponent } from '@app/components/home-button/home-button.component';
import { EndGameService } from '@app/services/end-game/end-game.service';
import { mockEndGameService } from '@app/test/mocks/end-game-mock';
import { GamePossibility } from '@common/enums/game-possibility';

describe('HomeButtonComponent', () => {
    let component: HomeButtonComponent;
    let fixture: ComponentFixture<HomeButtonComponent>;
    let endGame: jasmine.SpyObj<EndGameService>;

    beforeEach(() => {
        endGame = mockEndGameService();
        TestBed.configureTestingModule({
            declarations: [HomeButtonComponent],
            providers: [{ provide: EndGameService, useValue: endGame }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('disconnect should call reset on service', () => {
        endGame.decision = GamePossibility.Win;
        component.exitGame();
        expect(endGame.reset).toHaveBeenCalled();
    });

    it('endGame should be true when decision !== NOT_FINISH', () => {
        Object.defineProperty(endGame, 'decision', { value: GamePossibility.Lost });
        expect(component.isEndGame).toBeTrue();
    });

    it('endGame should be false when decision === NOT_FINISH', () => {
        expect(component.isEndGame).toBeFalse();
    });
});
