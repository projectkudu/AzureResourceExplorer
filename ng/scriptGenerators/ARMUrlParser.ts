import {HttpVerbs} from "./HttpVerbs";
import {ResourceIdentifier} from "./ResourceIdentifier";
import {ResourceIdentifierType} from "./ResourceIdentifierType";
import {ARMUrlParts} from "./ARMUrlParts";
import {ISelectHandlerReturn} from "../models/ISelectHandlerReturn";
import {Action} from "../models/Action";

export class ARMUrlParser {
    private originalUrl: string = "";
    private url: string = "";
    private urlParts: Array<string> = [];

    constructor(private value: ISelectHandlerReturn, private actions: Action[]) {
        this.url = value.url;
        this.originalUrl = value.url;
        if (this.isSecureGet(this.value.httpMethod, this.url)) {
            this.url = this.value.url.replace("/list", ""); // ignore /list since it is not part of resource url
        }
        this.urlParts = this.url.split("/");
    }

    private isSecureGet(httpMethod: string, url: string): boolean {
        // sample url "https://management.azure.com/subscriptions/0000000-0000-0000-0000-0000000000000/resourceGroups/rgrp1/providers/Microsoft.Web/sites/WebApp120170517014339/config/appsettings/list"
        return (httpMethod.toUpperCase() === HttpVerbs.Post) && url.toLowerCase().endsWith("/list");
    }

    private hasResourceType(): boolean {
        return this.urlParts.length > ARMUrlParts.ResourceType1Name;
    }

    private hasResourceName(): boolean {
        return this.urlParts.length > ARMUrlParts.ResourceType1Value;
    }

    getSubscriptionId(): string {
        return this.urlParts[ARMUrlParts.SubscriptionsValue];
    }

    getResourceGroup(): string {
        return this.urlParts[ARMUrlParts.ResourceGroupsValue];
    }

    getAPIVersion(): string {
        return this.value.resourceDefinition.apiVersion;
    }

    getURL(): string {
        return this.value.url;
    }

    getResourceDefinitionChildren(): string | string[] {
        return this.value.resourceDefinition.children;
    }

    getOriginalURL(): string {
        return this.originalUrl;
    }

    getHttpMethod(): string {
        return this.value.httpMethod;
    }

    getActions(): Action[] {
        return this.actions;
    }

    getResourceActions(): string[] {
        return this.value.resourceDefinition.actions;
    }

    hasResourceProvider(): boolean {
        return this.urlParts.length > ARMUrlParts.ProviderKey;
    }

    isResourceGroupURL(): boolean {
        return this.urlParts.length === (ARMUrlParts.ResourceGroupsKey + 1);
    }

    getResourceIdentifier(): ResourceIdentifier {
        let resourceIdentifier = {} as ResourceIdentifier;

        if (!this.hasResourceType()) {
            // We only have resource Id
            resourceIdentifier.resourceIdentifierType = ResourceIdentifierType.WithIDOnly;
            resourceIdentifier.resourceId = this.url.replace("https://management.azure.com", "");
        }
        else {
            resourceIdentifier.resourceGroup = this.urlParts[ARMUrlParts.ResourceGroupsValue];
            resourceIdentifier.resourceType = this.urlParts[ARMUrlParts.ProviderValue] + "/" + this.urlParts[ARMUrlParts.ResourceType1Name];
            resourceIdentifier.resourceIdentifierType = ResourceIdentifierType.WithGroupType;

            if (this.hasResourceName()) {
                resourceIdentifier.resourceName = this.urlParts[ARMUrlParts.ResourceType1Value];
                resourceIdentifier.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
            }
            // check for resource sub types
            for (let i = ARMUrlParts.ResourceType1Value + 1; i < this.urlParts.length; i++) {
                if (i % 2 === 1) {
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

