import {IResourceHandlerResolver} from "../scriptGenerators/IResourceHandlerResolver";
import {ICliResource} from "../scriptGenerators/ICliResource";
import {CliResourceType} from "../scriptGenerators/CliResourceType";

export class MockResourceHandlerResolver implements IResourceHandlerResolver {
    constructor(private resourceHandler: ICliResource) {
    }

    getResourceHandler(resType: CliResourceType): ICliResource {
        return this.resourceHandler;
    }
}