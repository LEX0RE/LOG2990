import { Game } from '@app/classes/game/game';
import { GameInfoFormattingService } from '@app/services/game-information-formatting/game-information-formatting';
import { stubGame } from '@app/test/classes-stubs/game-stub';
import { expect } from 'chai';
import { assert, restore, stub } from 'sinon';

describe('GameInfoFormattingService', () => {
    let gameInfoFormattingService: GameInfoFormattingService;
    let game: Game;
    const beginningDate = new Date('March 21, 2022 03:24:00');
    const endingDate = new Date('March 21, 2022 07:25:00');

    beforeEach(async () => {
        gameInfoFormattingService = new GameInfoFormattingService();
        game = stubGame();
    });

    afterEach(() => restore());

    it('formatGameInfoHistory should call getDate, getTime and getDuration', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub membre prive
        const spyDuration = stub(gameInfoFormattingService, 'getDuration' as any);

        gameInfoFormattingService.formatGameInfoHistory(game);
        assert.called(spyDuration);
    });

    it('formatGameInfoHistory should change isSurrendered if no player surrendered', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub membre prive
        stub(gameInfoFormattingService, 'getDuration' as any);
        const expected = false;

        game.watchTower.surrenderedPlayerId = '';
        const gameInfo = gameInfoFormattingService.formatGameInfoHistory(game);

        expect(gameInfo.isSurrendered).to.eql(expected);
    });

    it('formatGameInfoHistory should change isSurrendered if player surrenders', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub membre prive
        stub(gameInfoFormattingService, 'getDuration' as any);
        const expected = true;

        game.watchTower.surrenderedPlayerId = game.players[0].name;
        const gameInfo = gameInfoFormattingService.formatGameInfoHistory(game);

        expect(gameInfo.isSurrendered).to.eql(expected);
    });

    it('should return duration', async () => {
        // eslint-disable-next-line dot-notation -- Accès à une méthode privée
        const duration = gameInfoFormattingService['getDuration'](beginningDate, endingDate);
        const expected = 14460000;

        expect(duration).to.eql(expected);
    });

    it('should return 0 if beginning and end are the same', async () => {
        // eslint-disable-next-line dot-notation -- Accès à une méthode privée
        const duration = gameInfoFormattingService['getDuration'](beginningDate, beginningDate);
        const expected = 0;

        expect(duration).to.eql(expected);
    });
});
