import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GamePageComponent } from '@app/pages/game/game-page.component';
import { WaitingForGameStartComponent } from '@app/pages/waiting-for-game-start/waiting-for-game-start-page.component';
import { ExchangePlayer2PovService } from '@app/services/initialize-game-exchange/player-2/initialize-game-player-2-pov.service';
import { mockExchangePlayer2PovService } from '@app/test/mocks/initialize-game-exchange-player-2-pov-service-mock';

describe('WaitingForGameStartPageComponent', () => {
    let component: WaitingForGameStartComponent;
    let fixture: ComponentFixture<WaitingForGameStartComponent>;
    let exchangePlayer2PovService: jasmine.SpyObj<ExchangePlayer2PovService>;
    const name = 'James';

    beforeEach(async () => {
        exchangePlayer2PovService = mockExchangePlayer2PovService();
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: 'game', component: GamePageComponent }])],
            providers: [{ provide: ExchangePlayer2PovService, useValue: exchangePlayer2PovService }],
            declarations: [WaitingForGameStartComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(WaitingForGameStartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get the otherPlayer name when undefined', () => {
        expect(component.opponentName).toBe('');
    });

    it('should get the otherPlayer name when defined', () => {
        Object.defineProperty(exchangePlayer2PovService, 'gameTryingToJoin', { value: { player1Name: name } });
        expect(component.opponentName).toBe(name);
    });

    it('should cancel call cancelGame', () => {
        component.cancelJoiningGame();
        expect(exchangePlayer2PovService.cancelJoiningGame).toHaveBeenCalled();
    });
});
