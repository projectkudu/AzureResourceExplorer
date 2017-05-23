module armExplorer {

    enum ResourceActions {
        PATCH,
        PUT,
        GET,
        CREATE
    }

    enum HttpVerb {
        GET,
        POST,
        DELETE
    }

    function GETPSObjectFromJSON(json: string, nestingLevel: number): string {
        var tabs = "";
        for (var i = 0; i < nestingLevel; i++) {
            tabs += "\t";
        }
        var jsonObj = JSON.parse(json);
        if (typeof jsonObj === "string") {
            return "\"" + jsonObj + "\"";
        }
        else if (typeof jsonObj === "boolean") {
            return jsonObj.toString();
        }
        else if (typeof jsonObj === "number") {
            return jsonObj.toString();
        }
        else if (Array.isArray(jsonObj)) {
            var result = "(\n";
            for (var i = 0; i < jsonObj.length; i++) {
                result += tabs + "\t" + GETPSObjectFromJSON(JSON.stringify(jsonObj[i]), nestingLevel + 1) + "\n";
            }
            return result + tabs + ")";
        }
        else if (typeof jsonObj === "object") {
            var result = "@{\n";
            for (var prop in jsonObj) {
                if (jsonObj.hasOwnProperty(prop)) {
                    result += tabs + "\t" + prop + " = " + GETPSObjectFromJSON(JSON.stringify(jsonObj[prop]), nestingLevel + 1) + "\n";
                }
            }
            return result + tabs + "}\n";
        }
        return json;
    }

    enum RMURLPARTS {
        Protocol,
        Blank,
        DomainName,
        SubscriptionsKey,
        SubscriptionsValue,
        ResourceGroupsKey,
        ResourceGroupsValue, // Urls with length <= ResourceGroupsValue will only include resourceId
        ProviderKey,
        ProviderValue, // start of resourcetype followed by 9(ResourceType1Name) , 11, 13, ... ( 8, 9 will always exist, 11, 13.. is optional)
        ResourceType1Name,
        ResourceType1Value // start of resourcename followed by 12, 14,...(12, 14,... is optional)
    }

    export class ARMUrlParser {
        private originalUrl: string = "";
        private url: string = "";
        private urlParts: Array<string> = [];

        constructor(private value: ISelectHandlerReturn, private actions: IAction[]) {
            this.url = value.url;
            this.originalUrl = value.url;
            if (this.isSecureGet(this.value.httpMethod, this.url)) {
                this.url = this.value.url.replace("/list", ""); // ignore /list since it is not part of resource url
            }
            this.urlParts = this.url.split("/");
        }

        private isSecureGet(httpMethod: string, url: string): boolean {
            // sample url "https://management.azure.com/subscriptions/0000000-0000-0000-0000-0000000000000/resourceGroups/rgrp1/providers/Microsoft.Web/sites/WebApp120170517014339/config/appsettings/list"
            return (httpMethod.toLowerCase() === HttpVerb[HttpVerb.POST].toLowerCase()) && url.toLowerCase().endsWith("/list")
        }

        private hasResourceType(): boolean {
            return this.urlParts.length > RMURLPARTS.ResourceType1Name;
        }

        private hasResourceName(): boolean {
            return this.urlParts.length > RMURLPARTS.ResourceType1Value;
        }

        getAPIVersion(): string {
            return this.value.resourceDefinition.apiVersion;
        }

        getURL(): string {
            return this.value.url;
        }

        getResourceDefinitionChildren(): string|string[] {
            return this.value.resourceDefinition.children;
        }

        getOriginalURL(): string {
            return this.originalUrl;
        }

        getHttpMethod(): string {
            return this.value.httpMethod;
        }

        getActions(): IAction[] {
            return this.actions;
        }

        getResourceActions(): string[]{
            return this.value.resourceDefinition.actions;
        }

        hasResourceProvider(): boolean {
            return this.urlParts.length > RMURLPARTS.ProviderKey;
        }

        isResourceGroupURL(): boolean {
            return this.urlParts.length === (RMURLPARTS.ResourceGroupsKey + 1);
        }

        getResourceIdentifier(): ResourceIdentifier {
            let resourceIdentifier = {} as ResourceIdentifier;

            if (!this.hasResourceType()) {
                // We only have resource Id
                resourceIdentifier.resourceIdentifierType = ResourceIdentifierType.WithIDOnly;
                resourceIdentifier.resourceId = this.url.replace("https://management.azure.com", "");
            }
            else {
                resourceIdentifier.resourceGroup = this.urlParts[RMURLPARTS.ResourceGroupsValue];
                resourceIdentifier.resourceType = this.urlParts[RMURLPARTS.ProviderValue] + "/" + this.urlParts[RMURLPARTS.ResourceType1Name];
                resourceIdentifier.resourceIdentifierType = ResourceIdentifierType.WithGroupType;

                if (this.hasResourceName()) {
                    resourceIdentifier.resourceName = this.urlParts[RMURLPARTS.ResourceType1Value];
                    resourceIdentifier.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
                }
                // check for resource sub types
                for (let i = RMURLPARTS.ResourceType1Value + 1; i < this.urlParts.length; i++) {
                    if (i % 2 == 1) {
                        resourceIdentifier.resourceType += ("/" + this.urlParts[i]);
                    }
                    else {
                        resourceIdentifier.resourceName += ("/" + this.urlParts[i]);
                    }
                }
            }
            return resourceIdentifier;
        }
    }

    export class PsScriptGenerator {
        private script: string = "";
        private actionsIndex: number = 0;
        constructor(private resolver: PSCmdletParameterResolver) {
        }

        private getPrefix(commandInfo: RMCommandInfo): string {
            let prefixString: string = "";
            switch (commandInfo.cmd) {
                case CmdType.Get: {
                    prefixString = '# GET ' + this.resolver.getActionName() + "\n";
                    break;
                }
                case CmdType.NewResourceGroup: {
                    prefixString += '# CREATE ' + this.resolver.getActionName() +"\n";
                    prefixString += '$ResourceLocation = "West US"\n';
                    prefixString += '$ResourceName = "NewresourceGroup"\n\n';
                    break;
                }
                case CmdType.RemoveAction: {
                    prefixString = `# DELETE ${this.resolver.getActionNameFromAction(this.actionsIndex)}\n`;
                    break;
                }
                case CmdType.Set: {
                    prefixString = `# SET ${this.resolver.getActionNameFromList()}\n$PropertiesObject = @{\n\t#Property = value;\n}\n`;
                    break;
                }
                case CmdType.Invoke:
                case CmdType.InvokeAction: {
                    if (commandInfo.isAction) {
                        let currentAction: IAction = this.resolver.getActionParameters(this.actionsIndex);
                        let parametersObject: string = currentAction.requestBody ? (`$ParametersObject = ${GETPSObjectFromJSON(currentAction.requestBody, 0)}\n`) : '';
                        prefixString = `# Action ${this.resolver.getActionNameFromAction(this.actionsIndex)}\n${parametersObject}`;
                    }
                    else {
                        prefixString = `# LIST ${this.resolver.getActionNameFromList()}\n`;
                    }
                    break;
                }
                case CmdType.New: {
                    if (commandInfo.isSetAction) {
                        prefixString = `# SET ${this.resolver.getActionName()}\n$PropertiesObject = @{\n\t#Property = value;\n}\n`;
                    }
                    else {
                        let newName: string = "New" + this.resolver.getResourceName();
                        prefixString = `# CREATE ${this.resolver.getActionName()}\n$ResourceLocation = "West US"\n$ResourceName = "${newName}"\n$PropertiesObject = @{\n\t#Property = value;\n}\n`;
                    }
                    break;
                }
            }
            return prefixString;
        }

        getScript(cmdActionPair: RMCommandInfo): string {
            let cmdParameters = this.resolver.getParameters();
            let currentScript: string = "";
            let scriptPrefix: string = this.getPrefix(cmdActionPair);

            switch (cmdActionPair.cmd) {
                case CmdType.Get: {
                    switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                        case ResourceIdentifierType.WithIDOnly: {
                            if (cmdParameters.isCollection) {
                                currentScript = `${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -IsCollection -ApiVersion ${cmdParameters.apiVersion}`;
                            }
                            else {
                                currentScript = `${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -ApiVersion ${cmdParameters.apiVersion}`;
                            }
                            break;
                        }
                        case ResourceIdentifierType.WithGroupType: {
                            if (cmdParameters.isCollection) {
                                currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -IsCollection -ApiVersion ${cmdParameters.apiVersion}`;
                            }
                            else {
                                currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion}`;
                            }

                            break;
                        }
                        case ResourceIdentifierType.WithGroupTypeName: {

                            if (cmdParameters.isCollection) {
                                currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -IsCollection -ApiVersion ${cmdParameters.apiVersion}`;
                            }
                            else {
                                currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -ApiVersion ${cmdParameters.apiVersion}`;
                            }
                            break;
                        }
                    }
                    break;
                }
                case CmdType.New: {
                    if (cmdActionPair.isSetAction) {
                        switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                            case ResourceIdentifierType.WithIDOnly: {
                                // don't think is possible. 
                                console.log("Attempt to create resource with pre existing id");
                                break;
                            }
                            case ResourceIdentifierType.WithGroupType: {
                                currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                break;
                            }
                        }
                    }
                    else {
                        switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                            case ResourceIdentifierType.WithIDOnly: {
                                // don't think is possible. 
                                console.log("Attempt to create resource with pre existing id");
                                break;
                            }
                            case ResourceIdentifierType.WithGroupType: {
                                currentScript = `${cmdActionPair.cmd} -ResourceName $ResourceName -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                currentScript = `${cmdActionPair.cmd} -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}/$ResourceName" -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                break;
                            }
                        }
                    }
                    break;
                }
                case CmdType.Set: {
                    switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                        case ResourceIdentifierType.WithIDOnly: {
                            currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            break;
                        }
                        case ResourceIdentifierType.WithGroupType: {
                            currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            break;
                        }
                        case ResourceIdentifierType.WithGroupTypeName: {
                            currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            break;
                        }
                    }
                    break;
                }

                case CmdType.RemoveAction: {
                    switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                        case ResourceIdentifierType.WithIDOnly: {
                            currentScript = `${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            break;
                        }
                        case ResourceIdentifierType.WithGroupType: {
                            currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            break;
                        }
                        case ResourceIdentifierType.WithGroupTypeName: {
                            currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            break;
                        }
                    }
                    this.actionsIndex++;
                    break;
                }
                case CmdType.Invoke:
                case CmdType.InvokeAction: {
                    if (cmdActionPair.isAction) {
                        let currentAction: IAction = this.resolver.getActionParameters(this.actionsIndex++);
                        let parameters: string = currentAction.requestBody ? "-Parameters $ParametersObject" : "";

                        switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                            case ResourceIdentifierType.WithIDOnly: {
                                currentScript = `${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -Action ${currentAction.name} ${parameters} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                break;
                            }
                            case ResourceIdentifierType.WithGroupType: {
                                currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -Action ${currentAction.name} ${parameters} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName ${cmdParameters.resourceIdentifier.resourceName} -Action ${currentAction.name} ${parameters} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                break;
                            }
                        }
                    }
                    else {
                        switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                            case ResourceIdentifierType.WithIDOnly: {
                                currentScript = `$resource = ${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -Action list -ApiVersion ${cmdParameters.apiVersion} -Force\n$resource.Properties`
                                break;
                            }
                            case ResourceIdentifierType.WithGroupType: {
                                currentScript = `$resource = ${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -Action list -ApiVersion ${cmdParameters.apiVersion} -Force\n$resource.Properties`
                                break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                currentScript = `$resource = ${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -Action list -ApiVersion ${cmdParameters.apiVersion} -Force\n$resource.Properties`
                                break;
                            }
                        }
                    }
                    break;
                }
                
                case CmdType.NewResourceGroup: {
                    currentScript += `${cmdActionPair.cmd} -Location $ResourceLocation -Name $ResourceName`;
                    break;
                }
            }
            return scriptPrefix + currentScript + "\n\n";
        }
    }

    export class PSCmdletParameterResolver {
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

        getSupportedCommands(): Array<RMCommandInfo> {
            return this.supportedCommands;
        }

        private doGetActionName(url: string): string {
            return url.substr(url.lastIndexOf("/") + 1, url.length - url.lastIndexOf("/") - 1);
        }

        getActionName(): string {
            return this.doGetActionName(this.urlParser.getURL());
        }

        getActionParameters(actionIndex: number): IAction {
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
        private supportsCollection(resourceName: string): boolean{

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

