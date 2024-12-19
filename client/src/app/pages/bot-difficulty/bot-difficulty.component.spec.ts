import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BotDifficultyComponent } from '@app/pages/bot-difficulty/bot-difficulty.component';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { ExchangeServicePlayer1POV } from '@app/services/initialize-game-exchange/player-1/initialize-game-player-1-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { FAKE_DICTIONARIES } from '@app/test/constants/fake-dictionary';
import { NewGameServiceStub } from '@app/test/mocks/stubs/new-game-configuration-service-stub';
import { NewHttpRequestManagerStub } from '@app/test/mocks/stubs/new-http-request-manager-service-stub';
import { Difficulty } from '@common/enums/difficulty';
import SpyObj = jasmine.SpyObj;

describe('BotDifficultyComponent', () => {
    let component: BotDifficultyComponent;
    let fixture: ComponentFixture<BotDifficultyComponent>;
    let initializeGameExchangeService: SpyObj<ExchangeServicePlayer1POV>;
    let httpService: NewHttpRequestManagerStub;
    let newGameServiceStub: NewGameServiceStub;

    beforeEach(() => (initializeGameExchangeService = jasmine.createSpyObj('ExchangeServicePlayer1POV', ['createSoloGame'])));

    beforeEach(async () => {
        newGameServiceStub = new NewGameServiceStub();
        httpService = new NewHttpRequestManagerStub();

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule],
            declarations: [BotDifficultyComponent],
            providers: [
                { provide: ExchangeServicePlayer1POV, useValue: initializeGameExchangeService },
                { provide: HttpRequestManagerService, useValue: httpService },
                { provide: NewGameConfigurationService, useValue: newGameServiceStub },
            ],
        }).compileComponents();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- sert pour stub le subscribe
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any): any => resolve(FAKE_DICTIONARIES()));
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BotDifficultyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => expect(component).toBeTruthy());

    it('should change difficulty to Easy from method changeDifficulty when click from the button', () => {
        const button = fixture.debugElement.nativeElement.querySelector('.easyMode0');

        expect(button).toBeTruthy();
        const spy = spyOn(component, 'changeToEasy').and.callThrough();

        button.click();

        expect(spy).toHaveBeenCalled();
    });

    it('should change difficulty to Hard from method changeDifficulty when hard is the parameter', () => {
        component.changeToEasy();
        component.changeToHard();
        expect(component.difficulty).toEqual(Difficulty.Hard);

        // eslint-disable-next-line dot-notation -- Propriété privée
        expect(component['newGameConfigurationService'].difficulty).toEqual(Difficulty.Hard);
    });

    it('should change difficulty to Easy from method changeDifficulty when easy is the parameter', () => {
        component.changeToHard();
        component.changeToEasy();

        expect(component.difficulty).toEqual(Difficulty.Easy);

        // eslint-disable-next-line dot-notation -- Propriété privée
        expect(component['newGameConfigurationService'].difficulty).toEqual(Difficulty.Easy);
    });

    it('should call createSoloGame if it has the dictionaries in the server', () => {
        // eslint-disable-next-line dot-notation --  Propriété privée
        component['newGameConfigurationService'].gameInfo = new FormGroup({ dictionary: new FormControl('Français') });
        // eslint-disable-next-line dot-notation --  Propriété privée
        const observable = component['newGameConfigurationService'].fetchDictionaries();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- sert pour stub le subscribe
        spyOn(observable, 'subscribe').and.callFake((resolve?: any): any => resolve(FAKE_DICTIONARIES()));
        newGameServiceStub.fetchDictionaries.and.returnValue(observable);
        component.onClick();

        expect(initializeGameExchangeService.createSoloGame).toHaveBeenCalled();
    });

    it('should not call createSoloGame if it has no dictionaries in the server', () => {
        // eslint-disable-next-line dot-notation --  Propriété privée
        component['newGameConfigurationService'].gameInfo = new FormGroup({ dictionary: new FormControl('test') });
        // eslint-disable-next-line dot-notation --  Propriété privée
        const observable = component['newGameConfigurationService'].fetchDictionaries();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- sert pour stub le subscribe
        spyOn(observable, 'subscribe').and.callFake((resolve?: any): any => resolve(FAKE_DICTIONARIES()));
        newGameServiceStub.fetchDictionaries.and.returnValue(observable);

        component.onClick();
        expect(initializeGameExchangeService.createSoloGame).not.toHaveBeenCalled();
    });
});
