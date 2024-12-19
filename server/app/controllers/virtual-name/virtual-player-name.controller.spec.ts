import { Application } from '@app/app';
import {
    FAILED_DELETE_NAME,
    FAILED_DELETE_NAMES,
    FAILED_GET_NAME,
    FAILED_GET_NAMES,
    FAILED_INSERT_NAME,
    FAILED_UPDATE_NAME,
} from '@app/constants/error/error-messages';
import { VirtualPlayerNameService } from '@app/services/virtual-player-name/virtual-player-name.service';
import { Difficulty } from '@common/enums/difficulty';
import { CommonVirtualPlayerName } from '@common/game-view-related/common-virtual-player-name';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { beforeEach } from 'mocha';
import { createStubInstance, restore, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('VirtualPlayerNameController', () => {
    let virtualPlayerNameService: SinonStubbedInstance<VirtualPlayerNameService>;
    let expressApp: Express.Application;
    let path: string;
    const player: CommonVirtualPlayerName = {
        playerName: 'Bob',
    };

    beforeEach((done: Mocha.Done) => {
        restore();

        virtualPlayerNameService = createStubInstance(VirtualPlayerNameService);
        const app = Container.get(Application);

        path = '/api/virtualPlayerName/' + Difficulty.Easy;

        // eslint-disable-next-line dot-notation -- Membre privé
        Object.defineProperty(app['virtualPlayerNameController'], 'virtualPlayerNameService', { value: virtualPlayerNameService, writable: true });
        expressApp = app.app;
        done();
    });

    afterEach(() => restore());

    it('should return a name on get request', async () => {
        path = path + '/' + player.playerName;

        virtualPlayerNameService.getName.resolves(player);
        return supertest(expressApp)
            .get(path)
            .expect(StatusCodes.OK)
            .then((response) => chai.expect(response.body).to.deep.equal(player));
    });

    it('get request should have status code not found if getName is rejected', async () => {
        path = path + '/' + 'bob';

        virtualPlayerNameService.getName.rejects();
        return supertest(expressApp)
            .get(path)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => chai.expect(response.text).to.deep.equal(FAILED_GET_NAME));
    });

    it('should return all names on get request', async () => {
        virtualPlayerNameService.getAllNames.resolves([player]);
        return supertest(expressApp)
            .get(path)
            .expect(StatusCodes.OK)
            .then((response) => chai.expect(response.body).to.deep.equal([player]));
    });

    it('get request should have status code not found if getAllName is rejected', async () => {
        virtualPlayerNameService.getAllNames.rejects();
        return supertest(expressApp)
            .get(path)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => chai.expect(response.text).to.deep.equal(FAILED_GET_NAMES));
    });

    it('post request should have status code created', async () => {
        virtualPlayerNameService.addName.resolves();
        return supertest(expressApp).post(path).expect(StatusCodes.CREATED);
    });

    it('post request should have status code not found if addName is rejected', async () => {
        virtualPlayerNameService.addName.rejects();
        return supertest(expressApp)
            .post(path)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => chai.expect(response.text).to.deep.equal(FAILED_INSERT_NAME));
    });

    it('patch request should have status code ok', async () => {
        virtualPlayerNameService.modifyName.resolves();
        return supertest(expressApp).patch(path).expect(StatusCodes.OK);
    });

    it('patch request should have status code not found if modifyName is rejected', async () => {
        virtualPlayerNameService.modifyName.rejects();
        return supertest(expressApp)
            .patch(path)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => chai.expect(response.text).to.deep.equal(FAILED_UPDATE_NAME));
    });

    it('delete request should have status code no content', async () => {
        path = '/api/virtualPlayerName/';

        virtualPlayerNameService.deleteAll.resolves();
        return supertest(expressApp).delete(path).expect(StatusCodes.NO_CONTENT);
    });

    it('delete request should have status code not found if deleteAll is rejected', async () => {
        path = '/api/virtualPlayerName/';

        virtualPlayerNameService.deleteAll.rejects();
        return supertest(expressApp)
            .delete(path)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => chai.expect(response.text).to.deep.equal(FAILED_DELETE_NAMES));
    });

    it('delete request for a name should have status code no content', async () => {
        path = path + '/' + 'bob';

        virtualPlayerNameService.deleteName.resolves();
        return supertest(expressApp).delete(path).expect(StatusCodes.NO_CONTENT);
    });

    it('delete request for a name should have status code not found if deleteName is rejected', async () => {
        path = path + '/' + 'bob';

        virtualPlayerNameService.deleteName.rejects();
        return supertest(expressApp)
            .delete(path)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => chai.expect(response.text).to.deep.equal(FAILED_DELETE_NAME));
    });
});
