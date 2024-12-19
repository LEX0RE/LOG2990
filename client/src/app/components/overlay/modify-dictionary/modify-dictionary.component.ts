import { Component, Input } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import {
    MAX_CHARACTERS_DESCRIPTION,
    MAX_CHARACTERS_TITLE,
    MIN_CHARACTERS_DESCRIPTION,
    MIN_CHARACTERS_TITLE,
    TypeOfInput,
} from '@app/constants/modify-dictionary';
import { Dictionary } from '@app/interface/dictionary';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';

@Component({
    selector: 'app-modify-dictionary',
    templateUrl: './modify-dictionary.component.html',
    styleUrls: ['./modify-dictionary.component.scss'],
})
export class ModifyDictionaryComponent {
    @Input() isVisible: boolean;
    @Input() dictionary: Dictionary;
    readonly minCharactersTitle: number;
    readonly maxCharactersTitle: number;
    readonly minCharactersDescription: number;
    readonly maxCharactersDescription: number;
    title: FormControl;
    description: FormControl;
    private httpRequestManagerService: HttpRequestManagerService;

    constructor(httpRequestManagerService: HttpRequestManagerService) {
        this.httpRequestManagerService = httpRequestManagerService;
        this.isVisible = false;
        this.minCharactersTitle = MIN_CHARACTERS_TITLE;
        this.maxCharactersTitle = MAX_CHARACTERS_TITLE;
        this.minCharactersDescription = MIN_CHARACTERS_DESCRIPTION;
        this.maxCharactersDescription = MAX_CHARACTERS_DESCRIPTION;
        this.title = new FormControl('');
        this.description = new FormControl('');
        this.initModifyDictionaryConfig();
    }

    modify(): void {
        this.isVisible = true;
        this.title.setValue(this.dictionary.title);
        this.description.setValue(this.dictionary.description);
    }

    cancel(): void {
        this.isVisible = false;
    }

    modifyDictionary(): void {
        this.httpRequestManagerService
            .modifyDictionary(
                {
                    title: this.title.value,
                    description: this.description.value,
                    dictionaryId: this.dictionary.dictionaryId,
                },
                this.dictionary.title,
            )
            .subscribe(
                () => this.cancel(),
                () => this.cancel(),
            );
    }

    private initModifyDictionaryConfig(): void {
        const validatorTitle = this.createValidators(TypeOfInput.Title);
        const validatorDescription = this.createValidators(TypeOfInput.Description);

        this.title.setValidators(validatorTitle);
        this.description.setValidators(validatorDescription);
    }

    private createValidators(typeOfInput: string): ValidatorFn[] {
        const validator = [];

        if (typeOfInput === TypeOfInput.Title) {
            validator.push(Validators.minLength(MIN_CHARACTERS_TITLE));
            validator.push(Validators.maxLength(MAX_CHARACTERS_TITLE));
        } else {
            validator.push(Validators.minLength(MIN_CHARACTERS_DESCRIPTION));
            validator.push(Validators.maxLength(MAX_CHARACTERS_DESCRIPTION));
        }

        validator.push(Validators.required);

        return validator;
    }
}
