import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DEFAULT_DICTIONARY } from '@app/constants/new-configuration';
import { Dictionary } from '@app/interface/dictionary';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';

@Component({
    selector: 'app-unavailable-dictionary',
    templateUrl: './unavailable-dictionary.component.html',
    styleUrls: ['./unavailable-dictionary.component.scss'],
})
export class UnavailableDictionaryComponent implements OnInit {
    dictionary: FormControl;
    dictionaries: Dictionary[];
    dictionaryDescription: string;
    errorDictionary: boolean;
    openDictionaryOverlay: boolean;
    private newGameConfigurationService: NewGameConfigurationService;

    constructor(newGameConfigurationService: NewGameConfigurationService) {
        this.openDictionaryOverlay = false;
        this.newGameConfigurationService = newGameConfigurationService;
        this.dictionaries = [];
        this.dictionary = new FormControl('');
    }

    ngOnInit(): void {
        this.fetchDictionaries();
    }

    submit(): void {
        this.newGameConfigurationService.changeDictionary(this.dictionary.value);
        this.dictionary.setValue(DEFAULT_DICTIONARY);
        this.changeDictionaryDescription();
        this.newGameConfigurationService.openDictionaryOverlay = false;
    }

    changeDictionaryDescription(): void {
        const dictionary = this.dictionaries.find((dict: Dictionary) => dict.title === this.dictionary.value)?.description;

        if (dictionary) this.dictionaryDescription = dictionary;
    }

    fetchDictionaries(): void {
        this.newGameConfigurationService.fetchDictionaries().subscribe((receivedDictionaries) => {
            this.dictionaries = receivedDictionaries;
            this.changeDictionaryDescription();
        });
    }
}
