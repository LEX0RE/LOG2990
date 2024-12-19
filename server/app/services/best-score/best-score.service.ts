import { DATABASE_COLLECTION_CLASSIC, DATABASE_COLLECTION_LOG } from '@app/constants/database';
import { BestScore } from '@app/interface/best-score';
import { ErrorHandlerBestScoreService } from '@app/services/best-score/error-handler/error-handler-best-score';
import { DatabaseService } from '@app/services/database/database.service';
import { CLASSIC, LOG2990 } from '@common/constants/game-modes';
import { CommonBestScore } from '@common/interfaces/game-view-related/common-best-score';
import { Collection, Filter, Sort, WithId } from 'mongodb';
import 'reflect-metadata';
import { Container, Service } from 'typedi';

@Service()
export class BestScoreService {
    private databaseService: DatabaseService;
    private databaseCollection: string;

    constructor() {
        this.databaseService = Container.get(DatabaseService);
        this.databaseCollection = DATABASE_COLLECTION_CLASSIC;
    }

    get collection(): Collection<CommonBestScore> {
        return this.databaseService.database.collection(this.databaseCollection);
    }

    async getAllBestScore(gameMode: string): Promise<CommonBestScore[]> {
        this.modeToCollection(gameMode);
        return this.makeFindQuery({}, { score: -1 });
    }

    async addScore(bestScore: BestScore, gameMode: string): Promise<void> {
        this.modeToCollection(gameMode);
        const score = await this.getBestScore(bestScore.score);

        if (score) {
            if (!score.playerName.find((name) => name === bestScore.playerName[0])) {
                score.playerName.push(bestScore.playerName[0]);
                await this.addPlayer({ ...score, playerId: bestScore.playerId });
            }
        } else await this.addNewScore(bestScore);
    }

    async deleteAllBestScores(): Promise<void> {
        await this.deleteBestScoresByGameMode(CLASSIC);
        await this.deleteBestScoresByGameMode(LOG2990);
    }

    async deleteBestScoresByGameMode(gameMode: string): Promise<void> {
        this.modeToCollection(gameMode);
        await this.collection.deleteMany({});
        await this.databaseService.verifyPopulateDB(this.databaseCollection);
    }

    private async addNewScore(bestScore: BestScore): Promise<void> {
        const lowerScores = await this.getLowestScore(bestScore);
        const { playerId, ...commonBestScore } = bestScore;

        if (lowerScores.length) {
            await this.collection.insertOne(commonBestScore).catch(() => {
                const errorHandler = Container.get(ErrorHandlerBestScoreService);

                errorHandler.sendErrorMessage(playerId);
            });
            await this.deleteScore(lowerScores[0].score);
        }
        return Promise.resolve();
    }

    private modeToCollection(gameMode: string): void {
        this.databaseCollection = gameMode === CLASSIC ? DATABASE_COLLECTION_CLASSIC : DATABASE_COLLECTION_LOG;
    }

    private async getBestScore(scorePlayer: number): Promise<CommonBestScore | null> {
        return this.collection.findOne({ score: scorePlayer }).then((bestScore: WithId<CommonBestScore> | null) => bestScore);
    }

    private async getLowestScore(bestScore: CommonBestScore): Promise<CommonBestScore[]> {
        return this.makeFindQuery({ score: { $lt: bestScore.score } }, { score: 1 });
    }

    private async addPlayer(bestScore: BestScore): Promise<void> {
        return this.collection
            .updateOne({ score: bestScore.score }, { $set: { playerName: bestScore.playerName } })
            .then(async () => Promise.resolve())
            .catch(() => {
                const errorHandler = Container.get(ErrorHandlerBestScoreService);

                errorHandler.sendErrorMessage(bestScore.playerId);
            });
    }

    private async deleteScore(scoreDelete: number): Promise<void> {
        await this.collection.findOneAndDelete({ score: scoreDelete });
    }

    private async makeFindQuery(queryFilter: Filter<CommonBestScore>, sortFilter: Sort): Promise<CommonBestScore[]> {
        return this.collection
            .find(queryFilter)
            .sort(sortFilter)
            .toArray()
            .then((bestScore: CommonBestScore[]) => bestScore);
    }
}
