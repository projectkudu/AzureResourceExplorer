module armExplorer {

    export class WebApps extends GenericResource {

        constructor(resolver: ScriptParametersResolver) {
            super(resolver);
        }

        getScript(action: ResourceAction): String {
            let script : string = "";
            switch (action) {
            case ResourceAction.Get:
                script = `az webapp list --resource-group "${this.resolver.getResourceGroup()}"\n\n`
                break;
            case ResourceAction.NewResourceGroup:
                break;
            case ResourceAction.Invoke:
                break;
            case ResourceAction.InvokeAction:
                break;
            case ResourceAction.Set:
                break;
            case ResourceAction.New:
                script = `az webapp create --resource-group "${this.resolver.getResourceGroup()}" --plan planName --name NewWebAppName\n\n`;
                break;
            case ResourceAction.RemoveAction:
                break;
            default:
                break;
            }

            return script === "" ? super.getScript(action) : script;
        }
    }

}