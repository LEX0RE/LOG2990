import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ModifyDictionaryComponent } from '@app/components/overlay/modify-dictionary/modify-dictionary.component';
import { DictionaryComponent } from '@app/pages/dictionary/dictionary.component';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { DELAY } from '@app/test/constants/delay';
import { DO_NOTHING } from '@app/test/constants/do-nothing-function';
import { FAKE_DICTIONARIES } from '@app/test/constants/fake-dictionary';
import { NewHttpRequestManagerStub } from '@app/test/mocks/stubs/new-http-request-manager-service-stub';

describe('DictionaryComponent', () => {
    let component: DictionaryComponent;
    let fixture: ComponentFixture<DictionaryComponent>;
    let httpService: NewHttpRequestManagerStub;

    beforeEach(() => {
        httpService = new NewHttpRequestManagerStub();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, ReactiveFormsModule],
            providers: [{ provide: HttpRequestManagerService, useValue: httpService }],
            declarations: [DictionaryComponent, ModifyDictionaryComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(DictionaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onChange should read file', async () => {
        const delay = 50;
        const file = { title: 'ti', description: 'description', dictionaryId: 0, words: ['hello'] };
        const eventStub = { target: { files: [new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })] } };

        component.onChange(eventStub as unknown as Event);
        await DELAY(delay);
        expect(component.file).toEqual(JSON.stringify(file, null, 2));
    });

    it('onChange should call resetWarningFlags if event.target.files[0] undefined', async () => {
        const eventStub = { target: {} };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        const spyResetWarningFlags = spyOn<any>(component, 'resetWarningFlags').and.callFake(DO_NOTHING);

        component.onChange(eventStub as unknown as Event);
        expect(spyResetWarningFlags).toHaveBeenCalled();
    });

    it('calling fetchDictionaries() method should set dictionaries to received value', () => {
        component.fetchDictionaries();
        expect(component.dictionaries).toBeTruthy();
        expect(component.dictionaries).toEqual(FAKE_DICTIONARIES());
    });

    it('calling deleteDictionary() method should set serverValid to true', () => {
        const dictionaryId = 1;
        const spyFetchDictionary = spyOn(component, 'fetchDictionaries').and.callFake(DO_NOTHING);

        component.isServerValid = false;
        component.deleteDictionary(dictionaryId);
        expect(component.isServerValid).toBeTruthy();
        expect(spyFetchDictionary).toHaveBeenCalled();
    });

    it('calling  deleteDictionary() method should set serverValid to false', () => {
        const dictionaryId = 1;

        component.isServerValid = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour mock le subscribe
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());

        component.deleteDictionary(dictionaryId);
        expect(component.isServerValid).toBeFalsy();
    });

    it('calling deleteAll() method should set serverValid to true', () => {
        const spyFetchDictionary = spyOn(component, 'fetchDictionaries').and.callFake(DO_NOTHING);

        component.isServerValid = false;
        component.deleteAll();
        expect(component.isServerValid).toBeTruthy();
        expect(spyFetchDictionary).toHaveBeenCalled();
    });

    it('calling  deleteAll() method should set serverValid to false', () => {
        component.isServerValid = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour mock le subscribe
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());

        component.deleteAll();
        expect(component.isServerValid).toBeFalsy();
    });

    it('calling uploadDictionary() method should set serverValid to true', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        spyOn<any>(component, 'verifyFile').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        const spyResetWarningFlags = spyOn<any>(component, 'resetWarningFlags').and.callFake(DO_NOTHING);
        const spyFetchDictionary = spyOn(component, 'fetchDictionaries').and.callFake(DO_NOTHING);

        component.isServerValid = false;
        component.uploadDictionary();
        expect(component.isServerValid).toBeTruthy();
        expect(spyResetWarningFlags).toHaveBeenCalled();
        expect(spyFetchDictionary).toHaveBeenCalled();
    });

    it('calling  uploadDictionary() method should set serverValid to false', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        spyOn<any>(component, 'verifyFile').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        const spyResetWarningFlags = spyOn<any>(component, 'resetWarningFlags').and.callFake(DO_NOTHING);

        component.isServerValid = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour mock le subscribe
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());

        component.uploadDictionary();
        expect(component.isServerValid).toBeFalsy();
        expect(spyResetWarningFlags).toHaveBeenCalled();
    });

    it('calling downloadDictionary() method should set serverValid to true', () => {
        const title = 'title';

        component.isServerValid = false;
        component.downloadDictionary(title);

        expect(component.isServerValid).toBeTruthy();
    });

    it('calling downloadDictionary() method should set serverValid to false', () => {
        const title = 'title';

        component.isServerValid = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour mock le subscribe
        spyOn(httpService.fakeDictionary, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());

        component.downloadDictionary(title);
        expect(component.isServerValid).toBeFalsy();
    });

    it('noFileSelected should return false if no file is selected', () => {
        component.filePath.reset();

        const isFileSelected = component.noFileSelected;

        expect(isFileSelected).toBeFalsy();
    });

    it('verifyFile should return false if file format is not json', () => {
        component.filePath.setValue('');

        // eslint-disable-next-line dot-notation -- méthode privée
        const isFileValid = component['verifyFile']();

        expect(isFileValid).toBeFalsy();
    });

    it('verifyFile should return false if dictionary is json is not valid', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        spyOn<any>(component, 'validateFilPath').and.returnValue(true);
        component.file = '{ title:  ';

        // eslint-disable-next-line dot-notation -- méthode privée
        const isFileValid = component['verifyFile']();

        expect(isFileValid).toBeFalsy();
    });

    it('verifyFile should return false if dictionary is not the good format', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        spyOn<any>(component, 'validateFilPath').and.returnValue(true);
        const file = { ti: 'title', description: 'description', dictionaryId: 0, words: ['hello'] };

        component.file = JSON.stringify(file, null, 2);

        // eslint-disable-next-line dot-notation -- méthode privée
        const isFileValid = component['verifyFile']();

        expect(isFileValid).toBeFalsy();
    });

    it('verifyFile should return true if is all properties valid', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        spyOn<any>(component, 'validateFilPath').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        spyOn<any>(component, 'validateWords').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        spyOn<any>(component, 'validateFormat').and.returnValue(true);
        const file = { title: 'title', description: 'description', dictionaryId: 0, words: ['hello'] };

        component.file = JSON.stringify(file, null, 2);

        // eslint-disable-next-line dot-notation -- méthode privée
        const isFileValid = component['verifyFile']();

        expect(isFileValid).toBeTruthy();
    });

    it('validateProperties should return false if title is too short', () => {
        component.dictionary = { title: 'ti', description: 'description', dictionaryId: 0, words: ['hello'] };

        // eslint-disable-next-line dot-notation -- méthode privée
        const isFileValid = component['validateProperties']();

        expect(isFileValid).toBeFalsy();
    });

    it('validateProperties should return false if title is too long', () => {
        component.dictionary = { title: 'titleeeeeeeeeeeeeeeeeeeeeeeee', description: 'description', dictionaryId: 0, words: ['hello'] };

        // eslint-disable-next-line dot-notation -- méthode privée
        const isFileValid = component['validateProperties']();

        expect(isFileValid).toBeFalsy();
    });

    it('validateProperties should return false if words not regular expression', () => {
        component.dictionary = { title: 'title', description: 'description', dictionaryId: 0, words: ['hello12'] };

        // eslint-disable-next-line dot-notation -- méthode privée
        const isFileValid = component['validateProperties']();

        expect(isFileValid).toBeFalsy();
    });

    it('validateProperties should return false if words too long', () => {
        component.dictionary = { title: 'title', description: 'description', dictionaryId: 0, words: ['hellooooooooooooooooooooo'] };

        // eslint-disable-next-line dot-notation -- méthode privée
        const isFileValid = component['validateProperties']();

        expect(isFileValid).toBeFalsy();
    });

    it('validateProperties should return false if words too short', () => {
        component.dictionary = { title: 'title', description: 'description', dictionaryId: 0, words: ['h'] };

        // eslint-disable-next-line dot-notation -- méthode privée
        const isFileValid = component['validateProperties']();

        expect(isFileValid).toBeFalsy();
    });

    it('resetWarningFlags should reset flags', () => {
        component.goodFileExtension = false;
        component.jsonValid = false;
        component.goodFormat = false;
        component.goodTitle = false;
        component.uniqueTitle = false;
        component.goodDescription = false;
        component.goodWords = false;
        component.successLoading = true;
        component.failureLoading = true;

        // eslint-disable-next-line dot-notation -- méthode privée
        component['resetWarningFlags']();

        expect(component.goodFileExtension).toBeTruthy();
        expect(component.jsonValid).toBeTruthy();
        expect(component.goodFormat).toBeTruthy();
        expect(component.goodTitle).toBeTruthy();
        expect(component.uniqueTitle).toBeTruthy();
        expect(component.goodDescription).toBeTruthy();
        expect(component.goodWords).toBeTruthy();
        expect(component.successLoading).toBeFalsy();
        expect(component.failureLoading).toBeFalsy();
    });

    it('uploadDictionary should resetWarningFlags', async () => {
        const spy = spyOn(component, 'resetWarningFlags' as never);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        spyOn(component, 'verifyFile' as any).and.returnValue(false);

        await component.uploadDictionary();
        expect(spy).toHaveBeenCalled();
    });
});
