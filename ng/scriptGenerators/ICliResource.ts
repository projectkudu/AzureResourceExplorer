import {ResourceAction} from "./ResourceAction";

export interface ICliResource {
    getScript(action: ResourceAction): String;
}