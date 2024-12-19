import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from '@app/pages/admin/admin.component';
import { BestScoresAdminComponent } from '@app/pages/best-scores-admin/best-scores-admin.component';
import { BotDifficultyComponent } from '@app/pages/bot-difficulty/bot-difficulty.component';
import { DictionaryComponent } from '@app/pages/dictionary/dictionary.component';
import { EntryPointPageComponent } from '@app/pages/entry-point/entry-point-page.component';
import { GameHistoryPageComponent } from '@app/pages/game-history/game-history-page.component';
import { GameNavigationPageComponent } from '@app/pages/game-navigation/game-navigation-page.component';
import { GamePageComponent } from '@app/pages/game/game-page.component';
import { JoinMultiplayerGameComponent } from '@app/pages/join-multiplayer-game/join-multiplayer-game-page.component';
import { NewGameConfigurationComponent } from '@app/pages/new-game-configuration/new-game-configuration-page.component';
import { VirtualPlayersComponent } from '@app/pages/virtual-players/virtual-players.component';
import { WaitingForGameStartComponent } from '@app/pages/waiting-for-game-start/waiting-for-game-start-page.component';
import { WaitingForPlayerPageComponent } from '@app/pages/waiting-for-player/waiting-for-player-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: EntryPointPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'gameNavigation', component: GameNavigationPageComponent },
    { path: 'createNewGame', component: NewGameConfigurationComponent },
    { path: 'waitingForPlayer', component: WaitingForPlayerPageComponent },
    { path: 'joinGame', component: JoinMultiplayerGameComponent },
    { path: 'waitingForGameStart', component: WaitingForGameStartComponent },
    { path: 'botDifficulty', component: BotDifficultyComponent },
    { path: 'admin', component: AdminComponent },
    { path: 'gameHistory', component: GameHistoryPageComponent },
    { path: 'bestScores', component: BestScoresAdminComponent },
    { path: 'virtualPlayer', component: VirtualPlayersComponent },
    { path: 'dictionaries', component: DictionaryComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
