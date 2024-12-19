import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RandomJoinButtonComponent } from '@app/components/random-join-button/random-join-button.component';
import { ExchangePlayer2PovService } from '@app/services/initialize-game-exchange/player-2/initialize-game-player-2-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { mockExchangePlayer2PovService } from '@app/test/mocks/initialize-game-exchange-player-2-pov-service-mock';
import { NewGameServiceStub } from '@app/test/mocks/stubs/new-game-configuration-service-stub';
import { PlayerMode } from '@common/enums/player-mode';
import { CommonGameConfig } from '@common/interfaces/common-game-config';

describe('RandomJoinButtonComponent', () => {
    let component: RandomJoinButtonComponent;
    let fixture: ComponentFixture<RandomJoinButtonComponent>;
    let initializeGameExchange: jasmine.SpyObj<ExchangePlayer2PovService>;
    let config: NewGameServiceStub;
    const fakeGameConfig: CommonGameConfig = { id: '2', playerName: 'james' } as unknown as CommonGameConfig;

    beforeEach(() => {
        initializeGameExchange = mockExchangePlayer2PovService();
        config = new NewGameServiceStub();
        TestBed.configureTestingModule({
            declarations: [RandomJoinButtonComponent],
            providers: [
                { provide: ExchangePlayer2PovService, useValue: initializeGameExchange },
                { provide: NewGameConfigurationService, useValue: config },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RandomJoinButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('availableGames should return service available games', () => {
        Object.defineProperty(initializeGameExchange, 'availableGames', { value: [fakeGameConfig, fakeGameConfig] });
        expect(component.availableGames).toEqual([fakeGameConfig, fakeGameConfig]);
    });

    it('isGameNotAvailable should true if there is only one game available', () => {
        Object.defineProperty(initializeGameExchange, 'availableGames', { value: [fakeGameConfig] });
        expect(component.isGameNotAvailable).toBeTrue();
    });

    it('isGameNotAvailable should false when there is 2 games or more game available', () => {
        Object.defineProperty(initializeGameExchange, 'availableGames', { value: [fakeGameConfig, fakeGameConfig] });
        expect(component.isGameNotAvailable).toBeFalse();
    });

    it('joinRandomGame should adjust config and call navigateToJoinGamePage', () => {
        component.joinRandomGame();
        expect(config.randomJoin).toBeTrue();
        expect(config.playerMode).toEqual(PlayerMode.Multiplayer);
        expect(initializeGameExchange.navigateToJoinGamePage).toHaveBeenCalled();
    });

    it('isGameNotAvailable should call callback if it is define', () => {
        const callback = jasmine.createSpy();

        component.joinGameCallBack = callback;
        component.joinRandomGame();
        expect(callback).toHaveBeenCalled();
    });
});
