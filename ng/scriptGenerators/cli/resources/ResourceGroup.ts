import {GenericResource} from "./GernericResource";
import {ScriptParametersResolver} from "../../ScriptParametersResolver";
import {ResourceAction} from "../../ResourceAction";

export class ResourceGroup extends GenericResource {

    constructor(resolver: ScriptParametersResolver) {
        super(resolver);
    }

    getScript(action: ResourceAction): String {
        let script : string = "";
        switch (action) {
        case ResourceAction.Get:
            script = `az group show --name "${this.resolver.getResourceGroup()}"\n\n`
            break;
        case ResourceAction.NewResourceGroup:
            script = "az group create --location westus --name NewResourceGroupName\n\n";
            break;
        case ResourceAction.Invoke:
            break;
        case ResourceAction.InvokeAction:
            break;
        case ResourceAction.Set:
            script = `az group update --name "${this.resolver.getResourceGroup()}" <properties>\n\n`;
            break;
        case ResourceAction.New:
            break;
        case ResourceAction.RemoveAction:
            script = `az group delete --name "${this.resolver.getResourceGroup()}"\n\n`;
            break;
        default:
            break;
        }

        return script === "" ? super.getScript(action) : script;
    }
}

