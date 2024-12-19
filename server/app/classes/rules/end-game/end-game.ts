import { PlaceLetters } from '@app/classes/actions/place-letters/places-letter';
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/players/player-abstract';
import { MathUtils } from '@app/classes/utils/math/math-utils';
import { MAX_SKIP_ALLOWED } from '@app/constants/game';
import { RuleName } from '@app/enum/rules';
import { Action } from '@app/interface/action-interface';
import { Rule } from '@app/interface/rule-interface';
import { RulesVisitorResponse } from '@app/interface/rules-visitor-response-interface';
import { ActionType } from '@common/enums/action-type';

export class EndGame implements Rule {
    name: string;
    nSkip: number;
    maxSkipsAllowed: number;

    constructor() {
        this.name = RuleName.EndGame;
        this.nSkip = 0;
        this.maxSkipsAllowed = MAX_SKIP_ALLOWED - 1;
    }

    verify(action: Action, game: Game, rulesVisitorResponse: RulesVisitorResponse): RulesVisitorResponse {
        if (action.actionType === ActionType.SkipTurn) {
            rulesVisitorResponse.gameModification.push(this.addNewSkip(this));
            if (this.nSkip < this.maxSkipsAllowed) return rulesVisitorResponse;
            rulesVisitorResponse.gameModification.push(this.endGame(game.players));
            return rulesVisitorResponse;
        } else if (action.actionType === ActionType.PlaceLetters) {
            this.verifyEmptyStashAndEasel(action, game, rulesVisitorResponse);
        }
        rulesVisitorResponse.gameModification.push(() => (this.nSkip = 0));

        return rulesVisitorResponse;
    }

    private verifyEmptyStashAndEasel(action: Action, game: Game, rulesVisitorResponse: RulesVisitorResponse): void {
        const placeLetter = action as PlaceLetters;

        if (game.letterStash.isEmpty && game.activePlayer.easel.size === placeLetter.letters.length) {
            rulesVisitorResponse.score = this.updateScore(game, rulesVisitorResponse);
            rulesVisitorResponse.gameModification.push(this.endGame(game.otherPlayer));
        }
    }

    private updateScore(game: Game, rulesVisitorResponse: RulesVisitorResponse): number {
        return MathUtils.accumulator<number, Player>(game.otherPlayer, rulesVisitorResponse.score, (sum: number, player: Player) => {
            sum += player.easel.totalScore;
            return sum;
        });
    }

    private endGame(players: Player[]): (game: Game) => void {
        return (game: Game): void => {
            players.forEach((player: Player) => {
                player.score -= player.easel.totalScore;
            });
            game.end();
        };
    }

    private addNewSkip(endGame: EndGame): () => void {
        return () => endGame.nSkip++;
    }
}
