import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { GameFactory } from '@app/services/game-factory/game-factory.service';
import { RoomManager } from '@app/services/room-manager/room-manager.service';
import { VirtualPlayerNameService } from '@app/services/virtual-player-name/virtual-player-name.service';
import { CREATE_SOLO_GAME, JOIN_GAME_CONFIRMATION_PLAYER1 } from '@common/constants/communication';
import { SoloGameConfig } from '@common/interfaces/solo-game-config';
import { Container, Service } from 'typedi';

@Service()
export class SoloGameFactory extends GameFactory {
    private virtualPlayerName: VirtualPlayerNameService;

    constructor() {
        super();
        this.roomManager = Container.get(RoomManager);
        this.virtualPlayerName = Container.get(VirtualPlayerNameService);
    }

    protected configureSocketFeatures(): void {
        this.socketManager.on(CREATE_SOLO_GAME, (config: SoloGameConfig) => {
            this.createSoloGame(config);
        });
    }

    private async createSoloGame(info: SoloGameConfig) {
        const roomId = this.createGame(info);
        const name = await this.virtualPlayerName.changeName(info.player2Difficulty, info.player1Name);

        const game = this.gameManager.joinSoloGame(name, roomId, info.player2Difficulty);

        if (game) this.addVirtualPlayerToChat(game, roomId);

        // eslint-disable-next-line no-undefined -- nécessaire pour envoyer une valeur booléenne
        this.socketManager.sendPrivate(JOIN_GAME_CONFIRMATION_PLAYER1, info.player1SocketId, game !== undefined);
        if (game) game.start().finally(this.deleteGame(game.gameId));
    }

    private addVirtualPlayerToChat(game: Game, roomId: string): void {
        const virtualPlayer = game.players.find((player: Player) => !player.requiredUpdates);

        if (virtualPlayer) this.chatManager.addUserToChat(virtualPlayer.name, virtualPlayer.id, roomId);
    }
}
