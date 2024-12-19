import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { CLASSIC } from '@common/constants/game-modes';

describe('NewGameConfigurationService', () => {
    let service: NewGameConfigurationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [NewGameConfigurationService],
        }).compileComponents();
        service = TestBed.inject(NewGameConfigurationService);
    });

    it('should be created', () => expect(service).toBeTruthy());

    it('fetchTurnTime() should return something', () => expect(service.fetchTurnTimes()).toBeTruthy());

    it('fetchDictionaries() should return something', () => expect(service.fetchDictionaries()).toBeTruthy());

    it('set gameMode not should set the gameMode', () => {
        service.gameMode = CLASSIC;
        service.gameMode = 'some rubbish gameMode';
        expect(service.gameMode).toEqual(CLASSIC);
    });

    it('changeDictionary should call patchValue', () => {
        service.gameInfo = new FormGroup({
            playerName: new FormControl(''),
            dictionary: new FormControl(''),
            turnDuration: new FormControl(''),
        });
        const patchSpy = spyOn(service.gameInfo, 'patchValue');
        const nameDictionary = 'Test Name';

        service.changeDictionary(nameDictionary);
        expect(patchSpy).toHaveBeenCalledWith({
            dictionary: nameDictionary,
        });
    });
});
