import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { BeginnerPlayer } from '@app/classes/players/virtual-player/beginner-player/beginner-player';
import { PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/constants/game';
import { BEGINNER_ID, EXPERT_ID } from '@app/constants/id-virtual-player';
import { ONE_SECOND } from '@app/constants/miscellaneous';
import { SURRENDER } from '@app/constants/surrender';
import { Chat } from '@app/interface/chat-room';
import { ChatManager } from '@app/services/chat-manager/chat-manager.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { Gameplay } from '@app/services/gameplay/gameplay.service';
import { ReconnectionManager } from '@app/services/reconnection-manager/reconnection-manager.service';
import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { VirtualPlayerNameService } from '@app/services/virtual-player-name/virtual-player-name.service';
import { delay } from '@app/test/delay';
import { END_GAME, GET_EASEL, SURRENDER_EVENT } from '@common/constants/communication';
import { Difficulty } from '@common/enums/difficulty';
import { GamePossibility } from '@common/enums/game-possibility';
import { EaselPlayer } from '@common/interfaces/easel-player';
import { CommonLetter } from '@common/interfaces/game-view-related/common-letter';
import { Message } from '@common/interfaces/message';
import { Container, Service } from 'typedi';

@Service()
export class EndGameManager {
    private socketManager: SocketManager;
    private gameManager: GameManager;
    private chatManager: ChatManager;
    private gameplay: Gameplay;
    private reconnectionManager: ReconnectionManager;
    private virtualPlayerName: VirtualPlayerNameService;
    private easel: Map<string, CommonLetter[]>;

    constructor() {
        this.socketManager = Container.get(SocketManager);
        this.gameManager = Container.get(GameManager);
        this.chatManager = Container.get(ChatManager);
        this.gameplay = Container.get(Gameplay);
        this.reconnectionManager = Container.get(ReconnectionManager);
        this.virtualPlayerName = Container.get(VirtualPlayerNameService);
        this.easel = new Map<string, CommonLetter[]>();
        this.configureSocket();
    }

    configureSocket(): void {
        this.socketManager.on(SURRENDER_EVENT, (message: Message) => {
            this.giveUpHandler(message.senderId);
        });
        this.socketManager.on(GET_EASEL, (message: EaselPlayer) => {
            this.easel.set(message.playerId, message.easel);
        });
    }

    sendEndGame(playerId: string, decision: GamePossibility): void {
        this.socketManager.sendPrivate(END_GAME, playerId, decision);
    }

    async sendEndMessage(players: Player[], gameId: string, nLetterStash: number): Promise<void> {
        await this.changeEasel(players);
        const chat = this.chatManager.getChatIfExist(gameId);

        if (chat) {
            this.chatManager.sendToChat(
                chat,
                this.chatManager.messageFromServer('Fin de partie - ' + nLetterStash + ' lettre restante dans la réserve'),
            );
            players.forEach((player: Player) => this.summarizePlayer(player, chat));
        }
    }

    giveUpHandler(socketId: string): void {
        const game = this.gameManager.getGameByPlayerId(socketId);

        if (game) this.giveUpOption(game, socketId);

        this.reconnectionManager.removeUser(socketId);
    }

    private summarizePlayer(player: Player, chat: Chat): void {
        this.chatManager.sendToChat(chat, this.chatManager.messageFromServer(player.name + ': '));
        player.easel.letters.forEach((letter) => {
            this.chatManager.sendToChat(chat, this.chatManager.messageFromServer('Lettre:' + letter.letter + ', Point:' + letter.point));
        });
    }

    private giveUpOption(game: Game, socketId: string) {
        game.watchTower.surrenderedPlayerId = socketId;
        const indexPlayerToReplace: number = game.findIndexPlayer(socketId);
        const indexOtherPlayer: number = indexPlayerToReplace === PLAYER_ONE_INDEX ? PLAYER_TWO_INDEX : PLAYER_ONE_INDEX;
        const playerToKeep: Player = game.players[indexOtherPlayer];

        const playerToReplace: Player = game.players[indexPlayerToReplace];

        if (this.isVirtualPlayer(playerToKeep)) this.endGame(game, playerToKeep);
        else this.changePlayer(game, playerToReplace, playerToKeep);

        this.handleDisconnect(game);
    }

    private sendSurrender(roomId: string, surrenderName: string): void {
        const chat = this.chatManager.getChatIfExist(roomId);

        if (chat) this.chatManager.sendToChat(chat, this.chatManager.messageFromServer(surrenderName + SURRENDER));
    }

    private async changePlayer(game: Game, playerToReplace: Player, playerToKeep: Player) {
        const indexPlayerToReplace = game.players.findIndex((player: Player) => player === playerToReplace);

        this.sendSurrender(game.gameId, playerToReplace.name);
        const beginnerPlayer: BeginnerPlayer = await this.copyPlayer(playerToReplace, playerToKeep);

        game.players[indexPlayerToReplace] = beginnerPlayer;
        this.chatManager.addUserToChat(beginnerPlayer.name, beginnerPlayer.id, game.gameId);
        game.watchTower.update();
    }

    private async copyPlayer(surrenderPlayer: Player, playerToKeep: Player) {
        const name: string = await this.virtualPlayerName.changeName(Difficulty.Easy, playerToKeep.name);
        const beginnerPlayer: BeginnerPlayer = new BeginnerPlayer(name, playerToKeep.id);

        beginnerPlayer.easel = surrenderPlayer.easel;
        beginnerPlayer.score = surrenderPlayer.score;
        return beginnerPlayer;
    }

    private endGame(game: Game, playerToKeep: Player) {
        game.end();
        game.winners = [playerToKeep];
    }

    private handleDisconnect(game: Game) {
        game.players.forEach((player: Player) => {
            try {
                this.gameplay.endPlayerTurn(player.id, new SkipTurn());
                // eslint-disable-next-line no-empty -- attrape l'erreur si le client est déconnecté
            } catch (error) {}
        });
    }

    private isVirtualPlayer(player: Player) {
        return player.id.includes(BEGINNER_ID) || player.id.includes(EXPERT_ID);
    }

    private async changeEasel(players: Player[]): Promise<void> {
        await delay(ONE_SECOND);
        players.forEach((player: Player) => {
            if (player.requiredUpdates) {
                const easelFromPlayer = this.easel.get(player.id);

                if (easelFromPlayer) {
                    player.easel.letters = easelFromPlayer;
                    this.easel.delete(player.id);
                }
            }
        });
    }
}
