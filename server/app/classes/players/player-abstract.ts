import { Easel } from '@app/classes/easel/easel';
import { Action } from '@app/interface/action-interface';

export abstract class Player {
    score: number;
    easel: Easel;
    requiredUpdates: boolean;
    timeLimit: number;
    name: string;
    id: string;
    outsideResolve!: (value: Action | PromiseLike<Action>) => void;

    constructor(name: string, playerId: string) {
        this.score = 0;
        this.easel = new Easel();
        this.requiredUpdates = false;
        this.timeLimit = 0;
        this.name = name;
        this.id = playerId;
    }

    abstract nextAction(): Promise<Action>;
}
