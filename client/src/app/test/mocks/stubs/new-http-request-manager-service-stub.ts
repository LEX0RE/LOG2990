import { HttpClient } from '@angular/common/http';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { FAKE_DICTIONARIES, FAKE_DICTIONARY } from '@app/test/constants/fake-dictionary';
import { FAKE_HISTORY } from '@app/test/constants/fake-game-history';
import { FAKE_BEST_SCORE } from '@app/test/constants/fake-scores';
import { FAKE_NAME } from '@app/test/constants/fake-virtual-players';
import { Observable, of } from 'rxjs';
export class NewHttpRequestManagerStub extends HttpRequestManagerService {
    fakeBestScore: Observable<
        {
            score: number;
            playerName: string[];
        }[]
    >;

    fakeNames: Observable<
        {
            playerName: string;
        }[]
    >;

    fakeHistory: Observable<
        {
            beginningDate: Date;
            duration: number;
            player1: { name: string; score: number };
            player2: { name: string; score: number };
            gameModeName: string;
            isSurrendered: boolean;
        }[]
    >;

    fakeDictionary: Observable<{
        title: string;
        description: string;
        dictionaryId: number;
        words: string[];
    }>;

    voidResponse: Observable<undefined>;

    getBestScores: jasmine.Spy;
    getAllNames: jasmine.Spy;
    addName: jasmine.Spy;
    getHistory: jasmine.Spy;
    deleteAllNames: jasmine.Spy;
    deleteName: jasmine.Spy;
    deleteHistory: jasmine.Spy;
    deleteBestScores: jasmine.Spy;
    modifyName: jasmine.Spy;
    getDictionaries: jasmine.Spy;
    addDictionary: jasmine.Spy;
    modifyDictionary: jasmine.Spy;
    deleteDictionary: jasmine.Spy;
    deleteAllDictionary: jasmine.Spy;
    getDictionary: jasmine.Spy;

    // eslint-disable-next-line max-lines-per-function -- Pour bien stub chaque réponse
    constructor() {
        // eslint-disable-next-line no-undefined -- Pour mocker le HttpClient
        super(undefined as unknown as HttpClient);
        this.fakeBestScore = of(FAKE_BEST_SCORE());
        this.getBestScores = jasmine.createSpy('getBestScores').and.returnValue(this.fakeBestScore);
        this.fakeNames = of(FAKE_NAME());
        this.getAllNames = jasmine.createSpy('getAllNames').and.returnValue(this.fakeNames);
        this.fakeHistory = of(FAKE_HISTORY());
        this.getHistory = jasmine.createSpy('getHistory').and.returnValue(this.fakeHistory);
        this.voidResponse = of(void 0);
        this.addName = jasmine.createSpy('addName').and.returnValue(this.voidResponse);
        this.deleteAllNames = jasmine.createSpy('deleteAllNames').and.returnValue(this.voidResponse);
        this.deleteName = jasmine.createSpy('deleteName').and.returnValue(this.voidResponse);
        this.deleteHistory = jasmine.createSpy('deleteHistory').and.returnValue(this.voidResponse);
        this.deleteBestScores = jasmine.createSpy('deleteBestScores').and.returnValue(this.voidResponse);
        this.getDictionaries = jasmine.createSpy('getDictionaries').and.returnValue(of(FAKE_DICTIONARIES()));
        this.addDictionary = jasmine.createSpy('addDictionary').and.returnValue(this.voidResponse);
        this.modifyDictionary = jasmine.createSpy('modifyDictionary').and.returnValue(this.voidResponse);
        this.deleteDictionary = jasmine.createSpy('deleteDictionary').and.returnValue(this.voidResponse);
        this.deleteAllDictionary = jasmine.createSpy('deleteAllDictionary').and.returnValue(this.voidResponse);
        this.deleteHistory = jasmine.createSpy('deleteHistory').and.returnValue(this.voidResponse);
        this.modifyName = jasmine.createSpy('modifyName').and.returnValue(this.voidResponse);
        this.fakeDictionary = of(FAKE_DICTIONARY());
        this.getDictionary = jasmine.createSpy('getDictionary').and.returnValue(this.fakeDictionary);
    }
}
