export class CommandFormattingService {
    static tidyAccent(characters: string): string {
        characters = this.lowercaseLetterTidyAccent(characters);
        return this.capitalLetterTidyAccent(characters);
    }

    static isAlpha(characters: string): boolean {
        return /^[a-z*]+$/i.test(characters);
    }

    static isCharacterValidForEasel(character: string): boolean {
        return /^[a-z*]$/.test(character);
    }

    static isABlank(character: string): boolean {
        return /^[A-Z]$/.test(character);
    }

    // Inspiré de https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
    private static lowercaseLetterTidyAccent(characters: string): string {
        characters = characters.replace(new RegExp('[àáâä]', 'g'), 'a');
        characters = characters.replace(new RegExp('ç', 'g'), 'c');
        characters = characters.replace(new RegExp('[èéêë]', 'g'), 'e');
        characters = characters.replace(new RegExp('[ìíîï]', 'g'), 'i');
        characters = characters.replace(new RegExp('ñ', 'g'), 'n');
        characters = characters.replace(new RegExp('[òóôõö]', 'g'), 'o');
        characters = characters.replace(new RegExp('[ùúûü]', 'g'), 'u');
        characters = characters.replace(new RegExp('[ýÿ]', 'g'), 'y');
        return characters;
    }

    // Inspiré de https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
    private static capitalLetterTidyAccent(characters: string): string {
        characters = characters.replace(new RegExp('[ÀÁÂÄ]', 'g'), 'A');
        characters = characters.replace(new RegExp('Ç', 'g'), 'C');
        characters = characters.replace(new RegExp('[ÈÉÊË]', 'g'), 'E');
        characters = characters.replace(new RegExp('[ÌÍÎÏ]', 'g'), 'I');
        characters = characters.replace(new RegExp('Ñ', 'g'), 'N');
        characters = characters.replace(new RegExp('[ÒÓÔÕÖ]', 'g'), 'O');
        characters = characters.replace(new RegExp('[ÙÚÛÜ]', 'g'), 'U');
        characters = characters.replace(new RegExp('[ÝŸ]', 'g'), 'Y');
        return characters;
    }
}
