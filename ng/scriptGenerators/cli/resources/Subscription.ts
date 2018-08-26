module armExplorer {

    export class Subscription extends GenericResource {

        constructor(resolver: ScriptParametersResolver) {
            super(resolver);
        }

        getScript(action: ResourceAction): String {
            let script: string = "";

            switch (action) {
                case ResourceAction.Get:
                    script = `az account show --subscription ${this.resolver.getSubscriptionId()}\n\n`;
                    break;
                case ResourceAction.Invoke:
                case ResourceAction.InvokeAction:
                case ResourceAction.Set:
                case ResourceAction.New:
                case ResourceAction.NewResourceGroup:
                case ResourceAction.RemoveAction:
                default:
                    break;
            }

            return script === "" ? super.getScript(action) : script;
        }
    }

}