import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FILE_ENCODING, FILE_EXTENSION, MAX_LENGTH_WORD, MIN_LENGTH_WORD, MIN_WORDS, SCHEMA } from '@app/constants/dictionary';
import { MAX_CHARACTERS_DESCRIPTION, MAX_CHARACTERS_TITLE, MIN_CHARACTERS_DESCRIPTION, MIN_CHARACTERS_TITLE } from '@app/constants/modify-dictionary';
import { Dictionary, DictionaryWithWords } from '@app/interface/dictionary';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import Ajv from 'ajv';

@Component({
    selector: 'app-dictionary',
    templateUrl: './dictionary.component.html',
    styleUrls: ['./dictionary.component.scss'],
})
export class DictionaryComponent implements OnInit {
    dictionaries: Dictionary[];
    isServerValid: boolean;
    modifyOverlay: boolean;
    loading: boolean;
    successLoading: boolean;
    failureLoading: boolean;
    goodFileExtension: boolean;
    jsonValid: boolean;
    goodFormat: boolean;
    goodTitle: boolean;
    uniqueTitle: boolean;
    goodDescription: boolean;
    goodWords: boolean;
    filePath: FormControl;
    file: string;
    dictionary: DictionaryWithWords;
    component: { title: string };
    openConfirmationOverlay: boolean;
    private httpRequestManagerService: HttpRequestManagerService;

    constructor(httpRequestManagerService: HttpRequestManagerService) {
        this.httpRequestManagerService = httpRequestManagerService;
        this.isServerValid = true;
        this.modifyOverlay = false;
        this.loading = false;
        this.successLoading = false;
        this.failureLoading = false;
        this.goodFileExtension = true;
        this.jsonValid = true;
        this.goodFormat = true;
        this.goodTitle = true;
        this.uniqueTitle = true;
        this.goodDescription = true;
        this.goodWords = true;
        this.filePath = new FormControl();
    }

    ngOnInit(): void {
        this.fetchDictionaries();
    }

    onChange(event: Event): void {
        const fileReader = new FileReader();
        const target = event.target as HTMLInputElement;

        if (target.files && target.files.length) {
            fileReader.readAsText(target.files[0], FILE_ENCODING);
            fileReader.onload = () => (this.file = fileReader.result as string);
        } else this.resetWarningFlags();
    }

    fetchDictionaries(): void {
        this.httpRequestManagerService.getDictionaries().subscribe((receivedDictionaries) => {
            this.dictionaries = receivedDictionaries;
        });
    }

    deleteDictionary(dictionaryId: number): void {
        this.httpRequestManagerService.deleteDictionary(dictionaryId).subscribe(
            () => {
                this.isServerValid = true;
                this.fetchDictionaries();
            },
            () => (this.isServerValid = false),
        );
    }

    deleteAll(): void {
        this.httpRequestManagerService.deleteAllDictionary().subscribe(
            () => {
                this.isServerValid = true;
                this.fetchDictionaries();
            },
            () => (this.isServerValid = false),
        );
    }

    downloadDictionary(title: string): void {
        this.httpRequestManagerService.getDictionary(title).subscribe(
            (receivedDictionary) => {
                this.createUri(receivedDictionary);
                this.isServerValid = true;
            },
            () => (this.isServerValid = false),
        );
    }

    async uploadDictionary(): Promise<void> {
        this.resetWarningFlags();
        if (this.verifyFile()) {
            this.loading = true;
            this.filePath.setValue(null);

            this.httpRequestManagerService.addDictionary(this.dictionary).subscribe(
                () => {
                    this.isServerValid = true;
                    this.fetchDictionaries();
                    this.loading = false;
                    this.successLoading = true;
                },
                () => {
                    this.isServerValid = false;
                    this.loading = false;
                    this.failureLoading = true;
                },
            );
        }
    }

    get noFileSelected(): boolean {
        return this.filePath.value;
    }

    private createUri(dictionary: DictionaryWithWords): void {
        const stringDictionary = JSON.stringify(dictionary, null, 2);

        const aElement = document.createElement('a');

        aElement.href = 'data:text/json;charset=UTF-8,' + encodeURIComponent(stringDictionary);
        aElement.download = dictionary.title + '.json';
        document.body.appendChild(aElement);
        aElement.click();
        document.body.removeChild(aElement);
    }

    private verifyFile(): boolean {
        if (!this.validateFilPath()) return this.goodFileExtension;

        try {
            this.dictionary = JSON.parse(this.file);
        } catch {
            this.jsonValid = false;
            return this.jsonValid;
        }

        if (!this.validateFormat()) {
            this.goodFormat = false;
            return this.goodFormat;
        }

        return this.validateProperties();
    }

    private validateFilPath(): boolean {
        const fileExtension = this.filePath.value.split('.').pop();

        this.goodFileExtension = fileExtension === FILE_EXTENSION;

        return this.goodFileExtension;
    }

    private validateFormat(): boolean {
        const ajv = new Ajv();
        const validate = ajv.compile(SCHEMA);

        return validate(this.dictionary);
    }

    private validateProperties(): boolean {
        return this.validateTitle() && this.validateDescription() && this.validateWords();
    }

    private validateTitle(): boolean {
        if (this.dictionary.title.length < MIN_CHARACTERS_TITLE || this.dictionary.title.length > MAX_CHARACTERS_TITLE) {
            this.goodTitle = false;
            return this.goodTitle;
        }

        return this.isUniqueTitle();
    }

    private validateDescription(): boolean {
        this.goodDescription =
            this.dictionary.description.length >= MIN_CHARACTERS_DESCRIPTION && this.dictionary.description.length <= MAX_CHARACTERS_DESCRIPTION;

        return this.goodDescription;
    }

    private validateWords(): boolean {
        this.goodWords = this.dictionary.words.length >= MIN_WORDS;

        const regex = new RegExp('^[a-z]+$');

        this.goodWords = !this.dictionary.words.some((word) => !regex.test(word) || word.length > MAX_LENGTH_WORD || word.length < MIN_LENGTH_WORD);

        return this.goodWords;
    }

    private isUniqueTitle(): boolean {
        this.uniqueTitle = !this.dictionaries.some((dictionary) => dictionary.title === this.dictionary.title);
        return this.uniqueTitle;
    }

    private resetWarningFlags(): void {
        this.goodFileExtension = true;
        this.jsonValid = true;
        this.goodFormat = true;
        this.goodTitle = true;
        this.uniqueTitle = true;
        this.goodDescription = true;
        this.goodWords = true;
        this.successLoading = false;
        this.failureLoading = false;
    }
}
