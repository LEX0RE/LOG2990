import { PlaceLetters } from '@app/classes/actions/place-letters/places-letter';
import { TradeLetter } from '@app/classes/actions/trade-letters/trade-letters';
import { COMMAND_START_SYMBOL, SPACE } from '@app/constants/command-formatting';
import { HINT_IN_PROGRESS, INVALID_COMMAND, NOT_PLAYER_TURN_ERROR, SYNTAX_ERROR } from '@app/constants/error/error-messages';
import { INDEX_NOT_FOUND } from '@app/constants/miscellaneous';
import {
    EMPTY_COMMAND,
    HELP_COMMAND,
    HINT_MESSAGE,
    HINT_RESSEARCH,
    PARAMETERS_INVALID,
    SKIP_TURN,
    TOO_LONG,
    WRONG_TURN,
} from '@app/constants/system-message';
import { MessageType } from '@app/enum/message-type';
import { PlacementOrientation } from '@app/interface/placement-orientation';
import { Vector2D } from '@app/interface/vector-2d-interface';
import { CommandFormattingService } from '@app/services/command-formatting/command-formatting.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { Gameplay } from '@app/services/gameplay/gameplay.service';
import { ACTION_TYPE_INFO } from '@common/constants/action-type-info';
import { MAX_LENGTH_MESSAGE } from '@common/constants/communication';
import { ActionType } from '@common/enums/action-type';
import { Orientation } from '@common/enums/orientation';
import { Message } from '@common/interfaces/message';
import { Container, Service } from 'typedi';

@Service()
export class ChatMessageHandlerService {
    messageType!: MessageType;
    private readonly gameplay: Gameplay;
    private commandFormattingService: CommandFormattingService;
    private gameManagerService: GameManager;

    constructor() {
        this.gameplay = Container.get(Gameplay);
        this.commandFormattingService = Container.get(CommandFormattingService);
        this.gameManagerService = Container.get(GameManager);
    }

    async handleMessage(message: Message): Promise<void> {
        if (this.isRightSize(message)) await this.filterMessage(message);
        else this.messageType = MessageType.SenderOnly;
    }

    private isRightSize(message: Message): boolean {
        if (message.content.length <= MAX_LENGTH_MESSAGE) return true;
        message.content = TOO_LONG;
        return false;
    }

    private async filterMessage(message: Message): Promise<void> {
        if (message.content.startsWith(COMMAND_START_SYMBOL)) await this.handleCommand(message);
        else this.messageType = MessageType.All;
    }

    private handleError(error: string, message: Message): MessageType {
        switch (error) {
            case SYNTAX_ERROR:
                message.content = PARAMETERS_INVALID;
                break;
            case NOT_PLAYER_TURN_ERROR:
                message.content = WRONG_TURN;
                break;
            case HINT_IN_PROGRESS:
                message.content = HINT_RESSEARCH;
                break;
            default:
                message.content = error + SPACE + SKIP_TURN;
                break;
        }

        return MessageType.SenderOnly;
    }

    private async handleCommand(message: Message): Promise<void> {
        const commands = message.content.split(SPACE);

        switch (commands[0]) {
            case ActionType.SkipTurn:
                return this.handleSkipTurn(message);
            case ActionType.PlaceLetters:
                return this.handlePlaceLetters(message, commands);
            case ActionType.Trade:
                return this.handleTrade(message, commands);
            case ActionType.Help:
                return this.handleHelp(message);
            case ActionType.Hint:
                return this.handleHint(message);
            case ActionType.Stash:
                return this.handleStash(message);
            default:
                return this.handleDefault(message, commands);
        }
    }

    private async handleSkipTurn(message: Message): Promise<void> {
        try {
            this.gameplay.searchActivePlayer(message.senderId);
            this.messageType = MessageType.All;
        } catch (error: unknown) {
            this.messageType = this.handleError((error as Error).message, message);
        }
    }

    private async handlePlaceLetters(message: Message, commands: string[]): Promise<void> {
        try {
            const placeLettersParam = 3;

            if (commands.length < placeLettersParam) throw new Error(SYNTAX_ERROR);
            const lettersToPlace = this.commandFormattingService.formatLetters(commands[2], ActionType.PlaceLetters);
            const orientation = this.commandFormattingService.formatOrientation(commands[1].slice(INDEX_NOT_FOUND), lettersToPlace.length);
            const orientedPlacement = this.handleOrientedPlacement(commands, orientation);
            const placeLettersAction = new PlaceLetters(lettersToPlace, orientedPlacement.placement, orientedPlacement.orientation);

            await this.gameplay.checkIfPlayerTurn(message.senderId, placeLettersAction);
            this.messageType = MessageType.All;
        } catch (error: unknown) {
            this.messageType = this.handleError((error as Error).message, message);
        }
    }

    private async handleTrade(message: Message, commands: string[]): Promise<void> {
        try {
            const tradeParam = 2;

            if (commands.length < tradeParam) throw new Error(SYNTAX_ERROR);
            const lettersToTrade = this.commandFormattingService.formatLetters(commands[1], ActionType.Trade);

            await this.gameplay.checkIfPlayerTurn(message.senderId, new TradeLetter(lettersToTrade));
            this.messageType = MessageType.Trade;
        } catch (error: unknown) {
            this.messageType = this.handleError((error as Error).message, message);
        }
    }

    private handleHelp(message: Message): void {
        let messageToSend = HELP_COMMAND;
        const separator = '\n\n ';

        ACTION_TYPE_INFO.forEach((info: string) => (messageToSend += separator + info));
        message.content = messageToSend;
        this.messageType = MessageType.SenderOnly;
    }

    private async handleHint(message: Message): Promise<void> {
        try {
            const game = this.gameManagerService.getGameByPlayerId(message.senderId);

            if (game?.activePlayer.id !== message.senderId) throw new Error(NOT_PLAYER_TURN_ERROR);
            if (game.hintUsed.hintInProgress) throw new Error(HINT_IN_PROGRESS);

            game.hintUsed.hintInProgress = true;
            message.content = HINT_MESSAGE;
            this.messageType = MessageType.SenderOnly;
        } catch (error: unknown) {
            this.messageType = this.handleError((error as Error).message, message);
        }
    }

    private handleStash(message: Message): void {
        message.content = this.gameplay.stashInfo(message.senderId);
        this.messageType = MessageType.SenderOnly;
    }

    private handleDefault(message: Message, commands: string[]): void {
        message.content = commands[0] ? INVALID_COMMAND.replace('X', commands[0]) : EMPTY_COMMAND;
        this.messageType = MessageType.SenderOnly;
    }

    private handleOrientedPlacement(commands: string[], orientation: Orientation): PlacementOrientation {
        let placement: Vector2D;

        if (orientation === Orientation.None) {
            placement = this.commandFormattingService.formatPlacement(commands[1]);
            orientation = Orientation.Horizontal;
        } else placement = this.commandFormattingService.formatPlacement(commands[1].slice(0, INDEX_NOT_FOUND));
        return { placement, orientation };
    }
}
