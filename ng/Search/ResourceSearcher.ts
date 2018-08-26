class ResourceSearcher {

    private resourceSearchCache: ResourcesCache;

    constructor(public resourceSearchModel: ResourceSearchDataModel, private repository: ArmClientRepository) {
        this.resourceSearchCache = new ResourcesCache(repository);
        this.resourceSearchCache.refresh();
    }

    async resourceSearch() {
        // try to trigger cache refresh
        this.resourceSearchCache.refresh();

        // first performence search from local cache (should cover most of the case)
        // so that user will have instance result
        var keyword = this.resourceSearchModel.searchKeyword || "";

        // remember last keyword
        // when merge latest data into cache and if cache is for current keyword, will also update suggestion list
        this.resourceSearchCache.setSearchKeyword(keyword);
        const results: IResourceSearchSuggestion[] = this.resourceSearchCache.getSuggestions(keyword);

        // check 2 way?
        this.resourceSearchModel.setSuggestions(results);
        if (this.resourceSearchModel.getSuggestions().length > 0) {
            this.resourceSearchModel.turnOnSuggestions();
        } else {
            this.resourceSearchModel.turnOffSuggestions();
        }

        // do not trigger search by keyword if input is empty
        if (this.resourceSearchCache.getSearchKeyword()) {
            // request from ARM to get more data, and merge into local cache
            const searchResponse = await this.repository.searchKeyword(keyword);
            const searchResults: any[] = searchResponse.data;

            // update local cache
            searchResults.forEach((item) => {
                // if not in local cache, and user still searching with current keyword, append to suggestion list
                if (keyword === this.resourceSearchCache.data.currentKeyword && !this.resourceSearchCache.data[item.id]) {
                    this.resourceSearchModel.addSuggestion(item);
                }

                this.resourceSearchCache.data[item.id] = item;
            });
        }

    }
}