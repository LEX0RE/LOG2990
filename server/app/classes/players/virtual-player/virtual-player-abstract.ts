import { PlaceLetters } from '@app/classes/actions/place-letters/places-letter';
import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { TradeLetter } from '@app/classes/actions/trade-letters/trade-letters';
import { Game } from '@app/classes/game/game';
import { Letter } from '@app/classes/letters/letter/letter';
import { Player } from '@app/classes/players/player-abstract';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { TURN_DELAY } from '@app/constants/beginner-player';
import { Action } from '@app/interface/action-interface';
import { Chat } from '@app/interface/chat-room';
import { ChatManager } from '@app/services/chat-manager/chat-manager.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { delay } from '@app/test/delay';
import { ActionType } from '@common/enums/action-type';
import { Message } from '@common/interfaces/message';
import { Container } from 'typedi';

export abstract class VirtualPlayer extends Player {
    requiredUpdates: boolean;
    private chat: Chat;
    private gameManagerService: GameManager;
    private game!: Game | undefined;
    private chatManager: ChatManager;

    constructor(name: string, playerId: string) {
        super(name, playerId);
        this.requiredUpdates = false;
        this.chat = { id: '', userMessages: new Map() };
        this.gameManagerService = Container.get(GameManager);
        this.chatManager = Container.get(ChatManager);
    }

    async nextAction(): Promise<Action> {
        this.setGame();
        const action = await Promise.race(this.getAction());

        this.setMessage(action);
        return Promise.resolve(action);
    }

    async trade(numberToChange: number): Promise<Action> {
        if (!this.game) return this.skipAction();

        if (numberToChange >= this.game.letterStash.size) return this.chooseTradeAction(this.game.letterStash.size);

        return this.tradeLetters(numberToChange);
    }

    async tradeLetters(numberToChange: number): Promise<Action> {
        const letter: Letter[] = this.chooseLetter(numberToChange);

        return Promise.resolve(new TradeLetter(letter));
    }

    async skipAction(): Promise<Action> {
        await delay(this.timeLimit);

        return Promise.resolve(new SkipTurn());
    }

    setMessage(action: Action): void {
        switch (action.actionType) {
            case ActionType.PlaceLetters:
                this.sendMessage((action as PlaceLetters).toString());
                break;
            case ActionType.Trade:
                this.sendMessage((action as TradeLetter).toString());
                break;
            default:
                this.sendMessage((action as SkipTurn).toString());
        }
    }

    private sendMessage(message: string): void {
        const messageToPlayer: Message = {
            time: new Date(),
            senderId: this.id,
            content: message,
            senderName: this.name,
        };

        this.chatManager.sendToOthersInChat(this.id, this.chat, messageToPlayer);
    }

    private chooseLetter(numberChange: number): Letter[] {
        const letterToChange = [];
        const letterFromEasel: Letter[] = [];

        this.easel.letters.forEach((letter: Letter) => letterFromEasel.push(letter));
        for (let letter = 0; letter < numberChange; letter++) {
            const index = MathUtils.randomNumberInInterval(0, letterFromEasel.length - 1);

            letterToChange.push(letterFromEasel[index]);
            letterFromEasel.splice(index, 1);
        }
        return letterToChange;
    }

    private getAction(): Promise<Action>[] {
        const normalAction: Promise<Action> = this.actionPromise(TURN_DELAY);
        const skipAction: Promise<Action> = this.actionPromise(this.timeLimit, true);
        const end: Promise<Action> = this.endAction();

        return [normalAction, skipAction, end];
    }

    private async actionPromise(time: number, isSkip: boolean = false): Promise<Action> {
        const startTime = Date.now();
        const action = isSkip ? new SkipTurn() : await this.handleAction();

        await this.startDelay(startTime, time);
        return action;
    }

    private async startDelay(startTime: number, time: number): Promise<void> {
        const now = Date.now();
        const newDelay = time - (now - startTime);

        await delay(newDelay);
    }

    private setGame(): void {
        if (!this.game) {
            const game = this.gameManagerService.getGameByPlayerId(this.id);

            if (game) {
                this.game = game;
                const chat = this.chatManager.getChatIfExist(this.game.gameId);

                if (chat) this.chat = chat;
            }
        }
    }

    private async endAction(): Promise<Action> {
        return new Promise<Action>((resolve) => {
            this.outsideResolve = resolve;
        });
    }

    abstract handleAction(): Promise<Action>;

    abstract chooseTradeAction(stashSize: number): Promise<Action>;
}
