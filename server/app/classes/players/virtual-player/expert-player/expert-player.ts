import { VirtualPlayer } from '@app/classes/players/virtual-player/virtual-player-abstract';
import { TIME_LIMIT } from '@app/constants/beginner-player';
import { EXPERT_ID } from '@app/constants/id-virtual-player';
import { ONE_SECOND } from '@app/constants/miscellaneous';
import { Action } from '@app/interface/action-interface';
import { Hint } from '@app/interface/hint';
import { Gameplay } from '@app/services/gameplay/gameplay.service';
import { Container } from 'typedi';

export class ExpertPlayer extends VirtualPlayer {
    timeLimit: number;
    gameplay: Gameplay;

    constructor(name: string, playerId: string) {
        super(name, playerId + EXPERT_ID);
        this.timeLimit = TIME_LIMIT;
        this.gameplay = Container.get(Gameplay);
    }

    async handleAction(): Promise<Action> {
        return this.placeAction();
    }

    async chooseTradeAction(stashSize: number): Promise<Action> {
        return stashSize ? this.tradeLetters(stashSize) : this.skipAction();
    }

    private async placeAction(): Promise<Action> {
        const possibilities: Hint[] = await this.gameplay.getPossibilities(this.id, { maxTime: this.timeLimit - ONE_SECOND / 2 });

        return possibilities.length ? Promise.resolve(possibilities[0].action) : this.trade(this.easel.letters.length);
    }
}
