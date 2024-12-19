import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MathUtils } from '@app/classes/utils/math-utils';
import { RandomJoinButtonComponent } from '@app/components/random-join-button/random-join-button.component';
import { MAX_CHARACTERS, MIN_CHARACTERS } from '@app/constants/borders-player-name';
import { JoinMultiplayerGameComponent } from '@app/pages/join-multiplayer-game/join-multiplayer-game-page.component';
import { NewGameConfigurationComponent } from '@app/pages/new-game-configuration/new-game-configuration-page.component';
import { ExchangePlayer2PovService } from '@app/services/initialize-game-exchange/player-2/initialize-game-player-2-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { DO_NOTHING } from '@app/test/constants/do-nothing-function';
import { mockExchangePlayer2PovService } from '@app/test/mocks/initialize-game-exchange-player-2-pov-service-mock';
import { NewGameServiceStub } from '@app/test/mocks/stubs/new-game-configuration-service-stub';
import { CommonGameConfig } from '@common/interfaces/common-game-config';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';

describe('JoinMultiplayerGamePageComponent', () => {
    let component: JoinMultiplayerGameComponent;
    let fixture: ComponentFixture<JoinMultiplayerGameComponent>;
    let initializeGameExchange: jasmine.SpyObj<ExchangePlayer2PovService>;
    let config: NewGameServiceStub;
    const fakeTimer: CommonTimer = {
        minute: 0,
        second: 0,
    };

    beforeEach(() => {
        initializeGameExchange = mockExchangePlayer2PovService();
        config = new NewGameServiceStub();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                FormBuilder,
                { provide: ExchangePlayer2PovService, useValue: initializeGameExchange },
                { provide: NewGameConfigurationService, useValue: config },
            ],
            declarations: [JoinMultiplayerGameComponent, NewGameConfigurationComponent, RandomJoinButtonComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(JoinMultiplayerGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinMultiplayerGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getOpponentName() should return opponent name', () => {
        component.potentialOpponentName = 'Paul';
        expect(component.getOpponentName()).toBe('Paul');
    });

    it('askPlayerForName() should set tryingToJoinGame attribute to true', () => {
        expect(component.tryingToJoinGame).toBeFalse();
        component.askPlayerForName();
        expect(component.tryingToJoinGame).toBeTrue();
    });

    it('calling closeRejectedOverlay() method should call closeRejectedOverlay() method in InitializeGamExchangePlayer2PovService', () => {
        component.closeRejectedOverlay();

        // eslint-disable-next-line dot-notation -- Propriété privée
        expect(component['exchangePlayer2PovService'].closeRejectedOverlay).toHaveBeenCalled();
    });

    it('tryJoiningGame() method should change chosenGame attribute, tryingToJoinGame attribute and potentialOpponentName attribute', () => {
        const fakeConfig: CommonGameConfig = {
            gameId: '2',
            player1Name: 'James',
            gameModeName: '',
            turnTimer: fakeTimer,
            dictionaryTitle: '',
            dictionaryId: 0,
            player1SocketId: '',
        };

        expect(component.chosenGame).toBeFalsy();
        expect(component.tryingToJoinGame).toBeFalse();
        expect(component.potentialOpponentName).toBeFalsy();
        component.tryJoiningGame(fakeConfig);
        expect(component.chosenGame).toBe(fakeConfig.gameId);
        expect(component.tryingToJoinGame).toBeTrue();
        expect(component.potentialOpponentName).toBe(fakeConfig.player1Name);
        expect(component.timer).toBe(component.formatTimer(fakeConfig.turnTimer));
        expect(component.dictionaryTitle).toBe(fakeConfig.dictionaryTitle);
    });

    it('onSubmit should call tryJoinGame() method in InitializeGamExchangePlayer2PovService if player Name is different from opponent name', () => {
        component.askPlayerName.controls.playerName.setValue('Jean');
        component.potentialOpponentName = 'Paul';
        component.onSubmit();

        // eslint-disable-next-line dot-notation -- Propriété privée
        expect(component['exchangePlayer2PovService'].tryJoinGame).toHaveBeenCalled();
    });

    it('onSubmit change twoPlayersHaveSameName attribute to true if player Name is not different from opponent name', () => {
        expect(component.twoPlayersHaveSameName).toBeFalse();
        component.askPlayerName.controls.playerName.setValue('Jean');
        component.potentialOpponentName = 'Jean';
        component.onSubmit();
        expect(component.twoPlayersHaveSameName).toBeTrue();
    });

    it('getMinCharacters() method should return the minimal number of characters for a player name', () => {
        expect(component.getMinCharacters()).toBe(MIN_CHARACTERS);
    });

    it('getMaxCharacters() method should return the maximal number of characters for a player name', () => {
        expect(component.getMaxCharacters()).toBe(MAX_CHARACTERS);
    });

    it('FormatTimer should return a formated timer', () => {
        const timer: CommonTimer = {
            minute: 2,
            second: 34,
        };

        const expectedFormatTimer = '2 min 34 sec';

        expect(component.formatTimer(timer)).toBe(expectedFormatTimer);
    });

    it('ngAfterContentInit should call joinRandomGame when randomJoin is activated', () => {
        config.randomJoin = true;
        const spy = spyOn(component, 'joinRandomGame').and.returnValue(DO_NOTHING);

        component.ngAfterContentInit();
        expect(spy).toHaveBeenCalled();
    });

    it('joinRandomGame should remove random join flag adn do nothing', () => {
        config.randomJoin = true;
        const spy = spyOn(component, 'tryJoiningGame');

        component.joinRandomGame()();
        expect(config.randomJoin).toBeFalse();
        expect(spy).not.toHaveBeenCalled();
    });

    it('joinRandomGame should call tryJoiningGame and random number and tryJoiningGame with fake game info', () => {
        config.randomJoin = true;
        const fakeConfig: CommonGameConfig = {
            gameId: '2',
            player1Name: 'James',
            gameModeName: '',
            turnTimer: fakeTimer,
            dictionaryTitle: '',
            dictionaryId: 0,
            player1SocketId: '',
        };

        spyOnProperty(component, 'availableGames', 'get').and.returnValue([fakeConfig, {}]);
        const spyOnRandom = spyOn(MathUtils, 'randomNumberInInterval').and.returnValue(0);
        const spy = spyOn(component, 'tryJoiningGame');

        component.joinRandomGame()();
        expect(spy).toHaveBeenCalledWith(fakeConfig);
        expect(spyOnRandom).toHaveBeenCalled();
    });
});
