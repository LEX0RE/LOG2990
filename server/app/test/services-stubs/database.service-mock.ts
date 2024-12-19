import { DATABASE_NAME } from '@app/constants/database';
import { doNothing } from '@app/test/do-nothing-function';
import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

export class DatabaseServiceMock {
    mongoServer!: MongoMemoryServer;
    isConnected: boolean;
    _database!: Db;
    client!: MongoClient;

    constructor() {
        this.isConnected = false;
    }

    async start(): Promise<MongoClient | null> {
        if (this.isConnected) return this.client;
        this.mongoServer = await MongoMemoryServer.create();
        const mongoUri = this.mongoServer.getUri();

        this.client = await MongoClient.connect(mongoUri);
        // eslint-disable-next-line no-underscore-dangle -- Pour assigner une valeur à la propriété _database
        this._database = this.client.db(DATABASE_NAME);
        this.isConnected = true;
        return this.client;
    }

    async closeConnection(): Promise<void> {
        this.isConnected = false;
        return this.client.close();
    }

    // eslint-disable-next-line no-unused-vars -- On ne fait rien dans cette méthode du mock
    async verifyPopulateDB(_collection: string): Promise<void> {
        doNothing();
    }

    get database(): Db {
        // eslint-disable-next-line no-underscore-dangle -- Pour retourner la propriété _database
        return this._database;
    }
}
