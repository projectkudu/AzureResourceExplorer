import {Action} from "./Action";

export interface ISelectedResource {
    url: string;
    actionsAndVerbs: Action[];
    httpMethods: string[];
    doc: any[];
    apiVersion: string;
    putUrl: string;
}