import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RandomJoinButtonComponent } from '@app/components/random-join-button/random-join-button.component';
import { GameNavigationPageComponent } from '@app/pages/game-navigation/game-navigation-page.component';
import { ExchangePlayer2PovService } from '@app/services/initialize-game-exchange/player-2/initialize-game-player-2-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { mockExchangePlayer2PovService } from '@app/test/mocks/initialize-game-exchange-player-2-pov-service-mock';
import { PlayerMode } from '@common/enums/player-mode';

describe('GameNavigationPageComponent', () => {
    let component: GameNavigationPageComponent;
    let fixture: ComponentFixture<GameNavigationPageComponent>;
    let newGameConfigurationServiceSpy: jasmine.SpyObj<NewGameConfigurationService>;

    beforeEach(() => {
        newGameConfigurationServiceSpy = jasmine.createSpyObj('NewGameConfigurationService', ['setGameMode', 'getGameMode']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameNavigationPageComponent, RandomJoinButtonComponent],
            providers: [
                { provide: NewGameConfigurationService, useValue: newGameConfigurationServiceSpy },
                { provide: ExchangePlayer2PovService, useValue: mockExchangePlayer2PovService() },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameNavigationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('clicking on the "Retour" button should call resetGameMode method', () => {
        const returnButton = fixture.debugElement.nativeElement.querySelector('.smallButton');

        expect(returnButton).toBeTruthy();
        const spy = spyOn(component, 'resetGameMode').and.callThrough();

        returnButton.click();
        expect(spy).toHaveBeenCalled();
    });

    it('clicking on the "Retour" button should call setGameMode method in NewGameConfigurationService with empty string as parameter', () => {
        const returnButton = fixture.debugElement.nativeElement.querySelector('.smallButton');

        expect(returnButton).toBeTruthy();
        returnButton.click();
        expect(newGameConfigurationServiceSpy.gameMode).toEqual('');
    });

    it('calling the resetGameMode method should call the setGameMode method in newGameConfigurationService with empty string', () => {
        component.resetGameMode();
        expect(newGameConfigurationServiceSpy.gameMode).toEqual('');
    });

    it('calling the soloGame method should call the setGameMode method in newGameConfigurationService with "solo"', () => {
        component.soloGame();
        expect(newGameConfigurationServiceSpy.playerMode).toEqual(PlayerMode.Solo);
    });

    it('calling the multiplayerGame method should call the setGameMode method in newGameConfigurationService with "multiplayer"', () => {
        component.multiplayerGame();
        expect(newGameConfigurationServiceSpy.playerMode).toEqual(PlayerMode.Multiplayer);
    });
});
