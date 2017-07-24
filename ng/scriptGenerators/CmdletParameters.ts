import {ResourceIdentifier} from "./ResourceIdentifier";

export interface CmdletParameters {
    resourceIdentifier: ResourceIdentifier;
    apiVersion: string;
    isCollection: boolean;
}