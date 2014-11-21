  /// <reference path="../references.ts" />

module managePortalUi {
    "use strict";

    export interface IBaseScope extends ng.IScope {

    }

    export interface IBodyScope extends IBaseScope {
        jsonHtml: string;
        resources: ITreeBranch[];
        treeControl: ITreeControl;
        selectResourceHandler: Function;
        rawData: any;
        show: boolean;
        putUrl: string;
        selectedResource: any;
        loading: boolean;
        expandResourceHandler: Function;
        invokeMethod: Function;
    }
} 