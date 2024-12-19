import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurrenderComponent } from '@app/components/overlay/surrender/surrender.component';
import { EndGameService } from '@app/services/end-game/end-game.service';
import { MessageSenderService } from '@app/services/messages-sender/messages-sender.service';
import { mockEndGameService } from '@app/test/mocks/end-game-mock';
import { mockMessageSenderService } from '@app/test/mocks/message-sender-mock';
import { GamePossibility } from '@common/enums/game-possibility';

describe('SurrenderComponent', () => {
    let component: SurrenderComponent;
    let fixture: ComponentFixture<SurrenderComponent>;
    let communication: jasmine.SpyObj<MessageSenderService>;
    let endGame: jasmine.SpyObj<EndGameService>;

    beforeEach(async () => {
        communication = mockMessageSenderService();
        endGame = mockEndGameService();
        await TestBed.configureTestingModule({
            declarations: [SurrenderComponent],
            providers: [
                { provide: MessageSenderService, useValue: communication },
                { provide: EndGameService, useValue: endGame },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SurrenderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change property change to true when surrender button is clicked', () => {
        fixture.debugElement.nativeElement.querySelector('#surrender').click();
        expect(component.change).toEqual(true);
    });

    it('should change property change to false when no button is clicked', () => {
        component.change = true;
        fixture.detectChanges();
        fixture.debugElement.nativeElement.querySelector('.no').click();
        expect(component.change).toEqual(false);
    });

    it('should call surrender from MessageSenderService when yes button is clicked', () => {
        component.change = true;
        fixture.detectChanges();
        fixture.debugElement.nativeElement.querySelector('.yes').click();
        expect(communication.surrender).toHaveBeenCalled();
    });

    it('endGame should be true when decision !== NOT_FINISH', () => {
        Object.defineProperty(endGame, 'decision', { value: GamePossibility.Lost });
        expect(component.isEndGame).toBeTrue();
    });

    it('endGame should be false when decision === NOT_FINISH', () => {
        expect(component.isEndGame).toBeFalse();
    });
});
