import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from '@app/app.component';
import { BestScoresBoardsComponent } from '@app/components/best-scores-boards/best-scores-boards.component';
import { ChatBoxComponent } from '@app/components/chat/chat-box/chat-box.component';
import { InputBoxComponent } from '@app/components/chat/input-box/input-box.component';
import { OutputBoxComponent } from '@app/components/chat/output-box/output-box.component';
import { EaselComponent } from '@app/components/easel/easel.component';
import { FontSizeLetterComponent } from '@app/components/font-size-letter/font-size-letter.component';
import { GoalComponent } from '@app/components/goal/goal.component';
import { HelpButtonComponent } from '@app/components/help-button/help-button.component';
import { HintButtonComponent } from '@app/components/hint-button/hint-button.component';
import { HomeButtonComponent } from '@app/components/home-button/home-button.component';
import { InformativePanelComponent } from '@app/components/informative-panel/informative-panel.component';
import { LetterComponent } from '@app/components/letter/letter.component';
import { BestScoresComponent } from '@app/components/overlay/best-scores/best-scores.component';
import { ErrorBestScoreComponent } from '@app/components/overlay/error-best-score/error-best-score.component';
import { ErrorCreatingGameComponent } from '@app/components/overlay/error-creating-game/error-creating-game.component';
import { GameLoadingComponent } from '@app/components/overlay/game-loading/game-loading.component';
import { InvalidGameModeComponent } from '@app/components/overlay/invalid-game-mode/invalid-game-mode.component';
import { ModifyDictionaryComponent } from '@app/components/overlay/modify-dictionary/modify-dictionary.component';
import { SurrenderComponent } from '@app/components/overlay/surrender/surrender.component';
import { UnavailableDictionaryComponent } from '@app/components/overlay/unavailable-dictionary/unavailable-dictionary.component';
import { WinnerAnnouncementComponent } from '@app/components/overlay/winner-announcement/winner-announcement.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayerInformationComponent } from '@app/components/player-information/player-information.component';
import { RandomJoinButtonComponent } from '@app/components/random-join-button/random-join-button.component';
import { DebounceClickDirective } from '@app/directives/debounce/click/debounce-click.directive';
import { DebounceKeyPressedDirective } from '@app/directives/debounce/keyboard/debounce-key-pressed.directive';
import { DebounceRightClickDirective } from '@app/directives/debounce/right-click/debounce-right-click.directive';
import { AppRoutingModule } from '@app/modules/app-routing.module';
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

@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        PlayAreaComponent,
        InputBoxComponent,
        ChatBoxComponent,
        OutputBoxComponent,
        InformativePanelComponent,
        LetterComponent,
        SurrenderComponent,
        PlayerInformationComponent,
        EntryPointPageComponent,
        GameNavigationPageComponent,
        HomeButtonComponent,
        NewGameConfigurationComponent,
        GoalComponent,
        UnavailableDictionaryComponent,
        JoinMultiplayerGameComponent,
        InvalidGameModeComponent,
        ErrorCreatingGameComponent,
        WaitingForPlayerPageComponent,
        WaitingForGameStartComponent,
        EaselComponent,
        DebounceClickDirective,
        DebounceKeyPressedDirective,
        BotDifficultyComponent,
        BestScoresComponent,
        DebounceRightClickDirective,
        RandomJoinButtonComponent,
        FontSizeLetterComponent,
        ErrorBestScoreComponent,
        WinnerAnnouncementComponent,
        HelpButtonComponent,
        HintButtonComponent,
        AdminComponent,
        GameHistoryPageComponent,
        BestScoresAdminComponent,
        BestScoresBoardsComponent,
        VirtualPlayersComponent,
        DictionaryComponent,
        ModifyDictionaryComponent,
        GameLoadingComponent,
    ],
    imports: [AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, ReactiveFormsModule],

    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
