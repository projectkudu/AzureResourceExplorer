import {CliResourceType} from "./CliResourceType";
import {ICliResource} from "./ICliResource";

export interface IResourceHandlerResolver {
    getResourceHandler(resType: CliResourceType): ICliResource;
}