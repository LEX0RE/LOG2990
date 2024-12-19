/* eslint-disable dot-notation -- Propriété/Méthode privée */
import { TestBed } from '@angular/core/testing';
import { GameNavigationService } from '@app/services/game-navigation/game-navigation.service';

describe('GameNavigationService', () => {
    let service: GameNavigationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameNavigationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('when initialized, gameMode value should be an empty string', () => {
        expect(service['gameMode']).toBe('');
    });

    it('setting the gameMode value to "classique" should change the gameMode value to "classique"', () => {
        service.setGameMode('classique');

        expect(service['gameMode']).toBe('classique');
    });

    it('setting the gameMode value to "ClasSiQuE" should change the gameMode value to "classique"', () => {
        service.setGameMode('ClasSiQuE');

        expect(service['gameMode']).toBe('classique');
    });

    it('setting the gameMode value to "LOG2990" should change the gameMode value to "log2990"', () => {
        service.setGameMode('LOG2990');

        expect(service['gameMode']).toBe('log2990');
    });

    it('setting the gameMode value to "classique" when it is already its value should let the gameMode value to "classique"', () => {
        service.setGameMode('classique');

        expect(service['gameMode']).toBe('classique');
        service.setGameMode('classique');

        expect(service['gameMode']).toBe('classique');
    });

    it('setting the gameMode value to something else than "classique" or "LOG2990" should not change the gameMode value', () => {
        service.setGameMode('feiuhkdgiya');

        expect(service['gameMode']).toBe('');
    });

    it('setting the gameMode value to an incorrect value when a correct value is already assigned to it should not change the gameMode value', () => {
        service['gameMode'] = 'classique';

        expect(service['gameMode']).toBe('classique');
        service.setGameMode('feiuhkdgiya');

        expect(service['gameMode']).toBe('classique');
    });

    it('hasValidgameMode should return true when gameMode value is "classique"', () => {
        service['gameMode'] = 'classique';
        expect(service.hasValidGameMode()).toBeTrue();
    });

    it('hasValidgameMode should return true when gameMode value is "log2990"', () => {
        service['gameMode'] = 'log2990';
        expect(service.hasValidGameMode()).toBeTrue();
    });

    it('hasValidgameMode should return false when gameMode value is not a valid gameMode', () => {
        service['gameMode'] = 'abcd';
        expect(service.hasValidGameMode()).toBeFalse();
    });
});
