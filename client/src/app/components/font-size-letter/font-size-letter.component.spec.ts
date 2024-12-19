import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FontSizeLetterComponent } from '@app/components/font-size-letter/font-size-letter.component';
import { LetterComponent } from '@app/components/letter/letter.component';

describe('FontSizeLetterComponent', () => {
    let component: FontSizeLetterComponent;
    let fixture: ComponentFixture<FontSizeLetterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            declarations: [FontSizeLetterComponent, LetterComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FontSizeLetterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call onClickUp when arrow-up button is clicked', () => {
        const buttonElement = fixture.debugElement.nativeElement.querySelector('.arrow-up-button');

        // eslint-disable-next-line dot-notation -- Propriété privée
        const spy = spyOn(component['fontSizeService'], 'onClickUp');

        buttonElement.click();

        expect(spy).toHaveBeenCalled();
    });

    it('should call onClickDown when arrow-down button is clicked', () => {
        const buttonElement = fixture.debugElement.nativeElement.querySelector('.arrow-down-button');

        // eslint-disable-next-line dot-notation -- Propriété privée
        const spy = spyOn(component['fontSizeService'], 'onClickDown');

        buttonElement.click();

        expect(spy).toHaveBeenCalled();
    });
});
