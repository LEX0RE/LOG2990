import { BestScoreService } from '@app/services/best-score/best-score.service';
import { ChatManager } from '@app/services/chat-manager/chat-manager.service';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler/chat-message-handler.service';
import { CommandFormattingService } from '@app/services/command-formatting/command-formatting.service';
import { DatabaseService } from '@app/services/database/database.service';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { EndGameManager } from '@app/services/end-game-manager/end-game-manager.service';
import { MultiplayerGameFactory } from '@app/services/game-factory/multiplayer-game-factory/multiplayer-game-factory.service';
import { SoloGameFactory } from '@app/services/game-factory/solo-game-factory/solo-game-factory.service';
import { GameHistory } from '@app/services/game-history/game-history.service';
import { GameInfoFormattingService } from '@app/services/game-information-formatting/game-information-formatting';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { Gameplay } from '@app/services/gameplay/gameplay.service';
import { GoalFactory } from '@app/services/goal-factory/goal-factory.service';
import { InitializeGameHandler } from '@app/services/initialize-game-handler/initialize-game-handler.service';
import { ReconnectionManager } from '@app/services/reconnection-manager/reconnection-manager.service';
import { RoomManager } from '@app/services/room-manager/room-manager.service';
import { ScrabbleAlgo } from '@app/services/scrabble-algorithm/scrabble-algorithm.service';
import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { TurnTimesService } from '@app/services/turn-times/turn-times.service';
import { VirtualPlayerNameService } from '@app/services/virtual-player-name/virtual-player-name.service';
import { stubChatFilter } from '@app/test/services-stubs/chat-filter-stub';
import { stubChatManager } from '@app/test/services-stubs/chat-manager-stub';
import { stubDictionaryService } from '@app/test/services-stubs/dictionary-stub';
import { stubGameManager } from '@app/test/services-stubs/game-manager-stub';
import { stubGameplay } from '@app/test/services-stubs/gameplay-stub';
import { stubRoomManager } from '@app/test/services-stubs/room-manager-stub';
import { SocketClientStub } from '@app/test/services-stubs/socket-manager/socket-client/socket-client-stub';
import { SocketManagerStub } from '@app/test/services-stubs/socket-manager/socket-manager/socket-manager-stub';
import { createStubInstance, restore, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Container, Token } from 'typedi';

export class ServiceStubHelper {
    clientSocket!: SocketClientStub;
    getStub!: SinonStub<[id: Token<unknown>], unknown>;
    socketManager!: SocketManagerStub;
    gameManager!: SinonStubbedInstance<GameManager>;
    gameplay!: SinonStubbedInstance<Gameplay>;
    chatManager!: SinonStubbedInstance<ChatManager>;
    reconnectionManager!: SinonStubbedInstance<ReconnectionManager>;
    roomManager!: SinonStubbedInstance<RoomManager>;
    chatFilter!: SinonStubbedInstance<ChatMessageHandlerService>;
    multiplayerGameFactory!: SinonStubbedInstance<MultiplayerGameFactory>;
    soloGameFactory!: SinonStubbedInstance<SoloGameFactory>;
    scrabbleAlgo!: SinonStubbedInstance<ScrabbleAlgo>;
    dictionaryService!: SinonStubbedInstance<DictionaryService>;
    initializeGameHandler!: SinonStubbedInstance<InitializeGameHandler>;
    endGameManager!: SinonStubbedInstance<EndGameManager>;
    turnTimesService!: SinonStubbedInstance<TurnTimesService>;
    commandFormattingService!: SinonStubbedInstance<CommandFormattingService>;
    gameInfoFormattingService!: SinonStubbedInstance<GameInfoFormattingService>;
    bestScore!: SinonStubbedInstance<BestScoreService>;
    virtualPlayerName!: SinonStubbedInstance<VirtualPlayerNameService>;
    gameHistory!: SinonStubbedInstance<GameHistory>;
    databaseService!: SinonStubbedInstance<DatabaseService>;
    goalFactory!: SinonStubbedInstance<GoalFactory>;

