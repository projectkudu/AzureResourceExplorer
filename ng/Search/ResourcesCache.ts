import {ArmClientRepository} from "../AppStart/ArmClientRepository";
import {StringExtensions} from "../polyfill/StringExtensions";

export class ResourcesCache implements IResearchSearchCache {

    data: any;
    timestamp: number;
    private currentSearchKeyword;

    static resourceCacheExpiration = 5 * 60 * 1000;    // 5 mintues

    private isResourceCacheRefreshing: boolean;

    private cacheExpired(): boolean {
        return (Date.now() - this.timestamp) > ResourcesCache.resourceCacheExpiration;
    }

    constructor(private repository: ArmClientRepository) {
        this.isResourceCacheRefreshing = false;
        this.currentSearchKeyword = "";
    }

    private clearCache() {
        this.data = {};
        this.timestamp = Date.now();
    }

    async refresh() {
        try {
            if (!this.cacheExpired() && !this.isResourceCacheRefreshing) {
                this.isResourceCacheRefreshing = true;
                const searchResponse = await this.repository.searchKeyword("");
                const response: any[] = searchResponse.data;
                this.clearCache();
                // turn array into hashmap, to allow easily update cache later
                response.forEach((item) => { this.data[item.id] = item; });
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.isResourceCacheRefreshing = false;
        }
    }

    setSearchKeyword(keyword: string) {
        this.currentSearchKeyword = keyword;
    }

    getSearchKeyword() {
        return this.currentSearchKeyword;
    }

    private suggestionSortFunc = (a: any, b: any): number => {

        const result = StringExtensions.compare(a.type, b.type, true /*ignore case*/);
        if (result === 0) {
            return StringExtensions.compare(a.name, b.name, true /*ignore case*/);
        }
        return result;
    };

    getSuggestions(keyword: string): IResourceSearchSuggestion[] {
        var results: IResourceSearchSuggestion[] = [];
        for (var itemKey in this.data) {
            var item = this.data[itemKey];
            if (item && item.name && item.type &&
                (item.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1 || item.type.toLowerCase().indexOf(keyword.toLowerCase()) > -1)) {
                results.push(item);
            }
        }

        results.sort(this.suggestionSortFunc);
        return results;
    }
}