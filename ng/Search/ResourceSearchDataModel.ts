export class ResourceSearchDataModel implements IResourceSearch {
    searchKeyword: string;
    isSuggestListDisplay: boolean;
    suggestions: IResourceSearchSuggestion[];

    constructor() {
        this.isSuggestListDisplay = false;
        this.suggestions = [];
    }

    turnOffSuggestions() {
        this.isSuggestListDisplay = false;
    }

    turnOnSuggestions() {
        this.isSuggestListDisplay = true;
    }

    addSuggestion(suggestion: IResourceSearchSuggestion) {
        this.suggestions.push(suggestion);
    }

    setSuggestions(suggestions: IResourceSearchSuggestion[]) {
        this.suggestions = suggestions;
    }

    getSuggestions(): IResourceSearchSuggestion[] {
        return this.suggestions;
    }
}