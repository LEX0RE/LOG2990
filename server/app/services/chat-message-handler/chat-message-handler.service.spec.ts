/* eslint-disable max-lines -- Dans le but de tester l'ensemble du chat-filter*/
/* eslint-disable @typescript-eslint/no-explicit-any, dot-notation -- Méthode privée et mock des méthodes */
import { SPACE } from '@app/constants/command-formatting';
import { INVALID_COMMAND, NOT_PLAYER_TURN_ERROR, SYNTAX_ERROR } from '@app/constants/error/error-messages';
import { MIDDLE_POSITION } from '@app/constants/game';
import { EMPTY_COMMAND, HINT_MESSAGE, HINT_RESSEARCH, PARAMETERS_INVALID, TOO_LONG, WRONG_TURN } from '@app/constants/system-message';
import { MessageType } from '@app/enum/message-type';
import { Vector2D } from '@app/interface/vector-2d-interface';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler/chat-message-handler.service';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { EXPECTED_HELP_MESSAGE } from '@app/test/constants/fake-help-command';
import { FAKE_SOCKET_ID_PLAYER_1 } from '@app/test/constants/fake-player';
import { LONG_TEXT } from '@app/test/constants/fake-system-message';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { ActionType } from '@common/enums/action-type';
import { Orientation } from '@common/enums/orientation';
import { Message } from '@common/interfaces/message';
import { expect } from 'chai';
import { assert, restore, spy, stub } from 'sinon';

