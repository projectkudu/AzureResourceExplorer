import {ResourceDefinition} from "../models/ResourceDefinition";

export class ClientConfig {

    // Define any overrides for display label and sort key/order for tree nodes
    // Rule matching is performing by checking whether the childDefinition.url ends with the childDefinitionUrlSuffix
    //  - getLabel is called to provide the node label. Provide a function that takes the node data and csmName and returns the label
    //  - getSortKey is called to provide the node sort key. Provide a function that takes the node data and label and returns the sort key
    //  - sortOrder: 1 to sort ascending, -1 to sort descending
    static treeBranchDataOverrides: ITreeBranchDataOverrides[] =
         [
            {
                childDefinitionUrlSuffix: "providers/Microsoft.Resources/deployments/{name}", // deployments
                getLabel: null,
                getSortKey: (d: any, label: string) => d.properties.timestamp,
                getIconNameOverride: (d: any) => {
                    switch (d.properties.provisioningState) {
                    case "Succeeded": return "glyphicon glyphicon-ok-circle";
                    case "Running": return "glyphicon glyphicon-play-circle";
                    case "Failed": return "glyphicon glyphicon-remove-circle";
                    default: return null;
                    }
                },
                sortOrder: -1
            },
            {
                childDefinitionUrlSuffix: "providers/Microsoft.Resources/deployments/{name}/operations/{name}", // operations
                getLabel: (d: any, csmName: string) => {
                    if (d.properties.targetResource !== undefined && d.properties.targetResource.resourceName !== undefined) {
                        return d.properties.targetResource.resourceName + " (" + d.properties.targetResource.resourceType + ")";
                    } else {
                        return d.properties.provisioningOperation + " (" + d.operationId + ")"
                    }
                },
                getSortKey: (d: any, label: string) => d.properties.timestamp,
                getIconNameOverride: (d: any) => {
                    switch (d.properties.provisioningState) {
                    case "Succeeded": return "glyphicon glyphicon-ok-circle";
                    case "Running": return "glyphicon glyphicon-play-circle";
                    case "Failed": return "glyphicon glyphicon-remove-circle";
                    default: return null;
                    }
                },
                sortOrder: -1
            }
    ];

    static getOverrideFor(childDefinition: ResourceDefinition): ITreeBranchDataOverrides {
        const overrides = ClientConfig.treeBranchDataOverrides.filter(t => childDefinition.url.endsWith(t.childDefinitionUrlSuffix));

        const override = overrides.length > 0
            ? overrides[0]
            : {
                childDefinitionUrlSuffix: null,
                getLabel: null,
                getSortKey: null,
                getIconNameOverride: null,
                sortOrder: 1
            };
        return override;
    }

    static aceConfig = {
        mode: "json",
        theme: "tomorrow",
        onLoad: (_ace) => {
            _ace.setOptions({
                maxLines: Infinity,
                fontSize: 15,
                wrap: "free",
                showPrintMargin: false
            });
            _ace.resize();
        }
    };
    
}