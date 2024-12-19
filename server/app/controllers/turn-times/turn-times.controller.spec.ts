import { Application } from '@app/app';
import { ERROR } from '@app/constants/error/controller';
import { TURN_TIMES } from '@app/constants/turn-times';
import { TurnTimesService } from '@app/services/turn-times/turn-times.service';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, restore, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('TurnTimesController', () => {
    let turnTimesService: SinonStubbedInstance<TurnTimesService>;
    let expressApp: Express.Application;
    const url = '/api/turnTimes';

    beforeEach(() => {
        restore();

        turnTimesService = createStubInstance(TurnTimesService);
        const app = Container.get(Application);

        // eslint-disable-next-line dot-notation -- Propriété privée
        Object.defineProperty(app['turnTimesController'], 'turnTimesService', { value: turnTimesService, writable: true });
        expressApp = app.app;
    });

    afterEach(() => restore());

    it('should return an error as a message on service fail', async () => {
        turnTimesService.getTurnTimes.callsFake(async () => Promise.reject());
        return supertest(expressApp)
            .get(url)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body.title).to.equal(ERROR);
            });
    });

    it('should return timers on get request', async () => {
        turnTimesService.getTurnTimes.callsFake(async () => Promise.resolve(TURN_TIMES));
        return supertest(expressApp)
            .get(url)
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(TURN_TIMES);
            });
    });
});
