import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OutputBoxComponent } from '@app/components/chat/output-box/output-box.component';
import { SenderType } from '@app/constants/sender';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { gameUpdaterStub } from '@app/test/mocks/stubs/game-updater-stub';
import { SYSTEM } from '@common/constants/communication';
import { Message } from '@common/interfaces/message';

describe('OutputBoxComponent', () => {
    let component: OutputBoxComponent;
    let fixture: ComponentFixture<OutputBoxComponent>;
    let gameUpdater: jasmine.SpyObj<GameUpdaterService>;
    const userId = 'me';

    beforeEach(() => {
        gameUpdater = gameUpdaterStub();
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            declarations: [OutputBoxComponent],
            providers: [{ provide: GameUpdaterService, useValue: gameUpdater }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OutputBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.sender = userId;
    });

    it('should create', () => expect(component).toBeTruthy());

    it('setCategory should return SenderType Client if receiver is the sender', () =>
        expect(component.setCategory(gameUpdater.playerInfo.name)).toEqual(SenderType.Client));

    it('setCategory should return SenderType System if receiver is the system', () =>
        expect(component.setCategory(SYSTEM)).toEqual(SenderType.System));

    it('setCategory should return SenderType Others if receiver is not the sender', () =>
        expect(component.setCategory(gameUpdater.otherPlayerInfo.name)).toEqual(SenderType.Others));

    it('setCategory should return SenderType Others if there is no sender', () => expect(component.setCategory('')).toEqual(SenderType.Others));

    it('checkIfScrollToBottomNeeded shouldchange height of scoll element when there is a new message', () => {
        component.nbMessages = 0;
        const newMessages: Message[] = [{ content: '', senderId: '', senderName: 'name', time: new Date() }];

        spyOnProperty(component, 'messages', 'get').and.returnValue(newMessages);

        const spy = spyOn(component.scrollElement.nativeElement, 'scrollTo');

        component.ngAfterViewChecked();
        expect(spy).toHaveBeenCalledWith({ top: component.scrollElement.nativeElement.scrollHeight });
    });
});
