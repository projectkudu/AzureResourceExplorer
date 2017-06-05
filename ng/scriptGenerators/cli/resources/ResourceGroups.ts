module armExplorer {

    export class ResourceGroups extends GenericResource {
        constructor(resolver: ScriptParametersResolver) {
            super(resolver);
        }

        getScript(action: ResourceAction): String {
            let script: string = "";
            switch (action) {
            case ResourceAction.Get:
                script = "az group list\n\n";
                break;
            case ResourceAction.NewResourceGroup:
                script = "az group create --location westus --name NewResourceGroupName\n\n";
                break;
            case ResourceAction.Invoke:
            case ResourceAction.InvokeAction:
            case ResourceAction.Set:
            case ResourceAction.New:
            case ResourceAction.RemoveAction:
            default:
                break;
            }

            return script === "" ? super.getScript(action) : script;
        }
    }

}