class ArmClientRepository {

    constructor(private $http: ng.IHttpService) {
    }

    async getApplicableProvidersAsync(): Promise<ng.IHttpPromiseCallbackArg<any>> {
        const applicableProvidersConfig: ng.IRequestConfig = { method: "GET", url: "api/providers" };
        return await this.$http(applicableProvidersConfig);
    }

    async getApplicableOperations(providers: any): Promise<ng.IHttpPromiseCallbackArg<any>> {
        const postProviders: ng.IRequestConfig = { method: "POST", url: "api/all-operations", data: JSON.stringify(providers.data) };
        return await this.$http(postProviders);
    }

    async getTenants(): Promise<ng.IHttpPromiseCallbackArg<any>> {
        const tenantsConfig: ng.IRequestConfig = { method: "GET", url: "api/tenants" };
        return await this.$http(tenantsConfig);
    }

    async getUserToken(): Promise<ng.IHttpPromiseCallbackArg<any>> {
        const userTokenConfig: ng.IRequestConfig = { method: "GET", url: "api/token" };
        return await this.$http(userTokenConfig);
    }

    async searchKeyword(keyword: string): Promise<ng.IHttpPromiseCallbackArg<any>> {
        const searchConfig: ng.IRequestConfig = { method: "GET", url: `api/search?keyword=${keyword}` };
        return await this.$http(searchConfig);
    }

    async invokeAction(selectedResource: ISelectedResource, action: Action, actionsModel: any): Promise<ng.IHttpPromiseCallbackArg<any>> {
        const invokeConfig: ng.IRequestConfig = {
            method: "POST",
            url: "api/operations",
            data: {
                Url: action.url,
                RequestBody: action.getRequestBody(),
                HttpMethod: action.httpMethod,
                ApiVersion: selectedResource.apiVersion,
                QueryString: action.getQueryString(actionsModel)
            }
        };
        return await this.$http(invokeConfig);
    }

    async invokeHttp(httpConfig: ng.IRequestConfig): Promise<ng.IHttpPromiseCallbackArg<any>> {
        return await this.$http(httpConfig);
    }

    async invokePut(selectedResource: ISelectedResource, action: Action, editorCollection: EditorCollection): Promise<ng.IHttpPromiseCallbackArg<any>> {
        const userObject = editorCollection.getValue(Editor.RequestEditor, true);
        const invokePutConfig: ng.IRequestConfig = {
            method: "POST",
            url: "api/operations",
            data: {
                Url: selectedResource.putUrl,
                HttpMethod: action.httpMethod,
                RequestBody: userObject,
                ApiVersion: selectedResource.apiVersion
            }
        };
        return await this.$http(invokePutConfig);
    }

    async invokeCreate(newResourceName: string, selectedResource: ISelectedResource, action: Action, editorCollection: EditorCollection): Promise<ng.IHttpPromiseCallbackArg<any>> {
        const userObject = editorCollection.getValue(Editor.CreateEditor, true);
        const invokeCreateConfig: ng.IRequestConfig = {
            method: "POST",
            url: "api/operations",
            data: {
                Url: selectedResource.putUrl + "/" + newResourceName,
                HttpMethod: "PUT",
                RequestBody: userObject,
                ApiVersion: selectedResource.apiVersion
            }
        };
        return await this.$http(invokeCreateConfig);
    }

    async getProvidersForSubscription(subscriptionId:string): Promise<ng.IHttpPromiseCallbackArg<any>> {
        const getProvidersConfig: ng.IRequestConfig = {
            method: "GET",
            url: `api/operations/providers/${subscriptionId}`
        };
        return await this.$http(getProvidersConfig);
    }
}
