import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BEST_SCORES, GET_DICTIONARY, GET_NAME, GET_TURN_TIMES, HISTORY_URL } from '@app/constants/http-request-manager';
import { Dictionary, DictionaryWithWords } from '@app/interface/dictionary';
import { CommonVirtualPlayerName } from '@common/game-view-related/common-virtual-player-name';
import { GameInfoHistory } from '@common/interfaces/game-information';
import { CommonBestScore } from '@common/interfaces/game-view-related/common-best-score';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HttpRequestManagerService {
    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    getDictionaries(): Observable<Dictionary[]> {
        return this.http.get<Dictionary[]>(GET_DICTIONARY);
    }

    getTurnTimes(): Observable<CommonTimer[]> {
        return this.http.get<CommonTimer[]>(GET_TURN_TIMES);
    }

    getBestScores(gameMode: string): Observable<CommonBestScore[]> {
        return this.http.get<CommonBestScore[]>(BEST_SCORES + gameMode);
    }

    deleteBestScores(): Observable<void> {
        return this.http.delete<void>(BEST_SCORES);
    }

    getName(difficulty: string, name: string): Observable<CommonVirtualPlayerName> {
        return this.http.get<CommonVirtualPlayerName>(GET_NAME + difficulty + '/' + name);
    }

    getAllNames(difficulty: string): Observable<CommonVirtualPlayerName[]> {
        return this.http.get<CommonVirtualPlayerName[]>(GET_NAME + difficulty);
    }

    addName(difficulty: string, name: CommonVirtualPlayerName): Observable<void> {
        return this.http.post<void>(GET_NAME + difficulty, name);
    }

    modifyName(difficulty: string, oldName: string, newName: string): Observable<void> {
        return this.http.patch<void>(GET_NAME + difficulty, {
            old: oldName,
            new: newName,
        });
    }

    deleteName(difficulty: string, name: string): Observable<void> {
        return this.http.delete<void>(GET_NAME + difficulty + '/' + name);
    }

    deleteAllNames(): Observable<void> {
        return this.http.delete<void>(GET_NAME);
    }

    getHistory(): Observable<GameInfoHistory[]> {
        return this.http.get<GameInfoHistory[]>(HISTORY_URL);
    }

    deleteHistory(): Observable<GameInfoHistory[]> {
        return this.http.delete<GameInfoHistory[]>(HISTORY_URL);
    }

    addDictionary(file: DictionaryWithWords): Observable<void> {
        return this.http.post<void>(GET_DICTIONARY, file);
    }

    modifyDictionary(dictionary: Dictionary, oldTitle: string): Observable<void> {
        return this.http.patch<void>(GET_DICTIONARY + oldTitle, dictionary);
    }

    deleteDictionary(dictionaryId: number): Observable<void> {
        return this.http.delete<void>(GET_DICTIONARY + dictionaryId);
    }

    deleteAllDictionary(): Observable<void> {
        return this.http.delete<void>(GET_DICTIONARY);
    }

    getDictionary(title: string): Observable<DictionaryWithWords> {
        return this.http.get<DictionaryWithWords>(GET_DICTIONARY + title);
    }
}
