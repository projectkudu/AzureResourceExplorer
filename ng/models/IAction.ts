interface IAction {
    httpMethod: string;
    name: string;
    url: string;
    query?: string[];
    requestBody?: any;
}