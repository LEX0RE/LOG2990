/* eslint-disable dot-notation -- Méthode privée */
import { HttpException } from '@app/classes/httpException/http.exception';
import { DATABASE_COLLECTION_CLASSIC, DATABASE_COLLECTION_LOG } from '@app/constants/database';
import { BestScore } from '@app/interface/best-score';
import { BestScoreService } from '@app/services/best-score/best-score.service';
import { DatabaseService } from '@app/services/database/database.service';
import { FAKE_SOCKET_ID_PLAYER_1, FAKE_SOCKET_ID_PLAYER_2 } from '@app/test/constants/fake-player';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { DatabaseServiceMock } from '@app/test/services-stubs/database.service-mock';
import { CLASSIC, LOG2990 } from '@common/constants/game-modes';
import { CommonBestScore } from '@common/interfaces/game-view-related/common-best-score';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { assert, restore, stub } from 'sinon';

describe('BestScoreService', () => {
    let bestScoreService: BestScoreService;
    let databaseService: DatabaseServiceMock;
    const stubs = new ServiceStubHelper();
    const testCommonBestScore: CommonBestScore = {
        score: 5,
        playerName: ['John Doe'],
    };
    let secondTestCommonBestScore: CommonBestScore;
    const testBestScore: BestScore = { ...testCommonBestScore, playerId: FAKE_SOCKET_ID_PLAYER_1 };
    let secondTestBestScore: BestScore;

    before(async () => {
        chai.use(chaiAsPromised);
        databaseService = new DatabaseServiceMock();
    });

    beforeEach(async () => {
        stubs.stubAllService();
        await databaseService.start();
        bestScoreService = new BestScoreService();
        bestScoreService['databaseService'] = databaseService as unknown as DatabaseService;
        bestScoreService['databaseCollection'] = DATABASE_COLLECTION_LOG;
        await bestScoreService.collection.insertOne(testCommonBestScore);
        bestScoreService['databaseCollection'] = DATABASE_COLLECTION_CLASSIC;
        await bestScoreService.collection.insertOne(testCommonBestScore);

        secondTestCommonBestScore = {
            score: 1,
            playerName: ['Ron'],
        };
        secondTestBestScore = { ...secondTestCommonBestScore, playerId: FAKE_SOCKET_ID_PLAYER_2 };
    });

    afterEach(() => {
        restore();
        if (!databaseService.isConnected) return;
        databaseService.database.dropCollection(DATABASE_COLLECTION_LOG);
        databaseService.database.dropCollection(DATABASE_COLLECTION_CLASSIC);
    });

    after(async () => {
        await databaseService.closeConnection();
        databaseService.mongoServer.stop();
    });

    it('should get all bestScores from DB classic mode', async () => {
        const bestScores = await bestScoreService.getAllBestScore(CLASSIC);
        const expectedLength = 1;

        expect(bestScores.length).to.equal(expectedLength);
        expect(testCommonBestScore).to.deep.equals(bestScores[0]);
    });

    it('should get all bestScores from DB mode log2990', async () => {
        const bestScores = await bestScoreService.getAllBestScore(LOG2990);
        const expectedLength = 1;

        expect(bestScores.length).to.equal(expectedLength);
        expect(testCommonBestScore).to.deep.equals(bestScores[0]);
    });

    it('should get all bestScores from DB sorted decrescent', async () => {
        const expected = 2;

        await bestScoreService.collection.insertOne(secondTestCommonBestScore);
        const bestScores = await bestScoreService.getAllBestScore(CLASSIC);

        expect(bestScores.length).to.equal(expected);
        expect(testCommonBestScore).to.deep.equals(bestScores[0]);
        expect(secondTestCommonBestScore).to.deep.equals(bestScores[1]);
    });

    it('addScore should add playerName of new score to list of names of bestScore if scores are equals mode classique', async () => {
        secondTestBestScore.score = 5;
        const expected: string[] = ['John Doe', 'Ron'];
        const expectedLength = 1;

        await bestScoreService.addScore(secondTestBestScore, CLASSIC);
        const bestScores = await bestScoreService.collection.find({}).toArray();

        expect(bestScores.length).to.equal(expectedLength);
        expect(bestScores[0].playerName).to.eql(expected);
    });

    it('addScore should add playerName of new score to list of names of bestScore if scores are equals mode log2990', async () => {
        secondTestBestScore.score = 5;
        const expected = ['John Doe', 'Ron'];
        const expectedLength = 1;

        await bestScoreService.addScore(secondTestBestScore, LOG2990);
        const bestScores = await bestScoreService.collection.find({}).toArray();

        expect(bestScores.length).to.equal(expectedLength);
        expect(bestScores[0].playerName).to.eql(expected);
    });

    it('addScore should not add playerName of new score to list of names of bestScore if scores are equals, but names are equals', async () => {
        const otherTestBestScore: BestScore = {
            score: 5,
            playerName: ['John Doe'],
            playerId: FAKE_SOCKET_ID_PLAYER_1,
        };
        const expectedLength = 1;

        await bestScoreService.addScore(otherTestBestScore, CLASSIC);
        const bestScores = await bestScoreService.collection.find({}).toArray();

        expect(bestScores.length).to.equal(expectedLength);
        expect(bestScores[0]).to.deep.equals(testCommonBestScore);
        expect(bestScores[0]).to.not.deep.equals(otherTestBestScore);
    });

    it('addScore should called add the new score if new score is greater than one of the bestScores', async () => {
        secondTestBestScore.score = 10;
        secondTestCommonBestScore.score = 10;
        const thirdTestBestScore: CommonBestScore = {
            score: 1,
            playerName: ['Bob'],
        };
        const expectedBestScoresLength = 2;
        const expectedLength = 0;

        await bestScoreService.collection.insertOne(thirdTestBestScore);
        await bestScoreService.addScore(secondTestBestScore, CLASSIC);
        const bestScores = await bestScoreService.collection.find({}).toArray();
        const erasedScore = await bestScoreService.collection.find({ score: { $eq: thirdTestBestScore.score } }).toArray();

        expect(bestScores.length).to.equal(expectedBestScoresLength);
        expect(bestScores.find((x) => x.score === secondTestCommonBestScore.score)).to.deep.include(secondTestCommonBestScore);
        expect(erasedScore.length).to.equal(expectedLength);
    });

    it('should get specific bestScore with valid score', async () => {
        const course = await bestScoreService['getBestScore'](testCommonBestScore.score);

        expect(course).to.deep.equals(testCommonBestScore);
    });

    it('should get null with an invalid score', async () => {
        const course = await bestScoreService['getBestScore'](0);

        expect(course).to.deep.equals(null);
    });

    it('addNewScore should insert a new score if bigger than score in db and delete lowest one', async () => {
        secondTestBestScore.score = 10;
        secondTestCommonBestScore.score = 10;
        const thirdTestBestScore: CommonBestScore = {
            score: 1,
            playerName: ['Bob'],
        };
        const expectedBestScoresLength = 2;
        const expectedLength = 0;

        await bestScoreService.collection.insertOne(thirdTestBestScore);
        await bestScoreService['addNewScore'](secondTestBestScore);
        const bestScores = await bestScoreService.collection.find({}).toArray();
        const erasedScore = await bestScoreService.collection.find({ score: { $eq: thirdTestBestScore.score } }).toArray();

        expect(bestScores.length).to.equal(expectedBestScoresLength);
        expect(bestScores.find((x) => x.score === secondTestCommonBestScore.score)).to.deep.include(secondTestCommonBestScore);
        expect(erasedScore.length).to.equal(expectedLength);
    });

    it('addNewScore should not insert a new score if lower than score in db', async () => {
        const expectedBestScoresLength = 1;
        const expectedLength = 0;

        await bestScoreService['addNewScore'](secondTestBestScore);
        const bestScores = await bestScoreService.collection.find({}).toArray();
        const scoreNotAdded = await bestScoreService.collection.find({ score: { $eq: secondTestCommonBestScore.score } }).toArray();

        expect(bestScores.length).to.equal(expectedBestScoresLength);
        expect(bestScores.find((x) => x.score === testCommonBestScore.score)).to.deep.equals(testCommonBestScore);
        expect(scoreNotAdded.length).to.equal(expectedLength);
    });

    it('getLowestScore should return all the scores lower than the new score sorted', async () => {
        secondTestCommonBestScore.score = 10;
        const thirdTestBestScore: CommonBestScore = {
            score: 3,
            playerName: ['Bob'],
        };

        await bestScoreService.collection.insertOne(thirdTestBestScore);
        const lowestScores = await bestScoreService['getLowestScore'](secondTestCommonBestScore);
        const expectedLength = 2;

        expect(lowestScores.length).to.equal(expectedLength);
        expect(lowestScores[0]).to.deep.equals(thirdTestBestScore);
        expect(lowestScores[1]).to.deep.equals(testCommonBestScore);
    });

    it('getLowestScore should return empty array if the new score is lower than all the BestScores', async () => {
        const lowestScores = await bestScoreService['getLowestScore'](secondTestCommonBestScore);
        const expectedLength = 0;

        expect(lowestScores.length).to.equal(expectedLength);
    });

    it('getLowestScore should return empty array if the new score is equal to lowest BestScores', async () => {
        secondTestCommonBestScore.score = 5;
        const lowestScores = await bestScoreService['getLowestScore'](secondTestCommonBestScore);
        const expectedLength = 0;

        expect(lowestScores.length).to.equal(expectedLength);
    });

    it('should add the new player with same score to list of players of existing score', async () => {
        const modifiedBestScore: BestScore = {
            score: 5,
            playerName: ['John Doe', 'Bob'],
            playerId: FAKE_SOCKET_ID_PLAYER_1,
        };

        await bestScoreService['addPlayer'](modifiedBestScore);
        const bestScores = await bestScoreService.collection.find({}).toArray();
        const expectedLength = 1;

        expect(bestScores.length).to.equal(expectedLength);
        expect(bestScores.find((x) => x.score === testCommonBestScore.score)?.playerName).to.deep.equals(modifiedBestScore.playerName);
    });

    it('addPlayer should throw error if update failed', async () => {
        stub(bestScoreService.collection, 'updateOne').throws();
        secondTestBestScore.score = 15;

        return bestScoreService['addPlayer'](secondTestBestScore).catch((error: HttpException) =>
            expect(error.message).to.eql('Failed to update document'),
        );
    });

    it('should delete an existing bestScore data if a valid score is sent', async () => {
        await bestScoreService['deleteScore'](testCommonBestScore.score);
        const bestScores = await bestScoreService.collection.find({}).toArray();
        const expectedLength = 0;

        expect(bestScores.length).to.equal(expectedLength);
    });

    it('should not delete a bestScore if it has an invalid score ', async () => {
        await bestScoreService['deleteScore'](0);
        const bestScores = await bestScoreService.collection.find({}).toArray();
        const expectedLength = 1;

        expect(bestScores.length).to.equal(expectedLength);
    });

    it('should throw an error on a closed connection', async () => {
        await databaseService.closeConnection();
        expect(bestScoreService.getAllBestScore(CLASSIC)).to.eventually.be.rejectedWith();

        await databaseService.closeConnection();
        expect(bestScoreService.addScore(testBestScore, CLASSIC)).to.eventually.be.rejectedWith();

        await databaseService.closeConnection();
        expect(bestScoreService['getBestScore'](testCommonBestScore.score)).to.eventually.be.rejectedWith();

        await databaseService.closeConnection();
        expect(bestScoreService['getLowestScore'](testCommonBestScore)).to.eventually.be.rejectedWith();

        await databaseService.closeConnection();
        expect(bestScoreService['deleteScore'](testCommonBestScore.score)).to.eventually.be.rejectedWith();

        await databaseService.closeConnection();
        expect(bestScoreService['addPlayer'](testBestScore)).to.eventually.be.rejectedWith();
    });

    it('addPlayer should call sendPrivate if insert goes wrong', async () => {
        const updateOneSpy = stub().rejects();

        Object.defineProperty(bestScoreService, 'collection', { value: { updateOne: updateOneSpy } });
        expect(bestScoreService['addPlayer'](testBestScore)).to.eventually.rejectedWith();
        assert.called(updateOneSpy);
    });

    it('addNewScore should call sendPrivate if insert goes wrong', async () => {
        Object.defineProperty(bestScoreService, 'collection', { value: { insertOne: stub().rejects() } });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Méthode privée
        stub(bestScoreService, 'getLowestScore' as any).resolves([3]);
        expect(bestScoreService['addNewScore'](testBestScore)).to.eventually.rejectedWith();
    });

    it('deleteAllBestScores should call deleteBestScoresByGameMode twice with different parameters', async () => {
        const deleteBestScoresByGameModeStub = stub(bestScoreService, 'deleteBestScoresByGameMode').resolves();

        await bestScoreService.deleteAllBestScores();
        assert.calledTwice(deleteBestScoresByGameModeStub);
        assert.calledWith(deleteBestScoresByGameModeStub, CLASSIC);
        assert.calledWith(deleteBestScoresByGameModeStub, LOG2990);
    });

    it('deleteBestScoresByGameMode should delete all best scores of passed game mode', async () => {
        await bestScoreService['deleteBestScoresByGameMode'](CLASSIC);

        const bestScores = await bestScoreService.getAllBestScore(CLASSIC);
        const expectedLength = 0;

        expect(bestScores.length).to.equal(expectedLength);
    });

    it('deleteBestScoresByGameMode should get rejected if delete goes wrong', async () => {
        const deleteManySpy = stub().rejects();

        Object.defineProperty(bestScoreService, 'collection', { value: { deleteMany: deleteManySpy } });
        expect(bestScoreService['deleteBestScoresByGameMode'](CLASSIC)).to.eventually.rejectedWith();
        assert.called(deleteManySpy);
    });

    it('deleteAllBestScores should get rejected if delete goes wrong', async () => {
        const deleteManySpy = stub().rejects();

        Object.defineProperty(bestScoreService, 'collection', { value: { deleteMany: deleteManySpy } });
        expect(bestScoreService['deleteAllBestScores']()).to.eventually.not.rejectedWith();
        assert.called(deleteManySpy);
    });
});
