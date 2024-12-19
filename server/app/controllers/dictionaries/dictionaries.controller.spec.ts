import { Application } from '@app/app';
import { ERROR } from '@app/constants/error/controller';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { FAKE_CLIENT_DICTIONARY, FAKE_DICTIONARY_WITH_WORDS } from '@app/test/constants/fake-dictionary';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { beforeEach } from 'mocha';
import { createStubInstance, restore, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('DictionaryController', () => {
    let dictionaryService: SinonStubbedInstance<DictionaryService>;
    let expressApp: Express.Application;
    const url = '/api/dictionaries/';
    const title = 'Français';

    beforeEach((done: Mocha.Done) => {
        restore();

        dictionaryService = createStubInstance(DictionaryService);
        const app = Container.get(Application);

        // eslint-disable-next-line dot-notation -- Propriété privée
        Object.defineProperty(app['dictionariesController'], 'dictionariesService', { value: dictionaryService });
        expressApp = app.app;
        done();
    });

    afterEach(() => restore());

    it('should return an error as a message on service fail', async () => {
        dictionaryService.getDictionaries.rejects();
        return supertest(expressApp)
            .get(url)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body.title).to.equal(ERROR);
            });
    });

    it('should return dictionaries on get request', async () => {
        const expected = FAKE_CLIENT_DICTIONARY();

        dictionaryService.getDictionaries.resolves([expected]);
        return supertest(expressApp)
            .get(url)
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal([expected]);
            });
    });

    it('get request should have status code not found if getDictionaryDownload throw an error', async () => {
        const path = url + title;

        dictionaryService.getDictionaryDownload.callsFake(async () => Promise.reject(new Error()));
        return supertest(expressApp).get(path).expect(StatusCodes.NOT_FOUND);
    });

    it('should return a dictionary on get request', async () => {
        const path = url + title;
        const expected = FAKE_DICTIONARY_WITH_WORDS();

        dictionaryService.getDictionaryDownload.resolves(expected);
        return supertest(expressApp)
            .get(path)
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(expected);
            });
    });

    it('post request should have status code created', async () => {
        dictionaryService.uploadDictionary.resolves();
        return supertest(expressApp).post(url).expect(StatusCodes.CREATED);
    });

    it('post request should have status code not found if uploadDictionary throw an error', async () => {
        dictionaryService.uploadDictionary.rejects(new Error());
        return supertest(expressApp).post(url).expect(StatusCodes.NOT_FOUND);
    });

    it('patch request should have status code ok', async () => {
        const path = url + title;

        dictionaryService.modifyDictionary.resolves();
        return supertest(expressApp).patch(path).expect(StatusCodes.OK);
    });

    it('patch request should have status code not found if modifyDictionary throw an error', async () => {
        const path = url + title;

        dictionaryService.modifyDictionary.rejects(new Error());
        return supertest(expressApp).patch(path).expect(StatusCodes.NOT_FOUND);
    });

    it('delete request for a name should have status code no content', async () => {
        const path = url + '0';

        dictionaryService.deleteDictionary.resolves();
        return supertest(expressApp).delete(path).expect(StatusCodes.NO_CONTENT);
    });

    it('delete request for a name should have status code not found if deleteDictionary throw an error', async () => {
        const path = url + '0';

        dictionaryService.deleteDictionary.rejects(new Error());
        return supertest(expressApp).delete(path).expect(StatusCodes.NOT_FOUND);
    });

    it('delete request for a name should have status code no content', async () => {
        dictionaryService.deleteAll.resolves();
        return supertest(expressApp).delete(url).expect(StatusCodes.NO_CONTENT);
    });

    it('delete request for a name should have status code not found if deleteAll throw an error', async () => {
        dictionaryService.deleteAll.rejects(new Error());
        return supertest(expressApp).delete(url).expect(StatusCodes.NOT_FOUND);
    });
});
