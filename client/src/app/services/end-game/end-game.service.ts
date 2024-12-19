import { Injectable } from '@angular/core';
import { EaselService } from '@app/services/easel/logic/easel.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { END_GAME, GET_EASEL } from '@common/constants/communication';
import { GamePossibility } from '@common/enums/game-possibility';
import { EaselPlayer } from '@common/interfaces/easel-player';

@Injectable({
    providedIn: 'root',
})
export class EndGameService {
    decision: GamePossibility;
    private socketService: SocketClientService;
    private easelService: EaselService;

    constructor(socketService: SocketClientService, easelService: EaselService) {
        this.decision = GamePossibility.NotFinish;
        this.socketService = socketService;
        this.easelService = easelService;
        this.configureSocket();
    }

    reset(): void {
        this.decision = GamePossibility.NotFinish;
    }

    private configureSocket(): void {
        this.socketService.on(END_GAME, (decision: GamePossibility) => this.endGameHandler(decision));
    }

    private endGameHandler(decision: GamePossibility): void {
        this.decision = decision;
        const letters = this.easelService.viewLetters.map((letter) => {
            return letter.toCommonLetter;
        });
        const easel: EaselPlayer = { easel: letters, playerId: this.socketService.socketId };

        this.socketService.send(GET_EASEL, easel);
    }
}
