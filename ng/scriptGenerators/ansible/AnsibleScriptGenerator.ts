module armExplorer {

    export class AnsibleScriptGenerator {
        private script: string = "";
        private actionsIndex: number = 0;
        constructor(private resolver: ScriptParametersResolver) {
        }

        private getPrefix(commandInfo: RMCommandInfo): string {
            let prefixString: string = "";
            switch (commandInfo.cmd) {
                case CmdType.Get: {
                    prefixString += '- name: GET ' + this.resolver.getActionName() + '\n';
                    prefixString += '  azure_rm_resource_facts:\n';
                    break;
                }
                case CmdType.NewResourceGroup: {
                    prefixString += '- name: CREATE ' + this.resolver.getActionName() + '\n';
                    prefixString += '  azure_rm_resource:\n';
                    
                    prefixString += '$ResourceLocation = "West US"\n';
                    prefixString += '$ResourceName = "NewresourceGroup"\n\n';
                    break;
                }
                case CmdType.RemoveAction: {
                    prefixString += '- name: DELETE' + this.resolver.getActionNameFromAction(this.actionsIndex) + '\n';
                    prefixString += '  azure_rm_resource:\n';
                    break;
                }
                case CmdType.Set: {
                    prefixString += '- name: SET ' + this.resolver.getActionNameFromList() + '\n';
                    prefixString += '  azure_rm_resource:\n';

                    // XXX - fix this
                    prefixString += '$PropertiesObject = @{\n\t#Property = value;\n}\n';
                    break;
                }
                case CmdType.Invoke:
                case CmdType.InvokeAction: {
                    if (commandInfo.isAction) {
                        let currentAction: Action = this.resolver.getActionParameters(this.actionsIndex);
                        let parametersObject: string = currentAction.requestBody ? (`$ParametersObject = ${ObjectUtils.getPsObjectFromJson(currentAction.requestBody, 0)}\n`) : '';
                        prefixString += `- name: Action ${this.resolver.getActionNameFromAction(this.actionsIndex)}\n${parametersObject}`;
                        prefixString += '  azure_rm_resource:\n';
                    }
                    else {
                        prefixString += '- name: LIST ' + this.resolver.getActionNameFromList() + '\n';
                        prefixString += '  azure_rm_resource:\n';
                    }
                    break;
                }
                case CmdType.New: {
                    if (commandInfo.isSetAction) {
                        prefixString += `- name: SET ${this.resolver.getActionName()}\n$PropertiesObject = @{\n\t#Property = value;\n}\n`;
                        prefixString += '  azure_rm_resource:\n';
                    }
                    else {
                        let newName: string = "New" + this.resolver.getResourceName();
                        prefixString += '- name: CREATE ' + this.resolver.getActionName() + '\n';
                        prefixString += '$ResourceLocation = "West US"\n';
                        prefixString += '$ResourceName = "${newName}"\n';
                        prefixString += '$PropertiesObject = @{ \n\t#Property = value; \n }\n';
                        prefixString += '  azure_rm_resource:\n';
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
                                //currentScript = `${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -IsCollection -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    uri: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                            }
                            else {
                                //currentScript = `${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    uri: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                            }
                            break;
                        }
                        case ResourceIdentifierType.WithGroupType: {
                            if (cmdParameters.isCollection) {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -IsCollection -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                            }
                            else {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                            }

                            break;
                        }
                        case ResourceIdentifierType.WithGroupTypeName: {

                            if (cmdParameters.isCollection) {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -IsCollection -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                            }
                            else {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
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
                                //currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                //currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
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
                                //currentScript = `${cmdActionPair.cmd} -ResourceName $ResourceName -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                //currentScript = `${cmdActionPair.cmd} -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}/$ResourceName" -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                break;
                            }
                        }
                    }
                    break;
                }
                case CmdType.Set: {
                    switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                        case ResourceIdentifierType.WithIDOnly: {
                            //currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "    uri: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                            break;
                        }
                        case ResourceIdentifierType.WithGroupType: {
                            //currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                            break;
                        }
                        case ResourceIdentifierType.WithGroupTypeName: {
                            //currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                            break;
                        }
                    }
                    break;
                }

                case CmdType.RemoveAction: {
                    switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                        case ResourceIdentifierType.WithIDOnly: {
                            //currentScript = `${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "    uri: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                            currentScript += "    state: absent\n";

                            break;
                        }
                        case ResourceIdentifierType.WithGroupType: {
                            //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                            currentScript += "    state: absent\n";
                            break;
                        }
                        case ResourceIdentifierType.WithGroupTypeName: {
                            //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                            currentScript += "    state: absent\n";
                            break;
                        }
                    }
                    this.actionsIndex++;
                    break;
                }
                case CmdType.Invoke:
                case CmdType.InvokeAction: {
                    if (cmdActionPair.isAction) {
                        let currentAction: Action = this.resolver.getActionParameters(this.actionsIndex++);
                        let parameters: string = currentAction.requestBody ? "-Parameters $ParametersObject" : "";

                        switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                            case ResourceIdentifierType.WithIDOnly: {
                                //currentScript = `${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -Action ${currentAction.name} ${parameters} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    uri: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                                break;
                            }
                            case ResourceIdentifierType.WithGroupType: {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -Action ${currentAction.name} ${parameters} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName ${cmdParameters.resourceIdentifier.resourceName} -Action ${currentAction.name} ${parameters} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                break;
                            }
                        }
                    }
                    else {
                        switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                            case ResourceIdentifierType.WithIDOnly: {
                                //currentScript = `$resource = ${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -Action list -ApiVersion ${cmdParameters.apiVersion} -Force\n$resource.Properties`
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    uri: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                                break;
                            }
                            case ResourceIdentifierType.WithGroupType: {
                                //currentScript = `$resource = ${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -Action list -ApiVersion ${cmdParameters.apiVersion} -Force\n$resource.Properties`
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                //currentScript = `$resource = ${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -Action list -ApiVersion ${cmdParameters.apiVersion} -Force\n$resource.Properties`
                                currentScript += "    api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "    resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
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

}

