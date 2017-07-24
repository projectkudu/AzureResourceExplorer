import {ScriptParametersResolver} from "../ScriptParametersResolver";
import {RMCommandInfo} from "../RMCommandInfo";
import {ResourceIdentifierType} from "../ResourceIdentifierType";
import {PsCmdType} from "../PSCmdType";
import {ObjectUtils} from "../../common/ObjectUtils";
import {Action} from "../../models/Action";

export class PowerShellScriptGenerator {
    private script: string = "";
    private actionsIndex: number = 0;
    constructor(private resolver: ScriptParametersResolver) {
    }

    private getPrefix(commandInfo: RMCommandInfo): string {
        let prefixString: string = "";
        switch (commandInfo.cmd) {
            case PsCmdType.Get: {
                prefixString = '# GET ' + this.resolver.getActionName() + "\n";
                break;
            }
            case PsCmdType.NewResourceGroup: {
                prefixString += '# CREATE ' + this.resolver.getActionName() +"\n";
                prefixString += '$ResourceLocation = "West US"\n';
                prefixString += '$ResourceName = "NewresourceGroup"\n\n';
                break;
            }
            case PsCmdType.RemoveAction: {
                prefixString = `# DELETE ${this.resolver.getActionNameFromAction(this.actionsIndex)}\n`;
                break;
            }
            case PsCmdType.Set: {
                prefixString = `# SET ${this.resolver.getActionNameFromList()}\n$PropertiesObject = @{\n\t#Property = value;\n}\n`;
                break;
            }
            case PsCmdType.Invoke:
            case PsCmdType.InvokeAction: {
                if (commandInfo.isAction) {
                    let currentAction: Action = this.resolver.getActionParameters(this.actionsIndex);
                    let parametersObject: string = currentAction.requestBody ? (`$ParametersObject = ${ObjectUtils.getPsObjectFromJson(currentAction.requestBody, 0)}\n`) : '';
                    prefixString = `# Action ${this.resolver.getActionNameFromAction(this.actionsIndex)}\n${parametersObject}`;
                }
                else {
                    prefixString = `# LIST ${this.resolver.getActionNameFromList()}\n`;
                }
                break;
            }
            case PsCmdType.New: {
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
            case PsCmdType.Get: {
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
            case PsCmdType.New: {
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
            case PsCmdType.Set: {
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

            case PsCmdType.RemoveAction: {
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
            case PsCmdType.Invoke:
            case PsCmdType.InvokeAction: {
                if (cmdActionPair.isAction) {
                    let currentAction: Action = this.resolver.getActionParameters(this.actionsIndex++);
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
                
            case PsCmdType.NewResourceGroup: {
                currentScript += `${cmdActionPair.cmd} -Location $ResourceLocation -Name $ResourceName`;
                break;
            }
        }
        return scriptPrefix + currentScript + "\n\n";
    }
}


