/// <reference path="../Content/Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../Content/Scripts/typings/angularjs/angular-animate.d.ts" />
/// <reference path="../Content/Scripts/typings/angularjs/angular-cookies.d.ts" />
/// <reference path="../Content/Scripts/typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../Content/Scripts/typings/angularjs/angular-resource.d.ts" />
/// <reference path="../Content/Scripts/typings/angularjs/angular-route.d.ts" />
/// <reference path="../Content/Scripts/typings/angularjs/angular-sanitize.d.ts" />
/// <reference path="../Content/Scripts/typings/angularjs/angular-scenario.d.ts" />
/// <reference path="../Content/Scripts/typings/angularjs/angular-ui-bootstrap.d.ts" />

interface String {
    startsWith(str: string): boolean;
    endsWith(str: string): boolean;
}

interface Array<T> {
    remove(from: number, to: number);
    getUnique(Function): Array<T>;
}
declare class JSONEditor {
    constructor(args: any);
    get(): any;
    set(any);
    expandAll();
}