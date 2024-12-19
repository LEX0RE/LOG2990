import { DATABASE_COLLECTION_HISTORY } from '@app/constants/database';
import { DatabaseService } from '@app/services/database/database.service';
import { GameInfoHistory } from '@common/interfaces/game-information';
import { Collection } from 'mongodb';
import 'reflect-metadata';
import { Container, Service } from 'typedi';

@Service()
export class GameHistory {
    private databaseService: DatabaseService;
    private databaseCollection: string;

    constructor() {
        this.databaseService = Container.get(DatabaseService);
        this.databaseCollection = DATABASE_COLLECTION_HISTORY;
    }

    get collection(): Collection<GameInfoHistory> {
        return this.databaseService.database.collection(this.databaseCollection);
    }

    async getHistory(): Promise<GameInfoHistory[]> {
        return this.collection
            .find({})
            .sort({ beginningDate: -1 })
            .toArray()
            .then((gameInfo: GameInfoHistory[]) => gameInfo);
    }

    async addGameToHistory(gameToAdd: GameInfoHistory): Promise<void> {
        await this.collection.insertOne(gameToAdd);
    }

    async deleteHistory(): Promise<void> {
        await this.collection.deleteMany({});
    }
}
