import { SkipTurn } from '@app/classes/actions/skip-turn/skip-turn';
import { Player } from '@app/classes/players/player-abstract';
import { TIMES_UP } from '@app/constants/error/real-player';
import { Action } from '@app/interface/action-interface';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { Gameplay } from '@app/services/gameplay/gameplay.service';
import { Container } from 'typedi';

export class RealPlayer extends Player {
    gameplay: Gameplay;
    gameManagerService: GameManager;
    requiredUpdates: boolean;
    outsidePromise!: Promise<Action>;
    outsideEndTime!: () => void;

    constructor(name: string, socketId: string) {
        super(name, socketId);
        this.gameplay = Container.get(Gameplay);
        this.gameManagerService = Container.get(GameManager);
        this.requiredUpdates = true;
    }

    async nextAction(): Promise<Action> {
        const promiseTurn = new Promise<Action>((resolve) => {
            this.outsideEndTime = this.outsideTimeOutHandler(this, resolve);
            this.outsideResolve = resolve;
        });

        this.outsidePromise = promiseTurn;
        this.pushPlayerTurn();
        return promiseTurn;
    }

    private pushPlayerTurn(): void {
        this.gameplay.addToPlayerTurnQueue({
            player: this,
            resolve: this.outsideResolve,
            endAction: this.outsideEndTime,
        });
    }

    private outsideTimeOutHandler(player: RealPlayer, resolve: (value: Action | PromiseLike<Action>) => void) {
        return (): void => {
            player.gameplay.playerTurnsQueue.splice(
                player.gameplay.playerTurnsQueue.findIndex((entry) => entry.player.id === player.id),
                1,
            );
            const activeGame = player.gameManagerService.getGameByPlayerId(player.id);

            if (activeGame && activeGame.outsideResolveError) activeGame.outsideResolveError(TIMES_UP);

            resolve(new SkipTurn());
        };
    }
}
