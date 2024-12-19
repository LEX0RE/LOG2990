import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DELAY_LETTER_RESET } from '@app/constants/easel';
import { CommandConversionService } from '@app/services/command-conversion/command-conversion.service';
import { EaselSelectionService } from '@app/services/easel/view/easel-selection.service';
import { MessageSenderService } from '@app/services/messages-sender/messages-sender.service';
import { mockEaselSelectionService } from '@app/test/mocks/easel-mock/easel-selection-service-mock';
import { mockMessageSenderService } from '@app/test/mocks/message-sender-mock';
import { MESSAGE } from '@common/constants/communication';
import { Orientation } from '@common/enums/orientation';
import { Coordinate } from '@common/interfaces/coordinate';

describe('CommandConversionService', () => {
    let service: CommandConversionService;
    let messageSender: MessageSenderService;
    let easel: EaselSelectionService;

    beforeEach(() => {
        messageSender = mockMessageSenderService();
        easel = mockEaselSelectionService();
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            providers: [
                { provide: MessageSenderService, useValue: messageSender },
                { provide: EaselSelectionService, useValue: easel },
            ],
        });
        service = TestBed.inject(CommandConversionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('sendPlaceLetter should send the right message', () => {
        const initialPosition: Coordinate = { column: 4, row: 'h' };
        const letters = 'abc';
        const expected = '!placer h4v abc';

        service.sendPlaceLetter(initialPosition, Orientation.Vertical, letters);
        expect(messageSender.sendToServer).toHaveBeenCalledWith(MESSAGE, expected);
    });

    it('sendPlaceLetter should send the right message', () => {
        const initialPosition: Coordinate = { column: 4, row: 'h' };
        const letters = 'abc';
        const expected = '!placer h4 abc';

        service.sendPlaceLetter(initialPosition, Orientation.None, letters);
        expect(messageSender.sendToServer).toHaveBeenCalledWith(MESSAGE, expected);
    });

    it('sendTradeLetter should send the right message', () => {
        const expected = '!échanger m';

        service.sendTradeLetter();
        expect(messageSender.sendToServer).toHaveBeenCalledWith(MESSAGE, expected);
        expect(easel.cancelTrade).toHaveBeenCalled();
    });

    it('sendTradeLetter should do noting if there is no trade letters', () => {
        Object.defineProperty(easel, 'tradeLetters', { value: '' });
        service.sendTradeLetter();
        expect(messageSender.sendToServer).not.toHaveBeenCalled();
        expect(easel.cancelTrade).not.toHaveBeenCalled();
    });

    it('sendSkipTurn should send right message', () => {
        const expected = '!passer';

        service.sendSkipTurn();
        expect(messageSender.sendToServer).toHaveBeenCalledWith(MESSAGE, expected);
    });

    it('sendPlaceLetter should call cancelHidden after timeout ', fakeAsync(() => {
        const initialPosition: Coordinate = { column: 4, row: 'h' };
        const letters = 'abc';

        service.sendPlaceLetter(initialPosition, Orientation.None, letters);
        tick(DELAY_LETTER_RESET);
        expect(easel.cancelHidden).toHaveBeenCalled();
    }));

    it('sendHint should send right message', () => {
        const expected = '!indice';

        service.sendHint();
        expect(messageSender.sendToServer).toHaveBeenCalledWith(MESSAGE, expected);
    });

    it('sendStash should send right message', () => {
        const expected = '!réserve';

        service.sendStash();
        expect(messageSender.sendToServer).toHaveBeenCalledWith(MESSAGE, expected);
    });

    it('sendHelp should send right message', () => {
        const expected = '!aide';

        service.sendHelp();
        expect(messageSender.sendToServer).toHaveBeenCalledWith(MESSAGE, expected);
    });
});
