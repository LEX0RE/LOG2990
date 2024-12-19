import { TestBed } from '@angular/core/testing';
import { AppComponent } from '@app/app.component';
import { LetterComponent } from '@app/components/letter/letter.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppRoutingModule],
            declarations: [AppComponent, LetterComponent],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;

        expect(app).toBeTruthy();
    });
});
