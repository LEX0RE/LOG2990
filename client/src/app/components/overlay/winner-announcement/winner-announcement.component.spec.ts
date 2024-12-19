import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WinnerAnnouncementComponent } from '@app/components/overlay/winner-announcement/winner-announcement.component';
import { EndGameService } from '@app/services/end-game/end-game.service';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { mockEndGameService } from '@app/test/mocks/end-game-mock';
import { gameUpdaterStub } from '@app/test/mocks/stubs/game-updater-stub';
import { GamePossibility } from '@common/enums/game-possibility';

describe('WinnerAnnouncementComponent', () => {
    let component: WinnerAnnouncementComponent;
    let fixture: ComponentFixture<WinnerAnnouncementComponent>;
    let gameInfo: jasmine.SpyObj<GameUpdaterService>;
    let endGame: jasmine.SpyObj<EndGameService>;

    beforeEach(async () => {
        gameInfo = gameUpdaterStub();
        endGame = mockEndGameService();
        await TestBed.configureTestingModule({
            declarations: [WinnerAnnouncementComponent],
            providers: [
                { provide: GameUpdaterService, useValue: gameInfo },
                { provide: EndGameService, useValue: endGame },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WinnerAnnouncementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('winner should return playerInfo if decision is win', () => {
        Object.defineProperty(endGame, 'decision', { value: GamePossibility.Win });
        expect(component.winner).toEqual(gameInfo.playerInfo.name);
    });

    it('winner should return otherPlayerInfo if decision is Lost', () => {
        Object.defineProperty(endGame, 'decision', { value: GamePossibility.Lost });
        expect(component.winner).toEqual(gameInfo.otherPlayerInfo.name);
    });

    it('winner should return both if decision is equality', () => {
        Object.defineProperty(endGame, 'decision', { value: GamePossibility.Equality });
        expect(component.winner).toEqual(`${gameInfo.otherPlayerInfo.name}, ${gameInfo.playerInfo.name}`);
    });

    it('winner should return empty string if not finish', () => {
        Object.defineProperty(endGame, 'decision', { value: GamePossibility.NotFinish });
        expect(component.winner).toEqual('');
    });

    it('endGame should be true when decision !== NOT_FINISH', () => {
        Object.defineProperty(endGame, 'decision', { value: GamePossibility.Lost });
        expect(component.isEndGame).toBeTrue();
    });

    it('endGame should be false when decision === NOT_FINISH', () => {
        expect(component.isEndGame).toBeFalse();
    });

    it('close should put open to false', () => {
        expect(component.open).toBeTrue();
        component.close();
        expect(component.open).toBeFalse();
    });
});
