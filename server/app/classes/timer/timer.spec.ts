/* eslint-disable dot-notation -- Méthode privée */
import { Timer } from '@app/classes/timer/timer';
import { ONE_SECOND } from '@app/constants/miscellaneous';
import { doNothing } from '@app/test/do-nothing-function';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';
import { expect } from 'chai';
import { assert, restore, SinonStub, spy, stub, useFakeTimers } from 'sinon';

describe('Timer', () => {
    const roomId = '1234';
    const fullRoomSize = 2;
    const emptyRoomSize = 0;
    const nSeconds = 3;
    let timer: Timer;
    const commonTimer: CommonTimer = { minute: 0, second: nSeconds };
    let stubs: ServiceStubHelper;
    let stubRoomSize: SinonStub<[room: string], number>;

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        stubRoomSize = stub(stubs.socketManager, 'getRoomSize').returns(fullRoomSize);
        timer = new Timer(roomId, commonTimer);
        timer.setEndTimer(doNothing);
    });

    afterEach(() => restore());

    it('should create a basic timer if room size is full', () => {
        const timerConstruct = new Timer(roomId, commonTimer);

        expect(timerConstruct['socketManager']).to.be.eql(stubs.socketManager);

        expect(timerConstruct['roomId']).to.not.be.eql(undefined);
    });

    it('should not have a roomId if roomSize is empty', () => {
        stubRoomSize.returns(emptyRoomSize);
        const timerConstruct = new Timer(roomId, commonTimer);

        expect(timerConstruct['socketManager']).to.be.eql(stubs.socketManager);

        expect(timerConstruct['roomId']).to.be.eql(undefined);
        assert.called(stubRoomSize);
    });

    it('should call emitTime every seconde', async () => {
        const clock = useFakeTimers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Méthode privée
        const emitSmit = spy(timer, 'emitTime' as any);

        timer.start();
        clock.tick(ONE_SECOND);
        assert.called(emitSmit);
        clock.restore();
    });

    it('should do nothing if no roomid', async () => {
        const clock = useFakeTimers();

        timer['roomId'] = undefined as unknown as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Méthode privée
        const emitSmit = spy(timer, 'emitTime' as any);

        timer.start();
        clock.tick(ONE_SECOND);
        assert.notCalled(emitSmit);
        clock.restore();
    });

    it('should clear timer when it reaches 0', async () => {
        const clock = useFakeTimers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Méthode privée
        const emitSmit = spy(timer, 'emitTime' as any);
        const expectedCount = 2 * nSeconds + 2;

        timer.start();
        clock.tick((nSeconds + nSeconds) * ONE_SECOND);
        assert.called(emitSmit);
        assert.callCount(emitSmit, expectedCount);
        clock.restore();
    });

    it('should stop the clock', () => {
        const clock = useFakeTimers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Méthode privée
        const emitSmit = spy(timer, 'emitTime' as any);
        const expectedCount = 2 * nSeconds + 2;

        timer.start();
        clock.tick(nSeconds * ONE_SECOND);
        timer.stop();
        clock.tick(nSeconds * ONE_SECOND);
        assert.callCount(emitSmit, expectedCount);
        clock.restore();
    });

    it('setEndTimer should set the function', () => {
        const fakeFunction = (): BooleanConstructor => Boolean;

        timer.setEndTimer(fakeFunction);

        expect(timer['endTime']).to.be.eql(fakeFunction);
    });

    it('remainingTime should return the time remaining', () => {
        const expected = 1000;
        const max = ONE_SECOND * 2;

        timer['startTime'] = 0;
        timer['max'] = max;

        stub(Date, 'now').returns(expected);

        expect(timer.remainingTime()).to.be.eql(expected);
    });

    it('endTime should not be executed if null', () => {
        const clock = useFakeTimers();
        const newTimer = new Timer(roomId, commonTimer);
        const stopSpy = spy(newTimer, 'stop');

        newTimer.start();
        clock.tick(nSeconds * ONE_SECOND);

        assert.calledOnce(stopSpy);
        expect(newTimer['endTime']).to.be.eql(null);
        clock.restore();
    });
});
