import {ResourceDefinition} from "./ResourceDefinition";
import {TreeBranch} from "./TreeBranch";

export interface ISelectHandlerReturn {
    resourceDefinition: ResourceDefinition;
    data: any;
    url: string;
    branch: TreeBranch;
    httpMethod: string;
    error: any;
} 