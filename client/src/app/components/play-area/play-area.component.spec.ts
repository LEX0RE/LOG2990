/* eslint-disable dot-notation -- Propriété/Méthode privée*/
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EaselComponent } from '@app/components/easel/easel.component';
import { LetterComponent } from '@app/components/letter/letter.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DEFAULT_SIZE } from '@app/constants/grid';
import { ENTER } from '@app/constants/keyboard';
import { DEFAULT_DEBOUNCE_TIME } from '@app/constants/utils';
import { DebounceClickDirective } from '@app/directives/debounce/click/debounce-click.directive';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { gameUpdaterStub } from '@app/test/mocks/stubs/game-updater-stub';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let gameUpdater: jasmine.SpyObj<GameUpdaterService>;

    beforeEach(() => {
        gameUpdater = gameUpdaterStub();

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            providers: [{ provide: GameUpdaterService, useValue: gameUpdater }],
            declarations: [EaselComponent, PlayAreaComponent, LetterComponent, DebounceClickDirective],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('width should return the size of the grid canvas', () => {
        const defaultSize = DEFAULT_SIZE;

        expect(component.size).toEqual(defaultSize);
    });

    it('should call onClickPass when pass button is clicked', fakeAsync(() => {
        const button = fixture.debugElement.nativeElement.querySelector('.pass-btn');

        expect(button).toBeDefined();
        spyOn(component, 'onClickPass');
        button.click();
        tick(DEFAULT_DEBOUNCE_TIME);
        fixture.whenStable().then(() => expect(component.onClickPass).toHaveBeenCalled());
    }));

    it('should call sendSkipTurn from commandSender when pass button is clicked and is player turn', () => {
        component.gameUpdate.playerInfo.turn = true;

        const passButtonSpy = spyOn(component['commandSender'], 'sendSkipTurn');

        expect(passButtonSpy).toBeDefined();
        component.onClickPass();
        expect(passButtonSpy).toHaveBeenCalled();
    });

    it('should not call sendSkipTurn from commandSender when pass button is clicked and is not player turn', () => {
        component.gameUpdate.playerInfo.turn = false;

        const passButtonSpy = spyOn(component['commandSender'], 'sendSkipTurn');

        component.onClickPass();
        expect(passButtonSpy).not.toHaveBeenCalled();
    });

    it("should call putWord if gridContext isn't undefined", () => {
        component.ngAfterViewInit();

        const spy = spyOn(component['gridService'], 'putWord');

        component.ngDoCheck();

        expect(spy).toHaveBeenCalled();
    });

    it('should not call putWord if gridContext is undefined', () => {
        component.ngAfterViewInit();
        component['gridContext'].gridContext = undefined as unknown as CanvasRenderingContext2D;

        const spy = spyOn(component['gridService'], 'putWord');

        component.ngDoCheck();

        expect(spy).not.toHaveBeenCalled();
    });

    it('should not call gridReset if it is players turn', () => {
        component.ngAfterViewInit();

        const spy = spyOn(component['gridService'], 'gridReset');

        gameUpdater.playerInfo.turn = true;
        component.ngDoCheck();

        expect(spy).not.toHaveBeenCalled();
    });

    it('buttonDetect should call keyboardClick from gridService', () => {
        const spy = spyOn(component['gridService'], 'keyboardClick');
        const expectedKeyboard = new KeyboardEvent('test');

        component.buttonDetect(expectedKeyboard);
        expect(spy).toHaveBeenCalledWith(expectedKeyboard.key);
    });

    it('should call onMouseDown when canvas is clicked ', fakeAsync(() => {
        const button = fixture.debugElement.nativeElement.querySelector('canvas');

        expect(button).toBeDefined();
        const onMouseDownButtonSpy = spyOn(component, 'onMouseDown');

        button.click();
        tick(DEFAULT_DEBOUNCE_TIME);
        fixture.whenStable().then(() => expect(onMouseDownButtonSpy).toHaveBeenCalled());
    }));

    it('onMouseDown should call mouseClick from gridService if it is player turn', () => {
        component.gameUpdate.playerInfo.turn = true;

        const spy = spyOn(component['gridService'], 'mouseClick');
        const expectedMouse = new MouseEvent('allo');

        component.onMouseDown(expectedMouse);
        expect(spy).toHaveBeenCalled();
    });

    it('onMouseDown should not call mouseClick from gridService if it is not player turn', () => {
        component.gameUpdate.playerInfo.turn = false;

        const spy = spyOn(component['gridService'], 'mouseClick');
        const expectedMouse = new MouseEvent('allo');

        component.onMouseDown(expectedMouse);
        expect(spy).not.toHaveBeenCalled();
    });

    it('onFocusOut should  call reset from gridService', () => {
        component.gameUpdate.playerInfo.turn = true;
        const spy = spyOn(component['gridService'], 'reset');

        component.onFocusOut();
        expect(spy).toHaveBeenCalled();
    });

    it('onFocusOut should  call reset from gridService', () => {
        component.gameUpdate.playerInfo.turn = false;
        const spy = spyOn(component['gridService'], 'reset');

        component.onFocusOut();
        expect(spy).not.toHaveBeenCalled();
    });

    it('onClickPlay should  call keyboardClick from gridService', () => {
        const spy = spyOn(component['gridService'], 'keyboardClick');

        component.onClickPlay();
        expect(spy).toHaveBeenCalledWith(ENTER);
    });
});
