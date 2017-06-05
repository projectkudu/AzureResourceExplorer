module armExplorer {

    export class ScriptInternals {
        private static classNameMap: Array<[number, string]> = [];
        private static psToCliActionMap: Array<[CmdType, ResourceAction]> = [];
        private static initialized: boolean = false;

        public static init() {
            if (!this.initialized) {
                this.initialized = true;

                this.classNameMap.push([CliResourceType.Subscriptions, "Subscriptions"]);
                this.classNameMap.push([CliResourceType.Subscription, "Subscription"]);
                this.classNameMap.push([CliResourceType.SubscriptionLocations, "SubscriptionLocations"]);
                this.classNameMap.push([CliResourceType.ResourceGroups, "ResourceGroups"]);
                this.classNameMap.push([CliResourceType.ResourceGroup, "ResourceGroup"]);
                this.classNameMap.push([CliResourceType.WebApps, "WebApps"]);
                this.classNameMap.push([CliResourceType.WebApp, "WebApp"]);
                this.classNameMap.push([CliResourceType.GenericResource, "GenericResource"]);

                this.psToCliActionMap.push([CmdType.Get, ResourceAction.Get]);
                this.psToCliActionMap.push([CmdType.Invoke, ResourceAction.Invoke]);
                this.psToCliActionMap.push([CmdType.InvokeAction, ResourceAction.InvokeAction]);
                this.psToCliActionMap.push([CmdType.Set, ResourceAction.Set]);
                this.psToCliActionMap.push([CmdType.New, ResourceAction.New]);
                this.psToCliActionMap.push([CmdType.RemoveAction, ResourceAction.RemoveAction]);
                this.psToCliActionMap.push([CmdType.NewResourceGroup, ResourceAction.NewResourceGroup]);
            }
        }

        public static getClassName(resType: CliResourceType): string {
            return this.classNameMap.find(item => item[0] === resType)[1];
        }

        public static getCliResourceType(cmdType: CmdType): ResourceAction {
            return this.psToCliActionMap.find(item => item[0] === cmdType)[1];
        }
    }

    export function getAzureCliScriptsForResource(value: ISelectHandlerReturn) {
        const parser: ARMUrlParser = new ARMUrlParser(value, []);
        const resolver: ScriptParametersResolver = new ScriptParametersResolver(parser);
        const resourceHandlerResolver: ResourceHandlerResolver = new ResourceHandlerResolver(resolver);
        const scriptGenerator: CliScriptGenerator = new CliScriptGenerator(resolver, resourceHandlerResolver);
        return scriptGenerator.getScript();
    }

    export function getPowerShellScriptsForResource(value: ISelectHandlerReturn, actions: IAction[]): string {
        var script = "# PowerShell equivalent script\n\n";
        let urlParser = new ARMUrlParser(value, actions);
        let parameterResolver = new ScriptParametersResolver(urlParser);
        let scriptGenerator = new PowerShellScriptGenerator(parameterResolver);
        for (let cmd of parameterResolver.getSupportedCommands()) {
            script += scriptGenerator.getScript(cmd);
        }
        return script;
    }
}

// converts an array of string pairs into dictionary
function strEnum<T extends string>(strings: Array<Array<T>>): {[K in T]: K} {
    return strings.reduce((res, key) => {
        res[key[0]] = key[1];
        return res;
    }, Object.create(null));
}

const CmdType = strEnum([
    ["Get", "Get-AzureRmResource"],
    ["Invoke", "Invoke-AzureRmResourceAction"],
    ["InvokeAction", "Invoke-AzureRmResourceAction"],
    ["Set", "Set-AzureRmResource"],
    ["New", "New-AzureRmResource"],
    ["RemoveAction", "Remove-AzureRmResource"],
    ["NewResourceGroup", "New-AzureRmResourceGroup"]
]);

type CmdType = keyof typeof CmdType;

interface RMCommandInfo {
    cmd: CmdType;
    isAction: boolean;
    isSetAction: boolean;
}

module armExplorer {

    export enum CliResourceType {
        Subscriptions, Subscription, SubscriptionLocations, ResourceGroups, ResourceGroup, WebApps, WebApp, GenericResource
    }    

    export enum ResourceIdentifierType {
        WithIDOnly,
        WithGroupType,
        WithGroupTypeName
    }

    export interface ResourceIdentifier {
        resourceIdentifierType: ResourceIdentifierType;
        resourceName: string;
        resourceType: string;
        resourceGroup: string;
        resourceId: string;
    }

    export interface CmdletParameters {
        resourceIdentifier: ResourceIdentifier;
        apiVersion: string;
        isCollection: boolean;
    }

    export interface ICliCommandAction {
        actionName: String;
        parameters: String[];
        applicableSubItems: Array<String>;
    }

    export enum ResourceAction {
        Get, Invoke, InvokeAction, Set, New, RemoveAction, NewResourceGroup
    }

    export interface ICliResource {
        getScript(action: ResourceAction): String;
    }

    export interface IResourceHandlerResolver {
        getResourceHandler(resType: CliResourceType): ICliResource;
    }

    export enum ResourceActions {
        PATCH,
        PUT,
        GET,
        CREATE
    }

    export enum HttpVerb {
        GET,
        POST,
        DELETE
    }
}
