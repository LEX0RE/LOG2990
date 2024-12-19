import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerInformationComponent } from '@app/components/player-information/player-information.component';
import { Player } from '@app/interface/player';

describe('PlayerInformationComponent', () => {
    let component: PlayerInformationComponent;
    let fixture: ComponentFixture<PlayerInformationComponent>;
    let player: Player;
    const fakePlayer: Player = { name: 'player1', score: 315, nLetterLeft: 3, turn: false };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayerInformationComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerInformationComponent);
        component = fixture.componentInstance;
        player = fakePlayer;
        component.player = player;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
