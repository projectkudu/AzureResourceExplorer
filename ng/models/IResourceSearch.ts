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
}

interface IResourceSearch {
    searchKeyword: string;
    isSuggestListDisplay: boolean;
    suggestions: IResourceSearchSuggestion[];
}