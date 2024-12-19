/* eslint-disable dot-notation -- Propriété/Méthode privée */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorCreatingGameComponent } from '@app/components/overlay/error-creating-game/error-creating-game.component';
import { InvalidGameModeComponent } from '@app/components/overlay/invalid-game-mode/invalid-game-mode.component';
import { UnavailableDictionaryComponent } from '@app/components/overlay/unavailable-dictionary/unavailable-dictionary.component';
import { DEFAULT_INDEX_TURN_TIMES } from '@app/constants/new-configuration';
import { GamePageComponent } from '@app/pages/game/game-page.component';
import { NewGameConfigurationComponent } from '@app/pages/new-game-configuration/new-game-configuration-page.component';
import { ExchangeServicePlayer1POV } from '@app/services/initialize-game-exchange/player-1/initialize-game-player-1-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { DO_NOTHING_WITH_PARAMETERS } from '@app/test/constants/do-nothing-function';
import { mockExchangePlayer1PovService } from '@app/test/mocks/initialize-game-exchange-player-1-pov-service-mock';
import { NewGameServiceStub } from '@app/test/mocks/stubs/new-game-configuration-service-stub';
import { CLASSIC } from '@common/constants/game-modes';
import { PlayerMode } from '@common/enums/player-mode';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';

