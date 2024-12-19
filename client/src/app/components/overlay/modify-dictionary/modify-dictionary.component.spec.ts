import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ModifyDictionaryComponent } from '@app/components/overlay/modify-dictionary/modify-dictionary.component';
import { TypeOfInput } from '@app/constants/modify-dictionary';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { NewHttpRequestManagerStub } from '@app/test/mocks/stubs/new-http-request-manager-service-stub';

describe('ModifyDictionaryComponent', () => {
    let component: ModifyDictionaryComponent;
    let fixture: ComponentFixture<ModifyDictionaryComponent>;
    let httpService: NewHttpRequestManagerStub;
    const dictionary = { title: 'title', description: 'description', dictionaryId: 0, words: ['hello'] };

    beforeEach(() => {
        httpService = new NewHttpRequestManagerStub();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, ReactiveFormsModule],
            providers: [{ provide: HttpRequestManagerService, useValue: httpService }],
            declarations: [ModifyDictionaryComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(ModifyDictionaryComponent);
        component = fixture.componentInstance;
        component.dictionary = dictionary;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('modify should set isVisible to true', () => {
        component.isVisible = false;
        component.title.setValue('');
        component.description.setValue('');

        component.modify();

        expect(component.isVisible).toBeTruthy();
        expect(component.title.value).toEqual(component.dictionary.title);
        expect(component.description.value).toEqual(component.dictionary.description);
    });

    it('cancel should set isVisible to false', () => {
        component.isVisible = true;

        component.cancel();

        expect(component.isVisible).toBeFalsy();
    });

    it('calling modifyDictionary() method should call cancel if success', () => {
        const spyCancel = spyOn(component, 'cancel');

        component.modifyDictionary();
        expect(spyCancel).toHaveBeenCalled();
    });

    it('calling  modifyDictionary() method should call cancel if error is thrown', () => {
        const spyCancel = spyOn(component, 'cancel');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour mock le subscribe
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());

        component.modifyDictionary();
        expect(spyCancel).toHaveBeenCalled();
    });

    it('initModifyDictionaryConfig method should call createValidators twice', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- espion sur une méthode privée
        const spyCreateValidators = spyOn<any>(component, 'createValidators');
        const expectedNumberOfCalls = 2;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessaire pour mock le subscribe
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());

        // eslint-disable-next-line dot-notation -- méthode privée
        component['initModifyDictionaryConfig']();

        expect(spyCreateValidators).toHaveBeenCalledWith(TypeOfInput.Title);
        expect(spyCreateValidators).toHaveBeenCalledWith(TypeOfInput.Description);
        expect(spyCreateValidators).toHaveBeenCalledTimes(expectedNumberOfCalls);
    });
});