    constructor() {
        this.stubAllService();
    }

    // eslint-disable-next-line max-lines-per-function -- construit tous les stubs services
    stubAllService(): void {
        restore();

        this.getStub = stub(Container, 'get');

        this.socketManager = new SocketManagerStub();
        this.getStub.withArgs(SocketManager as Token<unknown>).returns(this.socketManager);
        this.clientSocket = this.socketManager.createClient();

        this.gameManager = stubGameManager();
        this.getStub.withArgs(GameManager as Token<unknown>).returns(this.gameManager);

        this.roomManager = stubRoomManager();
        this.getStub.withArgs(RoomManager as Token<unknown>).returns(this.roomManager);

        this.chatFilter = stubChatFilter();
        this.getStub.withArgs(ChatMessageHandlerService as Token<unknown>).returns(this.chatFilter);

        this.chatManager = stubChatManager();
        this.getStub.withArgs(ChatManager as Token<unknown>).returns(this.chatManager);

        this.multiplayerGameFactory = createStubInstance(MultiplayerGameFactory);
        this.getStub.withArgs(MultiplayerGameFactory as Token<unknown>).returns(this.multiplayerGameFactory);

        this.soloGameFactory = createStubInstance(SoloGameFactory);
        this.getStub.withArgs(SoloGameFactory as Token<unknown>).returns(this.soloGameFactory);

        this.scrabbleAlgo = createStubInstance(ScrabbleAlgo);
        this.getStub.withArgs(ScrabbleAlgo as Token<unknown>).returns(this.scrabbleAlgo);

        this.dictionaryService = stubDictionaryService();
        this.getStub.withArgs(DictionaryService as Token<unknown>).returns(this.dictionaryService);

        this.initializeGameHandler = createStubInstance(InitializeGameHandler);
        this.getStub.withArgs(InitializeGameHandler as Token<unknown>).returns(this.initializeGameHandler);

        this.reconnectionManager = createStubInstance(ReconnectionManager);
        this.getStub.withArgs(ReconnectionManager as Token<unknown>).returns(this.reconnectionManager);

        this.endGameManager = createStubInstance(EndGameManager);
        this.getStub.withArgs(EndGameManager as Token<unknown>).returns(this.endGameManager);

        this.gameplay = stubGameplay();
        this.getStub.withArgs(Gameplay as Token<unknown>).returns(this.gameplay);

        this.turnTimesService = createStubInstance(TurnTimesService);
        this.getStub.withArgs(TurnTimesService as Token<unknown>).returns(this.turnTimesService);

        this.commandFormattingService = createStubInstance(CommandFormattingService);
        this.getStub.withArgs(CommandFormattingService as Token<unknown>).returns(this.commandFormattingService);

        this.gameInfoFormattingService = createStubInstance(GameInfoFormattingService);
        this.getStub.withArgs(GameInfoFormattingService as Token<unknown>).returns(this.gameInfoFormattingService);

        this.bestScore = createStubInstance(BestScoreService);
        this.getStub.withArgs(BestScoreService as Token<unknown>).returns(this.bestScore);

        this.virtualPlayerName = createStubInstance(VirtualPlayerNameService);
        this.getStub.withArgs(VirtualPlayerNameService as Token<unknown>).returns(this.virtualPlayerName);

        this.gameHistory = createStubInstance(GameHistory);
        this.getStub.withArgs(GameHistory as Token<unknown>).returns(this.gameHistory);

        this.databaseService = createStubInstance(DatabaseService);
        this.getStub.withArgs(DatabaseService as Token<unknown>).returns(this.databaseService);

        this.goalFactory = createStubInstance(GoalFactory);
        this.getStub.withArgs(GoalFactory as Token<unknown>).returns(this.goalFactory);
    }
}
