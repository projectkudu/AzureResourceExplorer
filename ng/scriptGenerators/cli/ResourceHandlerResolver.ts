import {IResourceHandlerResolver} from "../IResourceHandlerResolver";
import {ScriptParametersResolver} from "../ScriptParametersResolver";
import {ScriptInternals} from "../ScriptInternals";
import {CliResourceType} from "../CliResourceType";
import {ICliResource} from "../ICliResource";

export class ResourceHandlerResolver implements IResourceHandlerResolver{
    constructor(private resolver: ScriptParametersResolver) {
        ScriptInternals.init();
    }

    public getResourceHandler(resType: CliResourceType): ICliResource {
        const classForResourceType = ScriptInternals.getClassForResourceType(resType, this.resolver);
        return classForResourceType;
//        const resourceClassName = ScriptInternals.getClassName(resType);
//        return new window["armExplorer"][resourceClassName](this.resolver);
    }
}
