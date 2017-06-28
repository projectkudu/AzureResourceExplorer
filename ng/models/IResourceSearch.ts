interface IResourceSearchSuggestion {
    id: string;
    name: string;
    "type": string;
    location: string;
    tags: any;
}

interface IResearchSearchCache {
    data: any;
    timestamp: number;
    refresh(): void;
    setSearchKeyword(keyword: string): void;
}

interface IResourceSearch {
    searchKeyword: string;
    isSuggestListDisplay: boolean;
    suggestions: IResourceSearchSuggestion[];
}