import { Application } from '@app/app';
import { FAILED_DELETE_HISTORY, FAILED_GET_HISTORY } from '@app/constants/error/error-messages';
import { GameHistory } from '@app/services/game-history/game-history.service';
import { FAKE_GAME_HISTORY } from '@app/test/constants/fake-game-history';
import { GameInfoHistory } from '@common/interfaces/game-information';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { beforeEach } from 'mocha';
import { createStubInstance, restore, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('GameHistoryController', () => {
    let gameHistoryService: SinonStubbedInstance<GameHistory>;
    let expressApp: Express.Application;
    const fakeGameInfo: GameInfoHistory = FAKE_GAME_HISTORY;
    const url = '/api/gameHistory';

    beforeEach((done: Mocha.Done) => {
        restore();

        gameHistoryService = createStubInstance(GameHistory);
        const app = Container.get(Application);

        // eslint-disable-next-line dot-notation -- Membre privé
        Object.defineProperty(app['gameHistoryController'], 'gameHistoryService', { value: gameHistoryService, writable: true });
        expressApp = app.app;
        done();
    });

    afterEach(() => restore());

    it('should return a message on service fail for GET', async () => {
        gameHistoryService.getHistory.rejects();
        return supertest(expressApp)
            .get(url)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => chai.expect(response.text).to.deep.equal(FAILED_GET_HISTORY));
    });

    it('should return game History on get request', async () => {
        const expected = [{ ...fakeGameInfo, beginningDate: JSON.parse(JSON.stringify(fakeGameInfo.beginningDate)) }];

        gameHistoryService.getHistory.resolves([fakeGameInfo]);
        return supertest(expressApp)
            .get(url)
            .expect(StatusCodes.OK)
            .then((response) => chai.expect(response.body).to.deep.equal(expected));
    });

    it('should return a message on service fail for DELETE', async () => {
        gameHistoryService.deleteHistory.rejects();
        return supertest(expressApp)
            .delete(url)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => chai.expect(response.text).to.deep.equal(FAILED_DELETE_HISTORY));
    });

    it('should delete game History on delete request', async () => {
        gameHistoryService.deleteHistory.resolves();
        return supertest(expressApp).delete(url).expect(StatusCodes.NO_CONTENT);
    });
});
