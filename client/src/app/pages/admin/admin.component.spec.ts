/* eslint-disable @typescript-eslint/no-explicit-any, dot-notation -- utile pour tester et espionner les méthodes privées*/
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    BEST_SCORES,
    DATA_RESET_CONFIRMATION,
    DICTIONARIES,
    ERROR_RESETTING_DATA,
    GAME_HISTORY,
    SUCCESS_RESETTING_DATA,
    VIRTUAL_PLAYER_NAMES,
} from '@app/constants/data-resetting';
import { AdminComponent } from '@app/pages/admin/admin.component';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { DO_NOTHING } from '@app/test/constants/do-nothing-function';
import { NewHttpRequestManagerStub } from '@app/test/mocks/stubs/new-http-request-manager-service-stub';

describe('AdminComponent', () => {
    let component: AdminComponent;
    let fixture: ComponentFixture<AdminComponent>;
    let httpService: NewHttpRequestManagerStub;

    beforeEach(async () => {
        httpService = new NewHttpRequestManagerStub();
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: HttpRequestManagerService, useValue: httpService }],
            declarations: [AdminComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => expect(component).toBeTruthy());

    it('isDataToReset should return true if one property of dataToReset is true', () => {
        expect(component.isDataToReset).toBeFalse();

        component.dataToReset = {
            dictionaries: false,
            bestScores: false,
            virtualPlayerNames: false,
            gameHistory: true,
        };
        expect(component.isDataToReset).toBeTrue();
    });

    it('resetDataConfirmationMessage should call addDataMessage', () => {
        const addDataMessageSpy = spyOn<any>(component, 'addDataMessage').and.returnValue('');

        expect(component.resetDataConfirmationMessage).toEqual(DATA_RESET_CONFIRMATION);
        expect(addDataMessageSpy).toHaveBeenCalled();
    });

    it('resetDataFeedback should call addDataMessage and return correct feedback', () => {
        const addDataMessageSpy = spyOn<any>(component, 'addDataMessage').and.returnValue('');

        expect(component.resetDataFeedback).toEqual(SUCCESS_RESETTING_DATA);
        expect(addDataMessageSpy).toHaveBeenCalled();
    });

    it('resetDataFeedback should call addResetMessage and return error feedback if addDataMessage does not return an empty string', () => {
        const errorFeedback = DICTIONARIES + BEST_SCORES;
        const addDataMessageSpy = spyOn<any>(component, 'addDataMessage').and.returnValue(errorFeedback);

        expect(component.resetDataFeedback).toEqual(ERROR_RESETTING_DATA + errorFeedback);
        expect(addDataMessageSpy).toHaveBeenCalled();
    });

    it('resetData should call reset methods that match dataToReset property that are set to true', () => {
        const timesCalled = 1;

        component.dataToReset = {
            dictionaries: false,
            bestScores: false,
            virtualPlayerNames: false,
            gameHistory: false,
        };
        component.openFeedbackOverlay = false;
        const resetDictionariesSpy = spyOn<any>(component, 'resetDictionaries').and.callFake(DO_NOTHING);
        const resetBestScoresSpy = spyOn<any>(component, 'resetBestScores').and.callFake(DO_NOTHING);
        const resetVirtualPlayerNamesSpy = spyOn<any>(component, 'resetVirtualPlayerNames').and.callFake(DO_NOTHING);
        const resetGameHistorySpy = spyOn<any>(component, 'resetGameHistory').and.callFake(DO_NOTHING);

        component.resetData();
        expect(resetDictionariesSpy).not.toHaveBeenCalled();
        expect(resetBestScoresSpy).not.toHaveBeenCalled();
        expect(resetVirtualPlayerNamesSpy).not.toHaveBeenCalled();
        expect(resetGameHistorySpy).not.toHaveBeenCalled();
        expect(component.openFeedbackOverlay).toBeTrue();

        component.dataToReset.bestScores = true;
        component.dataToReset.virtualPlayerNames = true;

        component.resetData();
        expect(resetDictionariesSpy).not.toHaveBeenCalled();
        expect(resetBestScoresSpy).toHaveBeenCalledTimes(timesCalled);
        expect(resetVirtualPlayerNamesSpy).toHaveBeenCalledTimes(timesCalled);
        expect(resetGameHistorySpy).not.toHaveBeenCalled();

        resetBestScoresSpy.calls.reset();
        resetVirtualPlayerNamesSpy.calls.reset();

        component.dataToReset.dictionaries = true;
        component.dataToReset.gameHistory = true;

        component.resetData();
        expect(resetDictionariesSpy).toHaveBeenCalledTimes(timesCalled);
        expect(resetBestScoresSpy).toHaveBeenCalledTimes(timesCalled);
        expect(resetVirtualPlayerNamesSpy).toHaveBeenCalledTimes(timesCalled);
        expect(resetGameHistorySpy).toHaveBeenCalledTimes(timesCalled);
    });

    it('resetDictionaries should set errorDataResetting.dictionaries to false if http request is resolved', () => {
        component.errorDataResetting.dictionaries = true;
        component['resetDictionaries']();
        expect(component.errorDataResetting.dictionaries).toBeFalse();
    });

    it('resetDictionaries should set errorDataResetting.dictionaries to true if http request is rejected', () => {
        component.errorDataResetting.dictionaries = false;
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());
        component['resetDictionaries']();
        expect(component.errorDataResetting.dictionaries).toBeTrue();
    });

    it('resetBestScores should set errorDataResetting.bestScores to false if http request is resolved', () => {
        component.errorDataResetting.bestScores = true;
        component['resetBestScores']();
        expect(component.errorDataResetting.bestScores).toBeFalse();
    });

    it('resetBestScores should set errorDataResetting.bestScores to true if http request is rejected', () => {
        component.errorDataResetting.bestScores = false;
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());
        component['resetBestScores']();
        expect(component.errorDataResetting.bestScores).toBeTrue();
    });

    it('resetVirtualPlayerNames should set errorDataResetting.virtualPlayerNames to false if http request is resolved', () => {
        component.errorDataResetting.virtualPlayerNames = true;
        component['resetVirtualPlayerNames']();
        expect(component.errorDataResetting.virtualPlayerNames).toBeFalse();
    });

    it('resetVirtualPlayerNames should set errorDataResetting.virtualPlayerNames to true if http request is rejected', () => {
        component.errorDataResetting.virtualPlayerNames = false;
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());
        component['resetVirtualPlayerNames']();
        expect(component.errorDataResetting.virtualPlayerNames).toBeTrue();
    });

    it('resetGameHistory should set errorDataResetting.gameHistory to false if http request is resolved', () => {
        component.errorDataResetting.gameHistory = true;
        component['resetGameHistory']();
        expect(component.errorDataResetting.gameHistory).toBeFalse();
    });

    it('resetGameHistory should set errorDataResetting.gameHistory to true if http request is rejected', () => {
        component.errorDataResetting.gameHistory = false;
        spyOn(httpService.voidResponse, 'subscribe').and.callFake((resolve?: any, reject?: any): any => reject());
        component['resetGameHistory']();
        expect(component.errorDataResetting.gameHistory).toBeTrue();
    });

    it('addDataMessage should return a string that contains all ResettableData property that are true', () => {
        const resettableData = {
            dictionaries: false,
            bestScores: false,
            virtualPlayerNames: false,
            gameHistory: false,
        };
        let expectedResult = '';

        expect(component['addDataMessage'](resettableData)).toEqual(expectedResult);

        resettableData.dictionaries = true;
        resettableData.virtualPlayerNames = true;
        expectedResult = DICTIONARIES + VIRTUAL_PLAYER_NAMES;
        expect(component['addDataMessage'](resettableData)).toEqual(expectedResult);

        resettableData.bestScores = true;
        resettableData.gameHistory = true;
        expectedResult = DICTIONARIES + BEST_SCORES + VIRTUAL_PLAYER_NAMES + GAME_HISTORY;
        expect(component['addDataMessage'](resettableData)).toEqual(expectedResult);
    });
});
