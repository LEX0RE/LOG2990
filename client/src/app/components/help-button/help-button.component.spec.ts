import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HelpButtonComponent } from '@app/components/help-button/help-button.component';

describe('HelpButtonComponent', () => {
    let component: HelpButtonComponent;
    let fixture: ComponentFixture<HelpButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            declarations: [HelpButtonComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HelpButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => expect(component).toBeTruthy());

    it('askHelp should call sendHelp', () => {
        // eslint-disable-next-line dot-notation -- Membre privé
        const spyConversion = spyOn(component['conversionService'], 'sendHelp');

        component.askHelp();
        expect(spyConversion).toHaveBeenCalled();
    });
});
