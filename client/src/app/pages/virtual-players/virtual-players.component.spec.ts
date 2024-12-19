/* eslint-disable @typescript-eslint/no-explicit-any -- utile pour tester et espionner les méthodes privées*/
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { VirtualPlayersComponent } from '@app/pages/virtual-players/virtual-players.component';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { DO_NOTHING } from '@app/test/constants/do-nothing-function';
import { NewHttpRequestManagerStub } from '@app/test/mocks/stubs/new-http-request-manager-service-stub';
import { Difficulty } from '@common/enums/difficulty';

describe('VirtualPlayersComponent', () => {
    let component: VirtualPlayersComponent;
    let fixture: ComponentFixture<VirtualPlayersComponent>;
    let httpService: NewHttpRequestManagerStub;

    beforeEach(() => {
        httpService = new NewHttpRequestManagerStub();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, ReactiveFormsModule],
            providers: [{ provide: HttpRequestManagerService, useValue: httpService }],
            declarations: [VirtualPlayersComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(VirtualPlayersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('fetchAllNames() method should call fetchNames twice with hard and easy', () => {
        const spyFetchNames = spyOn<any>(component, 'fetchNames');
        const expectedNumberOfCalls = 2;

        component.fetchAllNames();
        expect(spyFetchNames).toHaveBeenCalledWith(Difficulty.Easy);
        expect(spyFetchNames).toHaveBeenCalledWith(Difficulty.Hard);
        expect(spyFetchNames).toHaveBeenCalledTimes(expectedNumberOfCalls);
    });

    it('calling fetchNames() method should set virtualPlayersNamesBeginner to received value', () => {
        const name1 = { playerName: 'Bob' };
        const name2 = { playerName: 'Ron' };

        // eslint-disable-next-line dot-notation -- méthode privée
        component['fetchNames'](Difficulty.Easy);
        expect(component.virtualPlayersNamesBeginner).toBeTruthy();
        expect(component.virtualPlayersNamesBeginner).toEqual([name1, name2]);
    });

    it('calling fetchNames() method should set virtualPlayersNamesExpert to received value', () => {
        const name1 = { playerName: 'Bob' };
        const name2 = { playerName: 'Ron' };

        // eslint-disable-next-line dot-notation -- méthode privée
        component['fetchNames'](Difficulty.Hard);
        expect(component.virtualPlayersNamesExpert).toBeTruthy();
        expect(component.virtualPlayersNamesExpert).toEqual([name1, name2]);
    });

    it('calling fetchNames() method should set serverValid to false', () => {
        component.isServerValid = true;
        spyOn(httpService.fakeNames, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());
        // eslint-disable-next-line dot-notation -- méthode privée
        component['fetchNames'](Difficulty.Hard);
        expect(component.isServerValid).toBeFalse();
    });

    it('calling addName() method should set serverValid to true', () => {
        const name = 'bob';
        const spyFetchNames = spyOn<any>(component, 'fetchNames').and.callFake(DO_NOTHING);
        const expectedNumberOfCalls = 2;

        component.isServerValid = false;
        component.addName(Difficulty.Hard, name);
        expect(component.isServerValid).toBeTruthy();
        expect(spyFetchNames).toHaveBeenCalledWith(Difficulty.Easy);
        expect(spyFetchNames).toHaveBeenCalledWith(Difficulty.Hard);
        expect(spyFetchNames).toHaveBeenCalledTimes(expectedNumberOfCalls);
    });

    it('calling  addName() method should set serverValid to false', () => {
        const name = 'bob';

        component.isServerValid = true;
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());

        component.addName(Difficulty.Hard, name);
        expect(component.isServerValid).toBeFalse();
    });

    it('calling deleteAll() method should set serverValid to true', () => {
        const spyFetchNames = spyOn<any>(component, 'fetchNames').and.callFake(DO_NOTHING);
        const expectedNumberOfCalls = 2;

        component.isServerValid = false;
        component.deleteAll();
        expect(component.isServerValid).toBeTruthy();
        expect(spyFetchNames).toHaveBeenCalledWith(Difficulty.Easy);
        expect(spyFetchNames).toHaveBeenCalledWith(Difficulty.Hard);
        expect(spyFetchNames).toHaveBeenCalledTimes(expectedNumberOfCalls);
    });

    it('calling  deleteAll() method should set serverValid to false', () => {
        component.isServerValid = true;
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());

        component.deleteAll();
        expect(component.isServerValid).toBeFalse();
    });

    it('calling deleteName() method should set serverValid to true', () => {
        const name = 'bob';
        const spyFetchNames = spyOn<any>(component, 'fetchNames').and.callFake(DO_NOTHING);
        const expectedNumberOfCalls = 2;

        component.isServerValid = false;
        component.deleteName(Difficulty.Hard, name);
        expect(component.isServerValid).toBeTruthy();
        expect(spyFetchNames).toHaveBeenCalledWith(Difficulty.Easy);
        expect(spyFetchNames).toHaveBeenCalledWith(Difficulty.Hard);
        expect(spyFetchNames).toHaveBeenCalledTimes(expectedNumberOfCalls);
    });

    it('calling  deleteName() method should set serverValid to false', () => {
        const name = 'bob';

        component.isServerValid = true;
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());

        component.deleteName(Difficulty.Hard, name);
        expect(component.isServerValid).toBeFalse();
    });

    it('calling modifyName() method should set serverValid to true', () => {
        const oldName = 'bob';
        const newName = 'ron';
        const spyFetchNames = spyOn<any>(component, 'fetchNames').and.callFake(DO_NOTHING);
        const spyCancel = spyOn(component, 'cancel').and.callFake(DO_NOTHING);
        const expectedNumberOfCalls = 2;

        component.isServerValid = false;
        component.modifyName(Difficulty.Hard, oldName, newName);
        expect(component.isServerValid).toBeTruthy();
        expect(spyFetchNames).toHaveBeenCalledWith(Difficulty.Easy);
        expect(spyFetchNames).toHaveBeenCalledWith(Difficulty.Hard);
        expect(spyFetchNames).toHaveBeenCalledTimes(expectedNumberOfCalls);
        expect(spyCancel).toHaveBeenCalledWith(Difficulty.Hard);
    });

    it('calling  modifyName() method should set serverValid to false', () => {
        const oldName = 'bob';
        const newName = 'ron';

        component.isServerValid = true;
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());

        component.modifyName(Difficulty.Hard, oldName, newName);
        expect(component.isServerValid).toBeFalse();
    });

    it('resetValue() method should set value of newNameBeginner to null ', () => {
        const name = 'bob';
        const expectedValue = null;

        component.newNameBeginner.setValue(name);

        // eslint-disable-next-line dot-notation -- méthode privée
        component['resetValue'](Difficulty.Easy);
        expect(component.newNameBeginner.value).toEqual(expectedValue);
    });

    it('resetValue() method should set value of newNameExpert to null ', () => {
        const name = 'bob';
        const expectedValue = null;

        component.newNameExpert.setValue(name);

        // eslint-disable-next-line dot-notation -- méthode privée
        component['resetValue'](Difficulty.Hard);
        expect(component.newNameExpert.value).toEqual(expectedValue);
    });

    it('validateNameExists() method should return true if name is already in list for beginner', () => {
        const name = { playerName: 'Bob' };

        component.virtualPlayersNamesBeginner.push(name);
        component.newNameBeginner.setValue(name.playerName);

        const result = component.validateNameExists(Difficulty.Easy);

        expect(result).toBeTruthy();
    });

    it('validateNameExists() method should return true if name is already in list for expert', () => {
        const name = { playerName: 'Bob' };

        component.virtualPlayersNamesExpert.push(name);
        component.newNameBeginner.setValue(name.playerName);

        const result = component.validateNameExists(Difficulty.Easy);

        expect(result).toBeTruthy();
    });

    it('validateNameExists() method should return false if name is not already in list for expert', () => {
        const name1 = { playerName: 'Bob' };
        const name2 = 'Hello';

        component.virtualPlayersNamesExpert.push(name1);
        component.newNameExpert.setValue(name2);

        const result = component.validateNameExists(Difficulty.Hard);

        expect(result).toBeFalsy();
    });

    it('validateModifiedNameExists() method should return true if modified name is already in list for beginner', () => {
        const name = { playerName: 'Bob' };

        component.virtualPlayersNamesBeginner.push(name);
        component.modifiedNameBeginner.setValue(name.playerName);

        const result = component.validateModifiedNameExists(Difficulty.Easy);

        expect(result).toBeTruthy();
    });

    it('validateModifiedNameExists() method should return false if modified name is not already in list for expert', () => {
        const name1 = { playerName: 'Bob' };
        const name2 = 'Hello';

        component.virtualPlayersNamesExpert.push(name1);
        component.modifiedNameExpert.setValue(name2);

        const result = component.validateModifiedNameExists(Difficulty.Hard);

        expect(result).toBeFalsy();
    });

    it('validateModifiedNameExists() method should return false if modified name is not already in list for beginner', () => {
        const name1 = { playerName: 'Bob' };
        const name2 = 'Hello';

        component.virtualPlayersNamesBeginner.push(name1);
        component.modifiedNameBeginner.setValue(name2);

        const result = component.validateModifiedNameExists(Difficulty.Easy);

        expect(result).toBeFalsy();
    });

    it('a name should not be valid if shorter than 3', () => {
        const name = 'Ro';

        component.newNameBeginner.setValue(name);

        expect(component.newNameExpert.valid).toBeFalsy();
    });

    it('a name should not be valid if longer than 25', () => {
        const name = 'Rrrrrrrrrrrrrrrrrrrrrrrrrrrr';

        component.newNameBeginner.setValue(name);

        expect(component.newNameExpert.valid).toBeFalsy();
    });

    it('a name should not be valid if does not contains only letters', () => {
        const name = 'Ron2';

        component.newNameBeginner.setValue(name);

        expect(component.newNameExpert.valid).toBeFalsy();
    });

    it('modify() method should change the value of indexName and modifiedName for beginner', () => {
        const name = { playerName: 'Bob' };
        const index = 0;

        component.virtualPlayersNamesBeginner.push(name);

        component.modifySelectedName(Difficulty.Easy, index);

        expect(component.indexNameToModifiedBeginner).toEqual(index);
        expect(component.modifiedNameBeginner.value).toEqual(name.playerName);
    });

    it('modify() method should change the value of indexName and modifiedName for expert', () => {
        const name = { playerName: 'Bob' };
        const index = 0;

        component.virtualPlayersNamesExpert.push(name);

        component.modifySelectedName(Difficulty.Hard, index);

        expect(component.indexNameToModifiedExpert).toEqual(index);
        expect(component.modifiedNameExpert.value).toEqual(name.playerName);
    });
});
