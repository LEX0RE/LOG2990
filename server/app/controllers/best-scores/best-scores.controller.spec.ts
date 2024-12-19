import { Application } from '@app/app';
import { FAILED_DELETE_BEST_SCORES, FAILED_GET_BEST_SCORES } from '@app/constants/error/error-messages';
import { BestScoreService } from '@app/services/best-score/best-score.service';
import { CLASSIC, LOG2990 } from '@common/constants/game-modes';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { beforeEach } from 'mocha';
import { createStubInstance, restore, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('BestScoreController', () => {
    let bestScoreService: SinonStubbedInstance<BestScoreService>;
    let expressApp: Express.Application;
    const url = '/api/bestScores/';

    beforeEach((done: Mocha.Done) => {
        restore();

        bestScoreService = createStubInstance(BestScoreService);
        const app = Container.get(Application);

        // eslint-disable-next-line dot-notation -- Propriété privée
        Object.defineProperty(app['bestScoresController'], 'bestScoreService', { value: bestScoreService, writable: true });
        expressApp = app.app;
        done();
    });

    afterEach(() => restore());

    it('should return all bestScores on get request', async () => {
        const player = {
            score: 10,
            playerName: ['Bob'],
        };
        const expected = [player];

        bestScoreService.getAllBestScore.resolves(expected);
        return supertest(expressApp)
            .get(url + CLASSIC)
            .expect(StatusCodes.OK)
            .then((response) => chai.expect(response.body).to.deep.equal(expected));
    });

    it('get request should have status code internal server error if getAllBestScore is rejected', async () => {
        bestScoreService.getAllBestScore.rejects();
        return supertest(expressApp)
            .get(url + LOG2990)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => chai.expect(response.text).to.deep.equal(FAILED_GET_BEST_SCORES));
    });

    it('delete request should have status code no content', async () => {
        bestScoreService.deleteAllBestScores.resolves();
        return supertest(expressApp).delete(url).expect(StatusCodes.NO_CONTENT);
    });

    it('delete request should return internal server error status code if deleteAllBestScores is rejected ', async () => {
        bestScoreService.deleteAllBestScores.rejects();
        return supertest(expressApp)
            .delete(url)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => chai.expect(response.text).to.deep.equal(FAILED_DELETE_BEST_SCORES));
    });
});