describe('NewGameConfigurationPageComponent', () => {
    let component: NewGameConfigurationComponent;
    let fixture: ComponentFixture<NewGameConfigurationComponent>;
    let exchangeServicePlayer1POVSpy: jasmine.SpyObj<ExchangeServicePlayer1POV>;

    beforeEach(async () => {
        exchangeServicePlayer1POVSpy = mockExchangePlayer1PovService();
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule.withRoutes([{ path: 'game', component: GamePageComponent }])],
            providers: [
                FormBuilder,
                { provide: NewGameConfigurationService, useValue: new NewGameServiceStub() },
                { provide: ExchangeServicePlayer1POV, useValue: exchangeServicePlayer1POVSpy },
            ],
            declarations: [NewGameConfigurationComponent, InvalidGameModeComponent, UnavailableDictionaryComponent, ErrorCreatingGameComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(NewGameConfigurationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('hasValidGameMode() should return false if gameMode has not been set', () => {
        expect(component.hasValidGameMode()).toBeFalse();
    });

    it('hasValidGameMode() should return true if gameMode has been set', () => {
        component['newGameConfigurationService'].gameMode = CLASSIC;
        expect(component.hasValidGameMode()).toBeTrue();
    });

    it('displayTurnDuration() method should not change turnDuration if turnTimes attribute is undefined', () => {
        component.turnTimes = [];
        component.newGameConfigForm.controls.turnDuration.setValue('');
        expect(component.newGameConfigForm.value.turnDuration).toBe('');
        component.displayTurnDuration();
        expect(component.newGameConfigForm.value.turnDuration).toBeFalsy();
    });

    it('display displayTurnDuration() method should not change turnDuration if turnTimeIndex is equal or greater than turnTimes length', () => {
        expect(component.newGameConfigForm.value.turnDuration).toBe('1 min 00 sec');
        expect(component.turnTimes).toBeTruthy();
        component.turnTimeIndex = 5;
        component.displayTurnDuration();
        expect(component.newGameConfigForm.value.turnDuration).toBe('1 min 00 sec');
    });

    it('display displayTurnDuration() method should change turnDuration from form', () => {
        expect(component.newGameConfigForm.value.turnDuration).toBe('1 min 00 sec');
        expect(component.turnTimes).toBeTruthy();
        component.turnTimeIndex = 4;
        component.displayTurnDuration();
        expect(component.newGameConfigForm.value.turnDuration).toBe('2 min 30 sec');
    });

    it('choosing dictionary should call changeDictionaryDescription', () => {
        const spy = spyOn(component, 'changeDictionaryDescription');
        const dropDownList = fixture.debugElement.query(By.css('select'));

        dropDownList.triggerEventHandler('click', null);

        expect(spy).toHaveBeenCalled();
    });

    it('calling changeDictionaryDescription() should change the attribute dictionaryDescription is the dictionary name is found', () => {
        component.dictionaryDescription = 'description de base';
        component.dictionaries = [
            { title: 'Français', description: 'description de base', dictionaryId: 0 },
            { title: 'Autre dictionnaire', description: 'Un dictionnaire différent', dictionaryId: 0 },
        ];
        component.newGameConfigForm.controls.dictionary.setValue('Autre dictionnaire');
        component.changeDictionaryDescription();
        expect(component.dictionaryDescription).toBe('Un dictionnaire différent');
    });

    it('calling changeDictionaryDescription() should not change the attribute dictionaryDescription is the dictionary name is not found', () => {
        component.dictionaryDescription = 'description de base';
        component.dictionaries = [
            { title: 'Français', description: 'description de base', dictionaryId: 0 },
            { title: 'Autre dictionnaire', description: 'Un dictionnaire différent', dictionaryId: 0 },
        ];
        component.newGameConfigForm.controls.dictionary.setValue('Dictionnaire inexistant');
        component.changeDictionaryDescription();
        expect(component.dictionaryDescription).toBe('description de base');
    });

    it('gameMode should return gameMode value of newGameConfigurationService', () => {
        component['newGameConfigurationService'].gameMode = CLASSIC;
        expect(component.gameMode).toBe(CLASSIC);
    });

    it('should not submit form if gameMode is invalid', () => {
        expect(component['newGameConfigurationService'].gameMode).toBeFalsy();
        component.onSubmit();
        expect(mockExchangePlayer1PovService().createGame).not.toHaveBeenCalled();
    });

    it('should submit form if all conditions are reached', () => {
        component['newGameConfigurationService'].gameMode = CLASSIC;

        component['newGameConfigurationService'].playerMode = PlayerMode.Multiplayer;
        component.newGameConfigForm.controls.playerName.setValue('Paul');
        component.newGameConfigForm.controls.dictionary.setValue('Français');
        component.onSubmit();
        expect(exchangeServicePlayer1POVSpy.createGame).toHaveBeenCalled();
    });

    it('calling fetchDictionaries() method should set dictionaries to received value', () => {
        component.fetchDictionaries();
        expect(component.dictionaries).toBeTruthy();
        expect(component.dictionaries).toEqual([
            { title: 'Français', description: 'description de base', dictionaryId: 0 },
            { title: 'Autre dictionnaire', description: 'Un dictionnaire différent', dictionaryId: 0 },
        ]);
    });

    it('calling fetchTurnTimes() method should set turnTimes to received value', () => {
        component.fetchTurnTimes();
        expect(component.turnTimes).toBeTruthy();
        expect(component.turnTimes).toEqual([
            { minute: 0, second: 30 },
            { minute: 1, second: 0 },
            { minute: 1, second: 30 },
            { minute: 2, second: 0 },
            { minute: 2, second: 30 },
        ]);
    });

    it('incrementTurnDuration() should increment turnTimeIndex if max time has not been reached', () => {
        expect(component.turnTimeIndex).toBe(DEFAULT_INDEX_TURN_TIMES);
        component.incrementTurnDuration();
        component.incrementTurnDuration();
        component.incrementTurnDuration();
        expect(component.turnTimeIndex).toBe(DEFAULT_INDEX_TURN_TIMES + 3);
    });

    it('decrementTurnDuration() should decrement turnTimeIndex if min time has not been reached', () => {
        expect(component.turnTimeIndex).toBe(DEFAULT_INDEX_TURN_TIMES);
        component.decrementTurnDuration();
        expect(component.turnTimeIndex).toBe(DEFAULT_INDEX_TURN_TIMES - 1);
    });

    it('should incrementTurnDuration go above the max index', () => {
        component.turnTimes = [];
        component.incrementTurnDuration();
        expect(component.turnTimeIndex).toBe(1);
    });

    it('should decrement index not go lower then 0', () => {
        component.turnTimeIndex = 0;
        component.decrementTurnDuration();
        expect(component.turnTimeIndex).toBe(0);
    });

    it('should handle undefined and empty array in turnTimes', () => {
        const spy = spyOn(component.newGameConfigForm.controls.turnDuration, 'setValue').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        component.turnTimes = undefined as unknown as CommonTimer[];
        component.displayTurnDuration();
        component.turnTimes = [];
        component.displayTurnDuration();
        expect(spy).not.toHaveBeenCalled();
    });

    it('next should call createGame if the game is a multiplayer game', () => {
        const spy = spyOn(component['router'], 'navigate').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        component['newGameConfigurationService'].playerMode = PlayerMode.Multiplayer;

        component['nextPage']();

        expect(exchangeServicePlayer1POVSpy.createGame).toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });

    it('next should call router.navigate if the game is a solo player game', () => {
        const spy = spyOn(component['router'], 'navigate').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        component['newGameConfigurationService'].playerMode = PlayerMode.Solo;

        component['nextPage']();

        expect(exchangeServicePlayer1POVSpy.createGame).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('next should not call router.navigate or createGame if the game is a not define', () => {
        const spy = spyOn(component['router'], 'navigate').and.callFake(DO_NOTHING_WITH_PARAMETERS);

        component['newGameConfigurationService'].playerMode = PlayerMode.NotDefine;

        component['nextPage']();

        expect(exchangeServicePlayer1POVSpy.createGame).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });
});
