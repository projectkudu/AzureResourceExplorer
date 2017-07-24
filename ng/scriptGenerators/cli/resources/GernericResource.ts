import {ICliResource} from "../../ICliResource";
import {ScriptParametersResolver} from "../../ScriptParametersResolver";
import {ResourceAction} from "../../ResourceAction";

export class GenericResource implements ICliResource {

    constructor(protected resolver: ScriptParametersResolver) {
    }

    getScript(action: ResourceAction): String {
        switch (action) {
        case ResourceAction.Get:
            return `az resource show --id ${this.resolver.getCompleteResourceId()} --api-version ${this.resolver.getParameters().apiVersion}\n\n`;
        case ResourceAction.Invoke:
            return "";
        case ResourceAction.InvokeAction:
            return "";
        case ResourceAction.Set:
            return `az resource update --id ${this.resolver.getCompleteResourceId()} --api-version ${this.resolver.getParameters().apiVersion} --set properties.key=value\n\n`;
        case ResourceAction.New:
        case ResourceAction.NewResourceGroup:
            return `az resource create --id ${this.resolver.getCompleteResourceId()} --api-version ${this.resolver.getParameters().apiVersion} --properties {}\n\n`;
        case ResourceAction.RemoveAction:
            return `az resource delete --id ${this.resolver.getCompleteResourceId()} --api-version ${this.resolver.getParameters().apiVersion}\n\n`;
        default:
            return "";
        }
    }
}
