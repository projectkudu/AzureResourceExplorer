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

    getGetAction(): string | undefined {
        if (this.actions.includes("GET")) {
            return "GET";
        } else if (this.actions.includes("GETPOST")) {
            return "GETPOST";
        } else if (this.actions.includes("GETLIST")) {
            return "GETLIST";
        } else {
            return undefined;
        }
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
        return !ObjectUtils.isEmptyObjectOrArray(this.responseBodyDoc) ? this.responseBodyDoc : this.requestBodyDoc;
    }

    // Hide operation urls which do not have any actions on them to avoid confusing users. This could happen if we don't have swagger metadata for these operations.
    hideFromExplorerView(): boolean {
        return (this.actions.length === 0) && !this.url.contains("providers", true);
    }

}