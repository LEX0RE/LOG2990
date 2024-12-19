/* eslint-disable dot-notation -- Propriété/Méthode privée */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { GamePageComponent } from '@app/pages/game/game-page.component';
import { WaitingForPlayerPageComponent } from '@app/pages/waiting-for-player/waiting-for-player-page.component';
import { ExchangeServicePlayer1POV } from '@app/services/initialize-game-exchange/player-1/initialize-game-player-1-pov.service';
import { FAKE_DICTIONARIES } from '@app/test/constants/fake-dictionary';
import { mockExchangePlayer1PovService } from '@app/test/mocks/initialize-game-exchange-player-1-pov-service-mock';
import { NewGameServiceStub } from '@app/test/mocks/stubs/new-game-configuration-service-stub';
import { JoinGameInfo } from '@common/interfaces/join-game';
import { of } from 'rxjs';

describe('WaitingForPlayerPageComponent', () => {
    let component: WaitingForPlayerPageComponent;
    let fixture: ComponentFixture<WaitingForPlayerPageComponent>;
    let newGameServiceStub: NewGameServiceStub;
    const name = 'James';

    beforeEach(() => {
        newGameServiceStub = new NewGameServiceStub();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: 'game', component: GamePageComponent }])],
            declarations: [WaitingForPlayerPageComponent],
            providers: [
                { provide: ExchangeServicePlayer1POV, useValue: mockExchangePlayer1PovService() },
                { provide: NewGameServiceStub, useValue: newGameServiceStub },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(WaitingForPlayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get the otherPlayer name when undefined', () => {
        expect(component.otherPlayerName).toBe('');
    });

    it('should get the otherPlayer name when defined', () => {
        component['initializeGameExchangeService'].otherPlayerInfo = { playerName: name } as JoinGameInfo;
        expect(component.otherPlayerName).toBe(name);
    });

    it('should display right message if player has joined', () => {
        component['initializeGameExchangeService'].otherPlayerInfo = { playerName: name } as JoinGameInfo;
        const message = component.displayAdequateMessage();
        const expected = 'James veut jouer avec vous.';

        expect(message).toBe(expected);
    });

    it('should display right message if player has not joined', () => {
        component['initializeGameExchangeService'].otherPlayerInfo = null;
        const message = component.displayAdequateMessage();
        const expected = "Vous êtes en attente d'un joueur";

        expect(message).toBe(expected);
    });

    it('should startGame call accept player', () => {
        // eslint-disable-next-line dot-notation --  Propriété privée
        component['newGameConfigurationService'].gameInfo = new FormGroup({ dictionary: new FormControl('Français') });
        // eslint-disable-next-line dot-notation --  Propriété privée
        const observable = of(FAKE_DICTIONARIES());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- sert pour stub le subscribe
        spyOn(observable, 'subscribe').and.callFake((resolve?: any): any => resolve(FAKE_DICTIONARIES()));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- sert pour stub le subscribe
        component['newGameConfigurationService'].fetchDictionaries = jasmine.createSpy().and.returnValue(observable);
        component.startGame();

        expect(component['initializeGameExchangeService'].acceptPlayer).toHaveBeenCalled();
    });

    it('should startGame not call accept player', () => {
        // eslint-disable-next-line dot-notation --  Propriété privée
        component['newGameConfigurationService'].gameInfo = new FormGroup({ dictionary: new FormControl('Test') });
        // eslint-disable-next-line dot-notation --  Propriété privée
        const observable = of(FAKE_DICTIONARIES());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- sert pour stub le subscribe
        spyOn(observable, 'subscribe').and.callFake((resolve?: any): any => resolve(FAKE_DICTIONARIES()));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- sert pour stub le subscribe
        component['newGameConfigurationService'].fetchDictionaries = jasmine.createSpy().and.returnValue(observable);
        component.startGame();

        expect(component['initializeGameExchangeService'].acceptPlayer).not.toHaveBeenCalled();
    });

    it('should reject call reject other player', () => {
        component.rejectOtherPlayer();

        expect(component['initializeGameExchangeService'].rejectOtherPlayer).toHaveBeenCalled();
    });

    it('should cancel call cancelGame', () => {
        component.cancelGame();

        expect(component['initializeGameExchangeService'].cancelGame).toHaveBeenCalled();
    });

    it('should startGameAlone exist', () => {
        component.startGameAlone();
        expect(component.startGameAlone).toBeDefined();
    });

    it('closeErrorStartingGameOverlay should call method of the same name in initializeGameExchangeService', () => {
        component.closeErrorStartingGameOverlay();

        expect(component['initializeGameExchangeService'].closeErrorOverlay).toHaveBeenCalled();
    });
});
