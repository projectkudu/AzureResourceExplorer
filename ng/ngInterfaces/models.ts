/// <reference path="../references.ts" />

module managePortalUi {
    "use strict";

    export interface IOperation {
        MethodName: string;
        HttpMethod: string;
        ResponseBody: any;
        Url: string;
    }
} 