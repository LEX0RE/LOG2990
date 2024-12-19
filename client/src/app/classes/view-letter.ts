import { EaselSelectionType } from '@app/enum/easel-selection-type';
import { CommonLetter } from '@common/interfaces/game-view-related/common-letter';

export class ViewLetter {
    letter: CommonLetter;
    selection: EaselSelectionType;

    constructor(letter: CommonLetter, selection: EaselSelectionType) {
        this.letter = letter;
        this.selection = selection;
    }

    get toCommonLetter(): CommonLetter {
        return this.letter;
    }

    static viewToCommon(viewLetters: ViewLetter[]): CommonLetter[] {
        return viewLetters.map((viewLetter: ViewLetter) => viewLetter.toCommonLetter);
    }

    static commonToView(letters: CommonLetter[]): ViewLetter[] {
        return letters.map((letter: CommonLetter) => new ViewLetter(letter, EaselSelectionType.Unselected));
    }
}
