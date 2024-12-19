import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GoalComponent } from '@app/components/goal/goal.component';
import { InformativePanelComponent } from '@app/components/informative-panel/informative-panel.component';
import { PlayerInformationComponent } from '@app/components/player-information/player-information.component';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { TimerService } from '@app/services/timer/timer.service';
import { FAKE_GAME_UPDATE } from '@app/test/constants/fake-game-update';
import { TimerServiceStub } from '@app/test/mocks/stubs/fake-timer-service';
import { gameUpdaterStub } from '@app/test/mocks/stubs/game-updater-stub';

describe('InformativePanelComponent', () => {
    let component: InformativePanelComponent;
    let fixture: ComponentFixture<InformativePanelComponent>;
    let gameUpdater: jasmine.SpyObj<GameUpdaterService>;
    let timerServiceStub: TimerServiceStub;

    beforeEach(() => {
        gameUpdater = gameUpdaterStub();
        timerServiceStub = new TimerServiceStub();

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            providers: [
                { provide: GameUpdaterService, useValue: gameUpdater },
                { provide: TimerService, useValue: timerServiceStub },
            ],
            declarations: [InformativePanelComponent, PlayerInformationComponent, GoalComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InformativePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => expect(component).toBeTruthy());

    it('should call gameUpdate otherPlayer', () => expect(component.opponent).toEqual(FAKE_GAME_UPDATE().otherInfo));

    it('should call gameUpdate playerInfo', () => expect(component.player).toEqual(FAKE_GAME_UPDATE().playerInfo));

    it('should call gameUpdate letter stash', () => expect(component.remainingLetter).toEqual(FAKE_GAME_UPDATE().stash.nLettersLeft));

    it('should call timer on timerService', () => {
        const expected = '5:00';

        expect(component.timer).toEqual(expected);
    });

    it('publicGoal1 should return null when there is no goal', () => {
        Object.defineProperty(gameUpdater, 'publicGoals', { value: [] });
        expect(component.publicGoal1).toBeNull();
    });

    it('publicGoal2 should return null when there is no goal', () => {
        Object.defineProperty(gameUpdater, 'publicGoals', { value: [] });
        expect(component.publicGoal2).toBeNull();
    });

    it('sendStash should call sendStash from conversion', () => {
        // eslint-disable-next-line dot-notation -- Membre privé
        const spyConversion = spyOn(component['conversionService'], 'sendStash');

        component.sendStash();
        expect(spyConversion).toHaveBeenCalled();
    });

    it('mygoal should return null when there is no goal', () => {
        const object = { value: 0 };

        Object.defineProperty(gameUpdater.myGoal, 'length', object);
        expect(component.myGoal).toBeNull();
    });

    it('otherGoal should return null when there is no goal', () => {
        const object = { value: 0 };

        Object.defineProperty(gameUpdater.myGoal, 'length', object);
        expect(component.otherGoal).toBeNull();
    });
});
