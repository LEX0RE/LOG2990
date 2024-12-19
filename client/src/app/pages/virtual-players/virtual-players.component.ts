import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ACCEPTED_CHARACTERS, MAX_CHARACTERS, MIN_CHARACTERS } from '@app/constants/borders-player-name';
import { NO_INDEX } from '@app/constants/virtual-player';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { Difficulty } from '@common/enums/difficulty';
import { CommonVirtualPlayerName } from '@common/game-view-related/common-virtual-player-name';

@Component({
    selector: 'app-virtual-players',
    templateUrl: './virtual-players.component.html',
    styleUrls: ['./virtual-players.component.scss'],
})
export class VirtualPlayersComponent implements OnInit {
    readonly minCharacters: number;
    readonly maxCharacters: number;
    virtualPlayersNamesBeginner: CommonVirtualPlayerName[];
    virtualPlayersNamesExpert: CommonVirtualPlayerName[];
    isServerValid: boolean;
    newNameBeginner: FormControl;
    newNameExpert: FormControl;
    modifiedNameBeginner: FormControl;
    modifiedNameExpert: FormControl;
    indexNameToModifiedBeginner: number;
    indexNameToModifiedExpert: number;
    openConfirmationOverlay: boolean;
    private httpRequestManagerService: HttpRequestManagerService;

    constructor(httpRequestManagerService: HttpRequestManagerService) {
        this.minCharacters = MIN_CHARACTERS;
        this.maxCharacters = MAX_CHARACTERS;
        this.isServerValid = true;
        this.newNameBeginner = new FormControl('');
        this.newNameExpert = new FormControl('');
        this.modifiedNameBeginner = new FormControl('');
        this.modifiedNameExpert = new FormControl('');
        this.indexNameToModifiedBeginner = NO_INDEX;
        this.indexNameToModifiedExpert = NO_INDEX;
        this.httpRequestManagerService = httpRequestManagerService;
        this.setValidators();
    }

    ngOnInit(): void {
        this.fetchAllNames();
    }

    fetchAllNames(): void {
        this.fetchNames(Difficulty.Easy);
        this.fetchNames(Difficulty.Hard);
    }

    addName(difficulty: string, name: string): void {
        this.resetValue(difficulty);
        this.httpRequestManagerService.addName(difficulty, { playerName: name }).subscribe(
            () => {
                this.isServerValid = true;
                this.fetchAllNames();
            },
            () => (this.isServerValid = false),
        );
    }

    deleteName(difficulty: string, name: string): void {
        this.httpRequestManagerService.deleteName(difficulty, name).subscribe(
            () => this.refreshNames(difficulty),
            () => (this.isServerValid = false),
        );
    }

    modifyName(difficulty: string, oldName: string, newName: string): void {
        this.httpRequestManagerService.modifyName(difficulty, oldName, newName).subscribe(
            () => this.refreshNames(difficulty),
            () => (this.isServerValid = false),
        );
    }

    deleteAll(): void {
        this.httpRequestManagerService.deleteAllNames().subscribe(
            () => {
                this.isServerValid = true;
                this.fetchAllNames();
                this.cancel(Difficulty.Easy);
                this.cancel(Difficulty.Hard);
            },
            () => (this.isServerValid = false),
        );
    }

    validateNameExists(difficulty: string) {
        if (difficulty === Difficulty.Easy)
            return this.validateNameExistsSameList(Difficulty.Easy) || this.validateNameExistsOtherList(Difficulty.Hard);

        return this.validateNameExistsSameList(Difficulty.Hard) || this.validateNameExistsOtherList(Difficulty.Easy);
    }

    validateModifiedNameExists(difficulty: string): boolean {
        if (difficulty === Difficulty.Easy)
            return this.validateModifiedNameSameList(Difficulty.Easy) || this.validateModifiedNameOtherList(Difficulty.Hard);
        return this.validateModifiedNameSameList(Difficulty.Hard) || this.validateModifiedNameOtherList(Difficulty.Easy);
    }

    modifySelectedName(difficulty: string, index: number): void {
        if (difficulty === Difficulty.Easy) {
            this.indexNameToModifiedBeginner = index;
            this.modifiedNameBeginner.setValue(this.virtualPlayersNamesBeginner[index].playerName);
        } else {
            this.indexNameToModifiedExpert = index;
            this.modifiedNameExpert.setValue(this.virtualPlayersNamesExpert[index].playerName);
        }
    }

    cancel(difficulty: string): void {
        if (difficulty === Difficulty.Easy) this.indexNameToModifiedBeginner = NO_INDEX;
        else this.indexNameToModifiedExpert = NO_INDEX;
    }

    private refreshNames(difficulty: string): void {
        this.isServerValid = true;
        this.fetchAllNames();
        this.cancel(difficulty);
    }

    private validateNameExistsSameList(difficulty: string): boolean {
        if (difficulty === Difficulty.Easy) return this.virtualPlayersNamesBeginner.some((name) => name.playerName === this.newNameBeginner.value);
        return this.virtualPlayersNamesExpert.some((name) => name.playerName === this.newNameExpert.value);
    }

    private validateNameExistsOtherList(difficulty: string): boolean {
        if (difficulty === Difficulty.Easy) return this.virtualPlayersNamesBeginner.some((name) => name.playerName === this.newNameExpert.value);
        return this.virtualPlayersNamesExpert.some((name) => name.playerName === this.newNameBeginner.value);
    }

    private validateModifiedNameSameList(difficulty: string): boolean {
        if (difficulty === Difficulty.Easy)
            return this.virtualPlayersNamesBeginner.some((name) => name.playerName === this.modifiedNameBeginner.value);
        return this.virtualPlayersNamesExpert.some((name) => name.playerName === this.modifiedNameExpert.value);
    }

    private validateModifiedNameOtherList(difficulty: string): boolean {
        if (difficulty === Difficulty.Easy) return this.virtualPlayersNamesBeginner.some((name) => name.playerName === this.modifiedNameExpert.value);
        return this.virtualPlayersNamesExpert.some((name) => name.playerName === this.modifiedNameBeginner.value);
    }

    private setValidators(): void {
        const validator = [];

        validator.push(Validators.required);
        validator.push(Validators.minLength(MIN_CHARACTERS));
        validator.push(Validators.maxLength(MAX_CHARACTERS));
        validator.push(Validators.pattern(ACCEPTED_CHARACTERS));
        this.newNameBeginner.setValidators(validator);
        this.newNameExpert.setValidators(validator);
        this.modifiedNameBeginner.setValidators(validator);
        this.modifiedNameExpert.setValidators(validator);
    }

    private resetValue(difficulty: string): void {
        if (difficulty === Difficulty.Easy) this.newNameBeginner.reset();
        else this.newNameExpert.reset();
    }

    private fetchNames(difficulty: string): void {
        this.httpRequestManagerService.getAllNames(difficulty).subscribe(
            (receivedNames) => {
                if (difficulty === Difficulty.Easy) this.virtualPlayersNamesBeginner = receivedNames;
                else this.virtualPlayersNamesExpert = receivedNames;
                this.isServerValid = true;
            },
            () => (this.isServerValid = false),
        );
    }
}
