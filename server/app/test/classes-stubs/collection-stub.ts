import { DeleteResult, Filter, InsertOneResult, UpdateFilter, UpdateResult } from 'mongodb';

export class CollectionStub<T> {
    save: T[];

    constructor() {
        this.save = [];
    }

    // eslint-disable-next-line no-unused-vars -- Pour mocker MongoDB
    find(queryFilter: Filter<T>): CollectionStub<T> {
        return this;
    }

    // eslint-disable-next-line no-unused-vars -- Pour mocker MongoDB
    sort(sortFilter: Filter<T>): CollectionStub<T> {
        return this;
    }

    toArray(): CollectionStub<T> {
        return this;
    }

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any -- Pour mocker les paramètres
    then(any: any): T[] {
        any();
        return this.save;
    }

    async insertOne(object: T): Promise<InsertOneResult<T>> {
        return this.save.push(object) as unknown as InsertOneResult<T>;
    }

    async updateOne(filter: Filter<T>, update: UpdateFilter<T>): Promise<UpdateResult> {
        const index = this.save.findIndex((name) => name[0] === filter[0]);

        this.save[index] = update.$set as unknown as T;
        return index as unknown as UpdateResult;
    }

    async deleteOne(filter: Filter<T>): Promise<DeleteResult> {
        this.save.splice(
            this.save.findIndex((name) => name[0] === filter[0]),
            1,
        );
        return this.save as unknown as DeleteResult;
    }

    async deleteMany(): Promise<DeleteResult> {
        this.save = [];
        return this.save as unknown as DeleteResult;
    }
}
