import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { CLASSIC } from '@common/constants/game-modes';
import { Difficulty } from '@common/enums/difficulty';

describe('HttpRequestManagerService', () => {
    let service: HttpRequestManagerService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpRequestManagerService],
        }).compileComponents();
        service = TestBed.inject(HttpRequestManagerService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => expect(service).toBeTruthy());

    it('getTurnTimes() should return something', () => expect(service.getTurnTimes()).toBeTruthy());

    it('getDictionaries() should return something', () => expect(service.getDictionaries()).toBeTruthy());

    it('getBestScores() should return something', () => expect(service.getBestScores(CLASSIC)).toBeTruthy());

    it('deleteBestScores() should return something', () => expect(service.deleteBestScores()).toBeTruthy());

    it('deleteBestScores() should return something', () => {
        expect(service.deleteBestScores()).toBeTruthy();
    });

    it('getName() should return something', () => {
        const name = 'bob';

        expect(service.getName(Difficulty.Easy, name)).toBeTruthy();
    });

    it('getAllNames() should return something', () => expect(service.getAllNames(Difficulty.Easy)).toBeTruthy());

    it('addName() should return something', () => {
        const name = { playerName: 'bob' };

        expect(service.addName(Difficulty.Easy, name)).toBeTruthy();
    });

    it('getHistory() should return something', () => {
        expect(service.getHistory()).toBeTruthy();
    });

    it('deleteHistory() should return something', () => {
        expect(service.deleteHistory()).toBeTruthy();
    });

    it('deleteAllNames() should return something', () => {
        expect(service.deleteAllNames()).toBeTruthy();
    });
    it('getHistory() should return something', () => expect(service.getHistory()).toBeTruthy());

    it('deleteHistory() should return something', () => expect(service.deleteHistory()).toBeTruthy());

    it('deleteAllNames() should return something', () => expect(service.deleteAllNames()).toBeTruthy());

    it('deleteName() should return something', () => {
        const name = 'bob';

        expect(service.deleteName(Difficulty.Easy, name)).toBeTruthy();
    });

    it('modifyName() should return something', () => {
        const oldName = 'bob';
        const newName = 'ron';

        expect(service.modifyName(Difficulty.Easy, oldName, newName)).toBeTruthy();
    });

    it('addDictionary() should return something', () => {
        const file = JSON.parse('{"title": "Français"}');

        expect(service.addDictionary(file)).toBeTruthy();
    });

    it('modifyDictionary() should return something', () => {
        const file = 'test';
        const dictionary = { title: 'Français', description: 'description de base', dictionaryId: 0 };

        expect(service.modifyDictionary(dictionary, file)).toBeTruthy();
    });

    it('deleteDictionary() should return something', () => {
        const dictionaryId = 0;

        expect(service.deleteDictionary(dictionaryId)).toBeTruthy();
    });

    it('deleteAllDictionary() should return something', () => {
        expect(service.deleteAllDictionary()).toBeTruthy();
    });

    it('getDictionary() should return something', () => {
        const title = 'title';

        expect(service.getDictionary(title)).toBeTruthy();
    });
});
