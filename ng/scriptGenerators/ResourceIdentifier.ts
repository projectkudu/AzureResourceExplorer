import {ResourceIdentifierType} from "./ResourceIdentifierType";

export interface ResourceIdentifier {
    resourceIdentifierType: ResourceIdentifierType;
    resourceName: string;
    resourceType: string;
    resourceGroup: string;
    resourceId: string;
}