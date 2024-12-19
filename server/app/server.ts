/* eslint-disable no-console -- Pour les logs du serveur ainsi que les erreurs */
import { Application } from '@app/app';
import { memory } from '@app/classes/utils/memory/memory';
import { BASE_TEN } from '@app/constants/miscellaneous';
import { BestScoreService } from '@app/services/best-score/best-score.service';
import { ErrorHandlerBestScoreService } from '@app/services/best-score/error-handler/error-handler-best-score';
import { ChatManager } from '@app/services/chat-manager/chat-manager.service';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler/chat-message-handler.service';
import { DatabaseService } from '@app/services/database/database.service';
import { EndGameManager } from '@app/services/end-game-manager/end-game-manager.service';
import { MultiplayerGameFactory } from '@app/services/game-factory/multiplayer-game-factory/multiplayer-game-factory.service';
import { SoloGameFactory } from '@app/services/game-factory/solo-game-factory/solo-game-factory.service';
import { GameHistory } from '@app/services/game-history/game-history.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { Gameplay } from '@app/services/gameplay/gameplay.service';
import { InitializeGameHandler } from '@app/services/initialize-game-handler/initialize-game-handler.service';
import { ReconnectionManager } from '@app/services/reconnection-manager/reconnection-manager.service';
import { RoomManager } from '@app/services/room-manager/room-manager.service';
import { ScrabbleAlgo } from '@app/services/scrabble-algorithm/scrabble-algorithm.service';
import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { VirtualPlayerNameService } from '@app/services/virtual-player-name/virtual-player-name.service';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Container, Service } from 'typedi';

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    server!: http.Server;
    private readonly application: Application;
    private readonly databaseService: DatabaseService;

    constructor() {
        this.application = Container.get(Application);
        this.databaseService = Container.get(DatabaseService);
    }

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, BASE_TEN) : val;

        if (isNaN(port)) return val;
        else if (port >= 0) return port;
        return false;
    }

    async init(): Promise<void> {
        this.application.app.set('port', Server.appPort);
        this.server = http.createServer(this.application.app);
        this.setContainers();
        this.server.listen(Server.appPort);
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());

        await this.connectDatabase();

        console.log(`The script uses approximately ${memory()} MB`);
    }

    private setContainers(): void {
        Container.set(SocketManager, new SocketManager(this));
        Container.set(GameManager, new GameManager());
        Container.set(RoomManager, new RoomManager());
        Container.set(Gameplay, new Gameplay());
        Container.set(ChatMessageHandlerService, new ChatMessageHandlerService());
        Container.set(ChatManager, new ChatManager());
        Container.set(MultiplayerGameFactory, new MultiplayerGameFactory());
        Container.set(SoloGameFactory, new SoloGameFactory());
        Container.set(ScrabbleAlgo, new ScrabbleAlgo());
        Container.set(InitializeGameHandler, new InitializeGameHandler());
        Container.set(ReconnectionManager, new ReconnectionManager());
        Container.set(EndGameManager, new EndGameManager());
        Container.set(VirtualPlayerNameService, new VirtualPlayerNameService());
        Container.set(GameHistory, new GameHistory());
        Container.set(ErrorHandlerBestScoreService, new ErrorHandlerBestScoreService());
        Container.set(BestScoreService, new BestScoreService());
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;

        this.handleErrorCode(error, bind);
    }

    private handleErrorCode(error: NodeJS.ErrnoException, bind: string): void {
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
            // eslint-disable-next-line no-fallthrough -- traiter le exit
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
            // eslint-disable-next-line no-fallthrough -- traiter le exit
            default:
                throw error;
        }
    }

    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;

        console.log(`Listening on ${bind}`);
    }

    private async connectDatabase(): Promise<void> {
        try {
            await this.databaseService.start();
            console.log('Database connection successful.');
        } catch {
            console.error('Database connection failed.');
        }
    }
}
