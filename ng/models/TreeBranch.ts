class TreeBranch {
    currentResourceGroupProviders?: any;
    uid?: number;
    label: string;
    value?: string;
    children?: TreeBranch[];
    resourceDefinition: ResourceDefinition;
    is_leaf?: boolean;
    expanded?: boolean;
    elementUrl?: string;
    is_instruction?: boolean;
    sortValue: string;
    iconNameOverride: string;

    constructor(label: string) {
        this.label = label;
    }

    data: any;
    resource_icon: string;


    getGetHttpConfig(): ng.IRequestConfig {
        const getAction = this.resourceDefinition.getGetAction();
        let httpConfig = null;

        if (getAction !== undefined) {
            const method = (getAction === "GETPOST" ? "POST" : "GET");
            httpConfig = {
                method: "POST",
                url: "api/operations",
                data: {
                    Url: (getAction === "GETPOST" || getAction === "GETLIST" ? this.elementUrl + "/list" : this.elementUrl),
                    HttpMethod: method,
                    ApiVersion: this.resourceDefinition.apiVersion
                }
            };
        }   
        return httpConfig;
    }

    getGetActionUrl(): string {
        const getAction = this.resourceDefinition.getGetAction();
        let getActionUrl = null;
        if (getAction !== undefined) {
            if (getAction === "GETPOST" || getAction == "GETLIST") {
                getActionUrl = this.elementUrl + "/list";
            } else {
                getActionUrl = this.elementUrl;
            }
        }
        return getActionUrl;
    }


    private findCommonAncestor(armIdA: string, armIdB: string): string {
        const getTokensFromId = (url: string): string[] => {
            url = url.toLowerCase();
            var removeTo = 0;   // default is to remove first empty token "/subscriptions/3b94e3c2-9f5b-4a1e-9999-3e0945b8…a9/resourceGroups/brandoogroup3/providers/Microsoft.Web/sites/brandoosite3"
            if (url.startsWith("http")) {
                // "https://management.azure.com/subscriptions/3b94e3c2-9f5b-4a1e-9999-3e0945b8…a9/resourceGroups/brandoogroup3/providers/Microsoft.Web/sites/brandoosite3"
                // if start with "http/https", we will need to ignore the host name
                removeTo = 2;
            }

            var tokens = url.split('/');
            tokens.remove(0, removeTo);
            return tokens;
        };

        const tokensA = getTokensFromId(armIdA);
        const tokensB = getTokensFromId(armIdB);
        const len = Math.min(tokensA.length, tokensB.length);
        let commonAncestor = "";
        for (let i = 0; i < len; i++) {
            if (tokensA[i] === tokensB[i]) {
                commonAncestor += "/" + tokensA[i];
            } else {
                break;
            }
        }
        return commonAncestor;
    }


    getCommonAncestorBranch(otherBranchUrl: string): string {
        return this.findCommonAncestor(otherBranchUrl, this.elementUrl);
    }
}