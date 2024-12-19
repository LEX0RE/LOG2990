/* eslint-disable dot-notation  -- Propriété privée */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvalidGameModeComponent } from '@app/components/overlay/invalid-game-mode/invalid-game-mode.component';
import { CLASSIC, LOG2990 } from '@common/constants/game-modes';
import { PlayerMode } from '@common/enums/player-mode';

describe('InvalidGameModeComponent', () => {
    let component: InvalidGameModeComponent;
    let fixture: ComponentFixture<InvalidGameModeComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [InvalidGameModeComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(InvalidGameModeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => expect(component).toBeTruthy());

    it('should set the gameMode if it is classic and playerMode exist', () => {
        component['newGameConfigurationService'].playerMode = PlayerMode.Solo;
        component.setGameMode(CLASSIC);

        expect(component['newGameConfigurationService'].gameMode).toBe(CLASSIC);
    });

    it('should set the gameMode if it is log2990 and playerMode exist', () => {
        component['newGameConfigurationService'].playerMode = PlayerMode.Solo;
        component.setGameMode(LOG2990);

        expect(component['newGameConfigurationService'].gameMode).toBe(LOG2990);
    });

    it('should set the gameMode if it is log2990', () => {
        component['newGameConfigurationService'].playerMode = PlayerMode.Solo;
        component.setGameMode('');

        expect(component['newGameConfigurationService'].gameMode).toBe('');
    });

    it('setGameMode should set invalidStep +1', () => {
        const expected = 1;
        const test = '';

        component.setGameMode(test);

        expect(component.step).toBe(expected);
    });

    it('setPlayerMode should change gameMode and playerMode in solo Mode', () => {
        const expected = PlayerMode.Solo;

        component['gameMode'] = CLASSIC;
        component.setPlayerMode(expected);

        expect(component.playerMode).toBe(expected);
    });

    it('setPlayerMode should change gameMode and playerMode in multiplayer mode', () => {
        const expected = PlayerMode.Multiplayer;

        component['gameMode'] = CLASSIC;
        component.setPlayerMode(expected);

        expect(component.playerMode).toBe(expected);
    });

    it('return should put invalidStep -1', () => {
        const expected = 0;

        component['invalidStep'] = expected + 1;
        component.return();

        expect(component.step).toBe(expected);
    });
});
