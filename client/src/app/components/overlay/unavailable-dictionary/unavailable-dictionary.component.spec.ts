import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UnavailableDictionaryComponent } from '@app/components/overlay/unavailable-dictionary/unavailable-dictionary.component';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { FAKE_DICTIONARIES } from '@app/test/constants/fake-dictionary';
import { NewHttpRequestManagerStub } from '@app/test/mocks/stubs/new-http-request-manager-service-stub';

describe('UnavailableDictionaryComponent', () => {
    let component: UnavailableDictionaryComponent;
    let fixture: ComponentFixture<UnavailableDictionaryComponent>;
    let httpService: NewHttpRequestManagerStub;

    beforeEach(() => {
        httpService = new NewHttpRequestManagerStub();

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, ReactiveFormsModule],
            providers: [{ provide: HttpRequestManagerService, useValue: httpService }],
            declarations: [UnavailableDictionaryComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(UnavailableDictionaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => expect(component).toBeTruthy());

    it('should change dictionaryDescription if dictionnary exist in the list', () => {
        const expectedValue = 'description de base';

        component.dictionary.setValue('Français');
        component.dictionaries = FAKE_DICTIONARIES();
        component.changeDictionaryDescription();

        expect(component.dictionaryDescription).toEqual(expectedValue);
    });

    it('should not change dictionaryDescription if dictionnary not exist in the list', () => {
        const expectedValue = '';

        component.dictionaryDescription = expectedValue;
        component.dictionary.setValue('fake');
        component.dictionaries = FAKE_DICTIONARIES();
        component.changeDictionaryDescription();

        expect(component.dictionaryDescription).toEqual(expectedValue);
    });

    it('submit should call changeDictionary from newGameConfigurationService', () => {
        // eslint-disable-next-line dot-notation -- méthode privée
        const spyCalled = spyOn(component['newGameConfigurationService'], 'changeDictionary');

        component.submit();
        expect(spyCalled).toHaveBeenCalled();
    });

    it('receivedDictionaries should change the dictionnary', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pour mock la promesse
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any): any => resolve());

        component.dictionaries = [];
        component.fetchDictionaries();
        expect(component.dictionaries).not.toEqual([]);
    });
});
