import { DatabaseService } from '@app/services/database/database.service';
import { GameHistory } from '@app/services/game-history/game-history.service';
import { DatabaseStub } from '@app/test/classes-stubs/database-stub';
import { FAKE_GAME_HISTORY } from '@app/test/constants/fake-game-history';
import { doNothing } from '@app/test/do-nothing-function';
import { GameInfoHistory } from '@common/interfaces/game-information';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { createStubInstance, restore, stub } from 'sinon';
import { Container, Token } from 'typedi';

describe('GameHistory', () => {
    let gameHistoryService: GameHistory;
    const fakeGameInfo: GameInfoHistory = FAKE_GAME_HISTORY;

    before(() => chai.use(chaiAsPromised));

    beforeEach(async () => {
        const getStub = stub(Container, 'get');
        const databaseService = createStubInstance(DatabaseService);
        const database = new DatabaseStub<GameInfoHistory>();

        stub(databaseService, 'database').get(() => database);
        getStub.withArgs(DatabaseService as Token<unknown>).returns(databaseService);

        gameHistoryService = new GameHistory();
        gameHistoryService.collection.insertOne(fakeGameInfo);
    });

    afterEach(() => restore());

    it('should get all game history', async () => {
        const expectedLength = 1;
        const games: GameInfoHistory[] = await gameHistoryService.getHistory();

        expect(games.length).to.eql(expectedLength);
        expect(games).to.deep.equal([fakeGameInfo]);
    });

    it('should get game history in order of date (insert earlier date)', async () => {
        const expectedLength = 2;
        const fakeGameInfo2: GameInfoHistory = FAKE_GAME_HISTORY;

        fakeGameInfo2.beginningDate = new Date('March 20, 2022 03:24:00');
        gameHistoryService.collection.insertOne(fakeGameInfo2);
        const games: GameInfoHistory[] = await gameHistoryService.getHistory();

        expect(games.length).to.eql(expectedLength);
        expect(games).to.deep.equal([fakeGameInfo, fakeGameInfo2]);
    });

    it('should get game history in order of date (insert later date)', async () => {
        const expectedLength = 2;
        const fakeGameInfo2: GameInfoHistory = FAKE_GAME_HISTORY;

        fakeGameInfo2.beginningDate = new Date('March 23, 2022 03:30:00');
        gameHistoryService.collection.insertOne(fakeGameInfo2);
        const games: GameInfoHistory[] = await gameHistoryService.getHistory();

        expect(games.length).to.eql(expectedLength);
        expect(games).to.deep.equal([fakeGameInfo2, fakeGameInfo]);
    });

    it('should get game history in order of date (same date)', async () => {
        const expectedLength = 2;

        gameHistoryService.collection.insertOne(fakeGameInfo);
        const games: GameInfoHistory[] = await gameHistoryService.getHistory();

        expect(games.length).to.eql(expectedLength);
        expect(games).to.deep.equal([fakeGameInfo, fakeGameInfo]);
    });

    it('should throw an error if we try to get all game history on a closed connection', async () => {
        // eslint-disable-next-line dot-notation -- Membre privé
        stub(gameHistoryService['databaseService'], 'database').get(doNothing());
        expect(gameHistoryService.getHistory()).to.eventually.be.rejectedWith();
    });

    it('should add a game to history', async () => {
        const fakeGameInfo2: GameInfoHistory = FAKE_GAME_HISTORY;

        fakeGameInfo2.player1.score = 45;

        await gameHistoryService.addGameToHistory(fakeGameInfo2);
        expect(
            gameHistoryService.collection
                .find({})
                .toArray()
                .then((gameInfo: GameInfoHistory[]) => gameInfo),
        ).to.eql([fakeGameInfo, fakeGameInfo2]);
    });

    it('should throw an error if we try to add a game history on a closed connection', async () => {
        // eslint-disable-next-line dot-notation -- Membre privé
        stub(gameHistoryService['databaseService'], 'database').get(doNothing());
        expect(gameHistoryService.addGameToHistory(FAKE_GAME_HISTORY)).to.eventually.be.rejectedWith();
    });

    it('should remove all game history', async () => {
        await gameHistoryService.deleteHistory();

        expect(
            gameHistoryService.collection
                .find({})
                .toArray()
                .then((gameInfo: GameInfoHistory[]) => gameInfo),
        ).to.eql([]);
    });

    it('should throw an error if we try to delete game history on a closed connection', async () => {
        // eslint-disable-next-line dot-notation -- Membre privé
        stub(gameHistoryService['databaseService'], 'database').get(doNothing());
        expect(gameHistoryService.deleteHistory()).to.eventually.be.rejectedWith();
    });
});
