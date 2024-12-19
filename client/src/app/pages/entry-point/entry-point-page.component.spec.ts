import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LetterComponent } from '@app/components/letter/letter.component';
import { BestScoresComponent } from '@app/components/overlay/best-scores/best-scores.component';
import { EntryPointPageComponent } from '@app/pages/entry-point/entry-point-page.component';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';

import SpyObj = jasmine.SpyObj;

describe('EntryPointPageComponent', () => {
    let component: EntryPointPageComponent;
    let fixture: ComponentFixture<EntryPointPageComponent>;
    let newGameConfigurationServiceSpy: SpyObj<NewGameConfigurationService>;

    beforeEach(() => (newGameConfigurationServiceSpy = jasmine.createSpyObj('NewGameConfigurationService', ['setGameMode'])));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [BestScoresComponent, EntryPointPageComponent, LetterComponent],
            providers: [{ provide: NewGameConfigurationService, useValue: newGameConfigurationServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EntryPointPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('clicking on the "Scrabble classique" button should call setGameMode method with "classique"', () => {
        const classicButton = fixture.debugElement.nativeElement.querySelector('#classic-button');

        expect(classicButton).toBeTruthy();
        const spy = spyOn(component, 'setGameMode').and.callThrough();

        classicButton.click();
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledOnceWith('classique');
    });

    it('clicking on the "Scrabble classique" button should call setGameMode method in NewGameConfigurationService with "classique"', () => {
        const returnButton = fixture.debugElement.nativeElement.querySelector('#classic-button');

        expect(returnButton).toBeTruthy();
        returnButton.click();
        expect(newGameConfigurationServiceSpy.gameMode).toEqual('classique');
    });

    it('calling setGameMode method with "classique" should call setGameMode method in NewGameConfigurationService with "classique"', () => {
        component.setGameMode('classique');
        expect(newGameConfigurationServiceSpy.gameMode).toEqual('classique');
    });
});
