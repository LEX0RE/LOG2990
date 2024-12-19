import { TimeUtils } from '@app/classes/utils/time/time';
import { ONE_SECOND } from '@app/constants/miscellaneous';
import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { MIN_PER_ROOM, TIMER } from '@common/constants/communication';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';
import { Container } from 'typedi';

export class Timer {
    private timerId!: NodeJS.Timeout;
    private roomId!: string;
    private startTime!: number;
    private max!: number;
    private socketManager: SocketManager;
    private endTime: (() => void) | null;

    constructor(roomId: string, time: CommonTimer) {
        this.max = TimeUtils.toMS(time);
        this.socketManager = Container.get(SocketManager);
        this.endTime = null;
        if (this.socketManager?.getRoomSize(roomId) > 0) this.roomId = roomId;
        if (this.socketManager?.getRoomSize(roomId) > MIN_PER_ROOM) this.roomId = roomId;
    }

    setEndTimer(endTime: (() => void) | null): void {
        this.endTime = endTime;
    }

    start(): void {
        if (this.roomId) {
            clearInterval(this.timerId);
            this.startTime = Date.now();
            this.emitTime();
            setTimeout(() => this.emitTime(), 1);
            this.timerId = setInterval(() => this.emitTime(), ONE_SECOND / 2);
        }
    }

    stop(): void {
        clearInterval(this.timerId);
    }

    remainingTime(): number {
        return this.max - (Date.now() - this.startTime);
    }

    private emitTime(): void {
        const timeRemaining = this.remainingTime();

        if (timeRemaining > 0) this.socketManager.to(TIMER, this.roomId, TimeUtils.toCommonTimer(timeRemaining));
        else {
            this.stop();
            if (this.endTime) this.endTime();
        }
    }
}
