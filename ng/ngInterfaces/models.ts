/// <reference path="../references.ts" />

module managePortalUi {
    "use strict";

    export interface IOperation {
        MethodName: string;
        HttpMethod: string;
        ResponseBody: any;
        RequestBody: any;
        Url: string;
    }
} 