describe('ChatBoxHandler', () => {
    let chatFilter: ChatMessageHandlerService;
    let stubs: ServiceStubHelper;
    let chatMessage: Message;
    const idSender = 'sender id';
    const smallText = 'a small message';
    const maxTimeout = 5000;
    const handleCommand = async (action: ActionType, methodName: string) => {
        chatMessage.content = action;
        const spyHandlePlacerLetters = stub(chatFilter, methodName as any);

        await chatFilter['handleCommand'](chatMessage);
        assert.called(spyHandlePlacerLetters);
    };

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        chatFilter = new ChatMessageHandlerService();
        chatMessage = { time: new Date(), senderId: idSender, senderName: '', content: smallText };
    });

    afterEach(() => restore());

    it('handleMessage should call filterMessage if message is not too long', (done: Mocha.Done) => {
        const mockSize = stub(chatFilter, 'isRightSize' as any).callsFake(() => true);
        const sinonSpy = spy(chatFilter, 'filterMessage' as any);

        chatFilter.handleMessage(chatMessage);
        assert.called(mockSize);
        assert.called(sinonSpy);
        done();
    }).timeout(maxTimeout);

    it('handleMessage should not call filterMessage if message is too long', async () => {
        const mockSize = stub(chatFilter, 'isRightSize' as any).callsFake(() => false);
        const sinonSpy = spy(chatFilter, 'filterMessage' as any);

        await chatFilter.handleMessage(chatMessage);
        assert.called(mockSize);
        assert.notCalled(sinonSpy);
        expect(chatFilter.messageType).to.equal(MessageType.SenderOnly);
    });

    it('isRightSize should return true if message is not too long', async () => {
        expect(chatFilter['isRightSize'](chatMessage)).to.equal(true);
        expect(chatMessage.content).to.equal(smallText);
    });

    it('isRightSize should return false if message is too long and change message', () => {
        chatMessage.content = LONG_TEXT;
        expect(chatFilter['isRightSize'](chatMessage)).to.equal(false);
        expect(chatMessage.content).to.equal(TOO_LONG);
    });

    it('isRightSize should return true and not change message if message is empty', () => {
        chatMessage.content = '';
        expect(chatFilter['isRightSize'](chatMessage)).to.equal(true);
        expect(chatMessage.content).to.equal('');
    });

    it('filterMessage should call handleCommand if message starts with "!"', () => {
        const sinonSpy = spy(chatFilter, 'handleCommand' as any);
        const content = '!test';

        chatMessage.content = content;
        chatFilter['filterMessage'](chatMessage);
        assert.called(sinonSpy);
    });

    it('filterMessage should not call handleCommand if message does not start with "!"', async () => {
        const sinonSpy = spy(chatFilter, 'handleCommand' as any);

        await chatFilter['filterMessage'](chatMessage);
        assert.notCalled(sinonSpy);
        expect(chatFilter.messageType).to.equal(MessageType.All);
    });

    it('filterMessage should return MessageType All if message is empty', async () => {
        chatMessage.content = '';
        await chatFilter['filterMessage'](chatMessage);
        expect(chatFilter.messageType).to.equal(MessageType.All);
    });

    it('handleError should change message content and return MessageType Sender_Only', () => {
        chatFilter['handleError'](SYNTAX_ERROR, chatMessage);
        expect(chatMessage.content).to.equal(PARAMETERS_INVALID);
        chatFilter['handleError'](NOT_PLAYER_TURN_ERROR, chatMessage);
        expect(chatMessage.content).to.equal(WRONG_TURN);
        chatFilter['handleError']('TooMany letters to removed', chatMessage);
        expect(chatMessage.content).to.equal('TooMany letters to removed Vous passez votre tour.');
        expect(chatFilter['handleError']('', chatMessage)).to.equal(MessageType.SenderOnly);
    });

    it('handleCommand should call handleSkipTurn is action type is !passer', async () => handleCommand(ActionType.SkipTurn, 'handleSkipTurn'));

    it('handleCommand should call handlePlaceLetters is action type is !placer', async () =>
        handleCommand(ActionType.PlaceLetters, 'handlePlaceLetters'));

    it('handleCommand should call handleTrade is action type is !échanger', async () => handleCommand(ActionType.Trade, 'handleTrade'));

    it('handleCommand should call handleHelp is action type is !aide', async () => handleCommand(ActionType.Help, 'handleHelp'));

    it('handleCommand should call handleHint is action type is !indice', async () => handleCommand(ActionType.Hint, 'handleHint'));

    it('handleCommand should call handleStash is action type is !réserve', async () => handleCommand(ActionType.Stash, 'handleStash'));

    it('handleCommand should call handleDefault is action type is not valid', () => {
        const content = '!autre';

        chatMessage.content = content;
        const spyHandleDefault = stub(chatFilter, 'handleDefault' as any);

        chatFilter['handleCommand'](chatMessage);
        assert.called(spyHandleDefault);
    });

    it('handleSkipTurn should change value of messageType to All', async () => {
        chatMessage.content = ActionType.SkipTurn;
        stubs.gameplay.searchActivePlayer.resolvesThis();

        await chatFilter['handleSkipTurn'](chatMessage);
        assert.called(stubs.gameplay.searchActivePlayer);
        expect(chatFilter.messageType).to.equal(MessageType.All);
    });

    it('handleSkipTurn should call handleError for wrong parameters', () => {
        chatMessage.content = ActionType.SkipTurn;
        stubs.gameplay.searchActivePlayer.throws(NOT_PLAYER_TURN_ERROR);
        const spyError = spy(chatFilter, 'handleError' as any);

        chatFilter['handleSkipTurn'](chatMessage);
        assert.called(spyError);
    });

    it('handlePlaceLetters should change value of messageType to All', async () => {
        const word = 'allo';
        const position = { x: 1, y: 1 };
        const expectedPlacement = 'h8';
        const space = SPACE;

        chatMessage.content = `${ActionType.PlaceLetters} ${expectedPlacement}${Orientation.Vertical} ${word}`;
        stubs.commandFormattingService.formatLetters.returns([]);
        stubs.commandFormattingService.formatOrientation.returns(Orientation.Vertical);
        stubs.commandFormattingService.formatPlacement.returns(position);

        stubs.gameplay.checkIfPlayerTurn.resolvesThis();
        await chatFilter['handlePlaceLetters'](chatMessage, chatMessage.content.split(space));
        assert.calledWith(stubs.commandFormattingService.formatLetters, word);
        assert.calledWith(stubs.commandFormattingService.formatPlacement, expectedPlacement);
        assert.calledWith(stubs.commandFormattingService.formatOrientation, Orientation.Vertical);
        assert.called(stubs.gameplay.checkIfPlayerTurn);
        expect(chatFilter.messageType).to.equal(MessageType.All);
    });

    it('handlePlaceLetters should change value of messageType to All when placing 1 letter without orientation', async () => {
        const word = 'r';
        const position = { x: 1, y: 1 };
        const expectedPlacement = 'h6';
        const expectedOrientation = '6';

        chatMessage.content = `${ActionType.PlaceLetters} ${expectedPlacement} ${word}`;
        stubs.commandFormattingService.formatLetters.returns([]);
        stubs.commandFormattingService.formatOrientation.returns(Orientation.None);
        stubs.commandFormattingService.formatPlacement.returns(position);
        stubs.gameplay.checkIfPlayerTurn.resolvesThis();
        await chatFilter['handlePlaceLetters'](chatMessage, chatMessage.content.split(SPACE));
        assert.calledWith(stubs.commandFormattingService.formatLetters, word);
        assert.calledWith(stubs.commandFormattingService.formatPlacement, expectedPlacement);
        assert.calledWith(stubs.commandFormattingService.formatOrientation, expectedOrientation);
        assert.called(stubs.gameplay.checkIfPlayerTurn);
        expect(chatFilter.messageType).to.equal(MessageType.All);
    });

    it('handlePlaceLetters should call handleError for wrong parameters', () => {
        const action = '!placer t3h allo';

        chatMessage.content = action;
        const sinonSpy = spy(chatFilter, 'handleError' as any);

        chatFilter['handlePlaceLetters'](chatMessage, chatMessage.content.split(SPACE));
        assert.called(sinonSpy);
    });

    it('handlePlaceLetters should call handleError for empty parameters', () => {
        const action = '!placer';

        chatMessage.content = action;
        const handleErrorSpy = spy(chatFilter, 'handleError' as any);

        chatFilter['handlePlaceLetters'](chatMessage, chatMessage.content.split(SPACE));
        assert.called(handleErrorSpy);
    });

    it('handleTrade should change value of messageType to Trade', async () => {
        const word = 'allo';
        const action = `${ActionType.Trade} ${word}`;

        chatMessage.content = action;
        stubs.gameplay.checkIfPlayerTurn.resolvesThis();
        await chatFilter['handleTrade'](chatMessage, chatMessage.content.split(SPACE));
        assert.calledWith(stubs.commandFormattingService.formatLetters, word);
        assert.called(stubs.gameplay.checkIfPlayerTurn);
        expect(chatFilter.messageType).to.equal(MessageType.Trade);
    });

    it('handleTrade should call handleError for wrong parameters', () => {
        const action = '!échanger a-lo';

        chatMessage.content = action;
        stubs.commandFormattingService.formatLetters.returns([]);
        stubs.gameplay.checkIfPlayerTurn.throws();
        const sinonSpy = spy(chatFilter, 'handleError' as any);

        chatFilter['handleTrade'](chatMessage, chatMessage.content.split(SPACE));
        assert.called(sinonSpy);
    });

    it('handleTrade should call handleError for empty parameters', () => {
        const action = '!échanger';

        chatMessage.content = action;
        stubs.commandFormattingService.formatLetters.returns([]);
        stubs.gameplay.checkIfPlayerTurn.throws();
        const handleErrorSpy = spy(chatFilter, 'handleError' as any);

        chatFilter['handleTrade'](chatMessage, chatMessage.content.split(SPACE));
        assert.called(handleErrorSpy);
    });

    it('handleHelp should return MessageType Sender_Only', () => {
        chatMessage.content = ActionType.Help;

        chatFilter['handleHelp'](chatMessage);
        expect(chatFilter.messageType).to.equal(MessageType.SenderOnly);
        expect(chatMessage.content).to.equal(EXPECTED_HELP_MESSAGE);
    });

    it('handleStash should return MessageType Sender_Only and call stashInfo', () => {
        chatMessage.content = ActionType.Stash;
        chatFilter['handleStash'](chatMessage);
        expect(chatFilter.messageType).to.equal(MessageType.SenderOnly);
        assert.called(stubs.gameplay.stashInfo);
    });

    it('handleDefault should return MessageType Sender_Only and change message if command is not recognized', () => {
        const fakeCommand = '!réservee';
        const fakeParameter = 'aa';
        const content = `${fakeCommand} ${fakeParameter}`;
        const errorMessage = INVALID_COMMAND.replace('X', fakeCommand);

        chatMessage.content = content;
        chatFilter['handleDefault'](chatMessage, chatMessage.content.split(SPACE));
        expect(chatFilter.messageType).to.equal(MessageType.SenderOnly);
        expect(chatMessage.content).to.equal(errorMessage);
    });

    it('handleDefault should return MessageType Sender_Only and change message if command is empty', () => {
        chatMessage.content = '';
        chatFilter['handleDefault'](chatMessage, chatMessage.content.split(SPACE));
        expect(chatFilter.messageType).to.equal(MessageType.SenderOnly);
        expect(chatMessage.content).to.equal(EMPTY_COMMAND);
    });

    it('handleOrientedPlacement should call formatPlacement from commandFormattingService', () => {
        const content = '!placer h8v allo';
        const expectedPlacement = 'h8';

        chatMessage.content = content;
        stubs.commandFormattingService.formatPlacement.returns(MIDDLE_POSITION);

        chatFilter['handleOrientedPlacement'](chatMessage.content.split(SPACE), Orientation.Vertical);
        assert.calledWith(stubs.commandFormattingService.formatPlacement, expectedPlacement);
    });

    it('handleOrientedPlacement should return an placement and an horizontal orientation if orientation in parameters is none', () => {
        const placement: Vector2D = { x: 8, y: 7 };
        const content = '!placer h9 s';

        chatMessage.content = content;
        stubs.commandFormattingService.formatPlacement.returns(placement);
        const orientedPlacement = chatFilter['handleOrientedPlacement'](chatMessage.content.split(SPACE), Orientation.None);

        expect(orientedPlacement.placement.x).to.equal(placement.x);
        expect(orientedPlacement.placement.y).to.equal(placement.y);
        expect(orientedPlacement.orientation).to.equal(Orientation.Horizontal);
    });

    it('handleOrientedPlacement should return an placement and an horizontal orientation', () => {
        const content = '!placer h8v allo';

        chatMessage.content = content;
        stubs.commandFormattingService.formatPlacement.returns(MIDDLE_POSITION);
        const orientedPlacement = chatFilter['handleOrientedPlacement'](chatMessage.content.split(SPACE), Orientation.Vertical);

        expect(orientedPlacement.placement.x).to.equal(MIDDLE_POSITION.x);
        expect(orientedPlacement.placement.y).to.equal(MIDDLE_POSITION.y);
        expect(orientedPlacement.orientation).to.equal(Orientation.Vertical);
    });

    it('handleHint should return right message ', async () => {
        stubs.gameManager.getGameByPlayerId.returns(stubGame());
        chatMessage.content = ActionType.Hint;
        chatMessage.senderId = FAKE_SOCKET_ID_PLAYER_1;
        await chatFilter['handleHint'](chatMessage);
        expect(chatFilter.messageType).to.equal(MessageType.SenderOnly);
        expect(chatMessage.content).to.eql(HINT_MESSAGE);
    });

    it('handleHint should return error message if it is not his turn', async () => {
        stubs.gameManager.getGameByPlayerId.returns(undefined);

        chatMessage.content = ActionType.Hint;
        chatMessage.senderId = FAKE_SOCKET_ID_PLAYER_1;
        await chatFilter['handleHint'](chatMessage);
        expect(chatFilter.messageType).to.equal(MessageType.SenderOnly);
        expect(chatMessage.content).to.eql(WRONG_TURN);
    });

    it('handleHint should return error message if hint is already in use ', async () => {
        const game = stubGame();

        game.hintUsed.hintInProgress = true;
        stubs.gameManager.getGameByPlayerId.returns(game);

        chatMessage.content = ActionType.Hint;
        chatMessage.senderId = FAKE_SOCKET_ID_PLAYER_1;
        await chatFilter['handleHint'](chatMessage);
        expect(chatFilter.messageType).to.equal(MessageType.SenderOnly);
        expect(chatMessage.content).to.eql(HINT_RESSEARCH);
    });
});
