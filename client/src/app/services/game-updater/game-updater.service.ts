import { EventEmitter, Injectable } from '@angular/core';
import { DEFAULT_NUMBER_OF_LETTERS } from '@app/constants/easel';
import { DEFAULT_LETTERS_IN_STASH, DEFAULT_SCORE } from '@app/constants/game';
import { CommonPlayerInfo } from '@app/interface/common-player-info';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { BOARD_UPDATE, EASEL_UPDATE, GAME_UPDATE, GOAL_UPDATE } from '@common/constants/communication';
import { GoalType } from '@common/enums/goal-type';
import { BoardUpdate } from '@common/interfaces/board-update';
import { EaselUpdate } from '@common/interfaces/easel-update';
import { GameUpdate } from '@common/interfaces/game-update';
import { CommonBoard } from '@common/interfaces/game-view-related/common-board';
import { CommonEasel } from '@common/interfaces/game-view-related/common-easel';
import { CommonStash } from '@common/interfaces/game-view-related/common-stash';
import { CommonGoal } from '@common/interfaces/goal';
import { GoalUpdate } from '@common/interfaces/goal-update';

@Injectable({
    providedIn: 'root',
})
export class GameUpdaterService {
    easelUpdateEvent: EventEmitter<EaselUpdate>;
    socketService: SocketClientService;
    isLoading: boolean;
    private goals: CommonGoal[];
    private gameUpdate: GameUpdate;
    private boardUpdate: BoardUpdate;
    private easelUpdate: EaselUpdate;

    constructor(socketService: SocketClientService) {
        this.easelUpdateEvent = new EventEmitter();
        this.socketService = socketService;
        this.configureSocket();
        this.reset();
        this.isLoading = false;
    }

    get board(): CommonBoard {
        return this.boardUpdate.board;
    }

    get easel(): CommonEasel {
        return this.easelUpdate.easel;
    }

    get playerInfo(): CommonPlayerInfo {
        return this.gameUpdate.playerInfo;
    }

    get otherPlayerInfo(): CommonPlayerInfo {
        return this.gameUpdate.otherInfo;
    }

    get stash(): CommonStash {
        return this.gameUpdate.stash;
    }

    get myGoal(): CommonGoal[] {
        return this.goals.filter((goal: CommonGoal) => goal.type === GoalType.Private);
    }

    get otherGoal(): CommonGoal[] {
        return this.goals.filter((goal: CommonGoal) => goal.type === GoalType.OtherPrivate);
    }

    get publicGoals(): CommonGoal[] {
        return this.goals.filter((goal: CommonGoal) => goal.type === GoalType.Public);
    }

    reset(): void {
        this.isLoading = true;
        this.gameUpdate = {
            otherInfo: { nLetterLeft: DEFAULT_NUMBER_OF_LETTERS, name: '', score: DEFAULT_SCORE, turn: false },
            playerInfo: { nLetterLeft: DEFAULT_NUMBER_OF_LETTERS, name: '', score: DEFAULT_SCORE, turn: false },
            stash: { nLettersLeft: DEFAULT_LETTERS_IN_STASH },
        };
        this.boardUpdate = { board: { tiles: [] } };

        this.easelUpdate = { easel: { letters: [] } };
        this.goals = [];
    }

    private configureSocket(): void {
        this.socketService.on(GAME_UPDATE, (update: GameUpdate) => {
            this.isLoading = false;
            this.gameUpdate = update;
        });

        this.socketService.on(BOARD_UPDATE, (update: BoardUpdate) => (this.boardUpdate = update));

        this.socketService.on(EASEL_UPDATE, (update: EaselUpdate) => {
            this.easelUpdate = update;
            this.easelUpdateEvent.emit();
        });

        this.socketService.on(GOAL_UPDATE, (update: GoalUpdate) => (this.goals = update.goals));
    }
}
