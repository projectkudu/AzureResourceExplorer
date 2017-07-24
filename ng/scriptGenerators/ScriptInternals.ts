import {PsCmdType} from "./PSCmdType";
import {ResourceAction} from "./ResourceAction";
import {CliResourceType} from "./CliResourceType";
import {GenericResource} from "./cli/resources/GernericResource";
import {Subscriptions} from "./cli/resources/Subscriptions";
import {ICliResource} from "./ICliResource";
import {Subscription} from "./cli/resources/Subscription";
import {SubscriptionLocations} from "./cli/resources/SubscriptionLocations";
import {ResourceGroups} from "./cli/resources/ResourceGroups";
import {ResourceGroup} from "./cli/resources/ResourceGroup";
import {WebApps} from "./cli/resources/WebApps";
import {WebApp} from "./cli/resources/WebApp";
import {ScriptParametersResolver} from "./ScriptParametersResolver";

export class ScriptInternals {
    private static classNameMap: Array<[number, string]> = [];
    private static psToCliActionMap: Array<[PsCmdType, ResourceAction]> = [];
    private static initialized: boolean = false;

    private static classForResourceType: Map<CliResourceType, typeof GenericResource>;

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

            this.psToCliActionMap.push([PsCmdType.Get, ResourceAction.Get]);
            this.psToCliActionMap.push([PsCmdType.Invoke, ResourceAction.Invoke]);
            this.psToCliActionMap.push([PsCmdType.InvokeAction, ResourceAction.InvokeAction]);
            this.psToCliActionMap.push([PsCmdType.Set, ResourceAction.Set]);
            this.psToCliActionMap.push([PsCmdType.New, ResourceAction.New]);
            this.psToCliActionMap.push([PsCmdType.RemoveAction, ResourceAction.RemoveAction]);
            this.psToCliActionMap.push([PsCmdType.NewResourceGroup, ResourceAction.NewResourceGroup]);

            this.classForResourceType = new Map<CliResourceType, typeof GenericResource>();
            this.classForResourceType.set(CliResourceType.Subscriptions, Subscriptions);
            this.classForResourceType.set(CliResourceType.Subscription, Subscription);
            this.classForResourceType.set(CliResourceType.SubscriptionLocations, SubscriptionLocations);
            this.classForResourceType.set(CliResourceType.ResourceGroups, ResourceGroups);
            this.classForResourceType.set(CliResourceType.ResourceGroup, ResourceGroup);
            this.classForResourceType.set(CliResourceType.WebApps, WebApps);
            this.classForResourceType.set(CliResourceType.WebApp, WebApp);
            this.classForResourceType.set(CliResourceType.GenericResource, GenericResource);
        }
    }

//    public static getClassName(resType: CliResourceType): string {
//        return this.classNameMap.find(item => item[0] === resType)[1];
//    }

    public static getCliResourceType(cmdType: PsCmdType): ResourceAction {
        return this.psToCliActionMap.find(item => item[0] === cmdType)[1];
    }

    public static getClassForResourceType(resType: CliResourceType, resolver: ScriptParametersResolver): GenericResource {
        const handler: typeof GenericResource = this.classForResourceType.get(resType);
        return new handler(resolver);
    }
}