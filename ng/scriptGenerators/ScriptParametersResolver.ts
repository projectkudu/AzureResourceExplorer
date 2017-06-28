module armExplorer {

    export class ScriptParametersResolver {
        private supportedCommands: RMCommandInfo[] = [];

        constructor(private urlParser: ARMUrlParser) {
            this.fillSupportedCommands();
        }

        private fillSupportedCommands() {
            let resourceActions = this.urlParser.getResourceActions();

            // add GET related cmdlet
            if (this.urlParser.getHttpMethod().contains(HttpVerb[HttpVerb.GET], true)) {
                this.supportedCommands.push({ cmd: CmdType.Get, isAction: false, isSetAction: false });
            }
            else if (this.urlParser.getHttpMethod().contains(HttpVerb[HttpVerb.POST], true) && this.urlParser.getOriginalURL().contains("list", true)) {
                this.supportedCommands.push({ cmd: CmdType.Invoke, isAction: false, isSetAction: false });
            }

            // add SET related cmdlet
            if (resourceActions.some(a => (a.toUpperCase() === ResourceActions[ResourceActions.PATCH] || a.toUpperCase() === ResourceActions[ResourceActions.PUT]))) {
                if (resourceActions.includes(ResourceActions[ResourceActions.GET])) {
                    this.supportedCommands.push({ cmd: CmdType.Set, isAction: false, isSetAction: true });
                }
                else {
                    this.supportedCommands.push({ cmd: CmdType.New, isAction: false, isSetAction: true });
                }
            }

            // add create related cmdlet
            if (resourceActions.includes(ResourceActions[ResourceActions.CREATE])) {
                if (this.urlParser.isResourceGroupURL()) {
                    this.supportedCommands.push({ cmd: CmdType.NewResourceGroup, isAction: false, isSetAction: false });
                }
                else {
                    this.supportedCommands.push({ cmd: CmdType.New, isAction: false, isSetAction: false });
                }
            }

            // add actions
            if (this.urlParser.getActions().length > 0) {
                this.urlParser.getActions().forEach(action => {
                    if (action.httpMethod.toUpperCase() === HttpVerb[HttpVerb.DELETE]) {
                        this.supportedCommands.push({ cmd: CmdType.RemoveAction, isAction: true, isSetAction: false });
                    }
                    else if (action.httpMethod.toUpperCase() === HttpVerb[HttpVerb.POST]) {
                        this.supportedCommands.push({ cmd: CmdType.InvokeAction, isAction: true, isSetAction: false });
                    }
                });
            }
        }

        getResourceGroup(): string {
            return this.urlParser.getResourceGroup();
        }

        getSubscriptionId(): string {
            return this.urlParser.getSubscriptionId();
        }

        getCompleteResourceId(): string {
            return this.urlParser.getOriginalURL().substring(this.urlParser.getOriginalURL().indexOf("/subscriptions"));
        }

        getSupportedCommands(): Array<RMCommandInfo> {
            return this.supportedCommands;
        }

        private doGetActionName(url: string): string {
            return url.substr(url.lastIndexOf("/") + 1, url.length - url.lastIndexOf("/") - 1);
        }

        getActionName(): string {
            return this.doGetActionName(this.urlParser.getURL());
        }

        getActionParameters(actionIndex: number): Action {
            return this.urlParser.getActions()[actionIndex];
        }

        getActionNameFromAction(actionIndex: number): string {
            return this.doGetActionName(this.getActionParameters(actionIndex).url);
        }

        getActionNameFromList(): string {
            return this.doGetActionName(this.urlParser.getURL().replace("/list", ""));
        }

        getResourceName(): string {
            return this.urlParser.getURL().substr(this.urlParser.getURL().lastIndexOf("/") + 1, this.urlParser.getURL().length - this.urlParser.getURL().lastIndexOf("/") - 2);
        }

        // Applicable only for Get-AzureRmResource
        private supportsCollection(resourceName: string): boolean {

            // -IsCollection will force Get-AzureRmResource to query RP instead of the cache. 
            // But when ResourceName is available Get-AzureRmResource will always hit RP so skip -IsCollection flag.

            // children are either an array or a string
            // if array
            //      Predefined list of options. Like Providers or (config, appsettings, etc)
            // else if string
            //      this means it's a Url that we need to go fetch and display.
            return !!(!resourceName && (typeof this.urlParser.getResourceDefinitionChildren() === "string")) && this.urlParser.hasResourceProvider();
        }

        getParameters(): CmdletParameters {
            let cmd = {} as CmdletParameters;
            cmd.apiVersion = this.urlParser.getAPIVersion();
            cmd.resourceIdentifier = this.urlParser.getResourceIdentifier();
            cmd.isCollection = this.supportsCollection(cmd.resourceIdentifier.resourceName);
            return cmd;
        }
    }

}