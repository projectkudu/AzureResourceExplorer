class Action {
    httpMethod: string;
    name: string;
    url: string;
    query?: string[];
    requestBody?: any;

    constructor(httpMethod: string, name: string, url: string) {
        this.httpMethod = httpMethod;
        this.name = name;
        this.url = url;
    }

    getRequestBody(): any {
        let requestBody = undefined;
        if (this.requestBody) {
            const editor = ace.edit(this.name + "-editor");
            requestBody = JSON.parse(editor.getValue());
        }
        return requestBody;
    }

    getQueryString(queryParameters: any): string {
        let queryString : string = undefined;
        if (this.query) {
            queryString = this.query.reduce((previous, current) => {
                const querySeparator = (previous === "") ? "?" : "&";
                return previous + ((queryParameters[current] && queryParameters[current].trim() !== "")
                    ? `${querySeparator}${current}=${queryParameters[current].trim()}`
                    : "");
            }, "");
        }
        return queryString;
    }

    isGetAction(): boolean {
        return this.httpMethod === "GET" || (this.httpMethod === "POST" && this.url.split('/').last() === "list");
    }

    isDeleteAction(): boolean {
        return this.httpMethod === "DELETE";
    }
}