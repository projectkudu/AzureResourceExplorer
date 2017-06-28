class ResourceDefinition {
    actions: string[];
    requestBody?: any;
    responseBody?: any;
    children: string[] | string;
    responseBodyDoc?: any;
    requestBodyDoc?: any;
    url: string;
    apiVersion: string;
    resourceName: string;
    query?: string[];


    getGetActions(): string[] {
        return this.actions.filter(a => (a === "GET" || a === "GETPOST"));
    }

    hasCreateAction(): boolean {
        return this.actions.includes("CREATE");
    }

    hasPutOrPatchAction(): boolean {
        return this.actions.some(a => (a === "PATCH" || a === "PUT"));
    }

    hasPostAction(): boolean {
        return this.actions.some(a => (a === "POST"));
    }

    getEditable(responseData: any) : any{
        let editable: any;
        if (this.requestBody && ObjectUtils.isEmptyObjectOrArray(this.requestBody.properties)) {
            editable = responseData;
        } else {
            editable = jQuery.extend(true, {}, this.requestBody);
            const dataCopy = jQuery.extend(true, {}, responseData);
            ObjectUtils.mergeObject(dataCopy, editable);
        }
        return editable;
    }

    hasRequestBody(): boolean {
        return !ObjectUtils.isEmptyObjectOrArray(this.requestBody);
    }

    getDocBody() : any {
        return this.responseBodyDoc ? this.responseBodyDoc : this.requestBodyDoc;
    }

}