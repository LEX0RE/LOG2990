import { Component, Input } from '@angular/core';
import { Player } from '@app/interface/player';

@Component({
    selector: 'app-player-information',
    templateUrl: './player-information.component.html',
    styleUrls: ['./player-information.component.scss'],
})
export class PlayerInformationComponent {
    @Input() player: Player;
    @Input() win: boolean;

    get letterLeft() {
        return new Array(this.player.nLetterLeft);
    }
}
