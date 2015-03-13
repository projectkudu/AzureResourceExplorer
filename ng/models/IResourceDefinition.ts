interface IResourceDefinition {
    actions: string[];
    requestBody?: any;
    responseBody?: any;
    children: string[]|string;
    responseBodyDoc?: any;
    requestBodyDoc?: any;
    url: string;
    apiVersion: string;
    resourceName: string;
    query?: string[];
}