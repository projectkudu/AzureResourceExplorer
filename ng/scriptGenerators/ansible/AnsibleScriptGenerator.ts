module armExplorer {

    export class AnsibleScriptGenerator {
        private script: string = "";
        private actionsIndex: number = 0;
        private resourceDefinition: any = {};
        constructor(private resolver: ScriptParametersResolver, resourceDefinition: any) {
            this.resourceDefinition = resourceDefinition;
        }

        getScript(cmdActionPair: RMCommandInfo): string {
            let cmdParameters = this.resolver.getParameters();
            let currentScript: string = "";
            
            currentScript += "- hosts: localhost\n";
            currentScript += "  tasks:\n";


            switch (cmdActionPair.cmd) {
                case CmdType.Get: {
                    currentScript += '    - name: GET ' + this.resolver.getActionName() + '\n';
                    currentScript += '      azure_rm_resource_facts:\n';
                    switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                        case ResourceIdentifierType.WithIDOnly: {
                            if (cmdParameters.isCollection) {
                                //currentScript = `${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -IsCollection -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        url: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                            }
                            else {
                                //currentScript = `${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        url: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                            }
                            break;
                        }
                        case ResourceIdentifierType.WithGroupType: {
                            if (cmdParameters.isCollection) {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -IsCollection -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                            }
                            else {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                            }

                            break;
                        }
                        case ResourceIdentifierType.WithGroupTypeName: {

                            if (cmdParameters.isCollection) {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -IsCollection -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                                currentScript += "        resource_name: '" + cmdParameters.resourceIdentifier.resourceName + "'\n";
                            }
                            else {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -ApiVersion ${cmdParameters.apiVersion}`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                                currentScript += "        resource_name: '" + cmdParameters.resourceIdentifier.resourceName + "'\n";
                            }
                            break;
                        }
                    }
                    break;
                }
                case CmdType.New: {
                    // XXX - resolve this
                    //$PropertiesObject = @{ \n\t#Property = value; \n }\n`;

                    if (cmdActionPair.isSetAction) {
                        currentScript += '    - name: SET ' + this.resolver.getActionName() + '\n';
                        currentScript += '      azure_rm_resource:\n';

                        switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                            case ResourceIdentifierType.WithIDOnly: {
                                // don't think is possible. 
                                console.log("Attempt to create resource with pre existing id");
                                break;
                            }
                            case ResourceIdentifierType.WithGroupType: {
                                //currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                                  break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                //currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                                currentScript += "        resource_name: '" + cmdParameters.resourceIdentifier.resourceName + "'\n";
                                break;
                            }
                        }
                    }
                    else {
                        let newName: string = "New" + this.resolver.getResourceName();
                        currentScript += '    - name: CREATE ' + this.resolver.getActionName() + '\n';
                        currentScript += '      azure_rm_resource:\n';
                        // XXX - resolve this
                        //prefixString += '$ResourceLocation = "West US"\n';
                        //prefixString += '$ResourceName = "${newName}"\n';
                        //prefixString += '$PropertiesObject = @{ \n\t#Property = value; \n }\n';

                        switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                            case ResourceIdentifierType.WithIDOnly: {
                                // don't think is possible. 
                                console.log("Attempt to create resource with pre existing id");
                                break;
                            }
                            case ResourceIdentifierType.WithGroupType: {
                                //currentScript = `${cmdActionPair.cmd} -ResourceName $ResourceName -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                                break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                //currentScript = `${cmdActionPair.cmd} -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}/$ResourceName" -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                                currentScript += "        resource_name: '" + cmdParameters.resourceIdentifier.resourceName + "'\n";
                                break;
                            }
                        }

                        // append actual structure of request body
                        if (this.resourceDefinition.requestBody) {
                            currentScript += "        body:\n";
                            currentScript += this.yamlFromObject(this.resourceDefinition.requestBody, "          ");
                        }
                    }
                    break;
                }
                case CmdType.Set: {

                    currentScript += '    - name: SET ' + this.resolver.getActionNameFromList() + '\n';
                    currentScript += '      azure_rm_resource:\n';

                    // XXX - fix this
                    //prefixString += '$PropertiesObject = @{\n\t#Property = value;\n}\n';

                    switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                        case ResourceIdentifierType.WithIDOnly: {
                            //currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "        url: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                            break;
                        }
                        case ResourceIdentifierType.WithGroupType: {
                            //currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                            currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                            currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                            break;
                        }
                        case ResourceIdentifierType.WithGroupTypeName: {
                            //currentScript = `${cmdActionPair.cmd} -PropertyObject $PropertiesObject -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -ApiVersion ${cmdParameters.apiVersion} -Force`;
                            currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                            currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                            currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                            currentScript += "        resource_name: '" + cmdParameters.resourceIdentifier.resourceName + "'\n";
                            break;
                        }
                    }

                    // append actual structure of request body
                    if (this.resourceDefinition.requestBody) {
                        currentScript += "        body:\n";
                        currentScript += this.yamlFromObject(this.resourceDefinition.requestBody, "          ");
                    }

                    break;
                }

                case CmdType.RemoveAction: {
                    // TODO: consider -force
                    currentScript += '    - name: DELETE ' + this.resolver.getActionNameFromAction(this.actionsIndex) + '\n';
                    currentScript += '      azure_rm_resource:\n';
                    switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                        case ResourceIdentifierType.WithIDOnly: {
                            currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "        url: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                            currentScript += "        state: absent\n";
                            break;
                        }
                        case ResourceIdentifierType.WithGroupType: {
                            currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                            currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                            currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                            currentScript += "        state: absent\n";
                            break;
                        }
                        case ResourceIdentifierType.WithGroupTypeName: {
                            currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                            currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                            currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                            currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                            currentScript += "        resource_name: '" + cmdParameters.resourceIdentifier.resourceName + "'\n";
                            currentScript += "        state: absent\n";
                            break;
                        }
                    }
                    this.actionsIndex++;
                    break;
                }
                case CmdType.Invoke:
                case CmdType.InvokeAction: {
                    if (cmdActionPair.isAction) {
                        currentScript += '    - name: Action ${this.resolver.getActionNameFromAction(this.actionsIndex)}\n';
                        currentScript += '      azure_rm_resource:\n';

                        let currentAction: Action = this.resolver.getActionParameters(this.actionsIndex++);
                        let parameters: string = currentAction.requestBody ? "-Parameters $ParametersObject" : "";

                        // XXX - resolve this
                        //let currentAction: Action = this.resolver.getActionParameters(this.actionsIndex);
                        //let parametersObject: string = currentAction.requestBody ? (`$ParametersObject = ${ObjectUtils.getPsObjectFromJson(currentAction.requestBody, 0)}\n`) : '';
                        //prefixString += '${ parametersObject }';

                        switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                            case ResourceIdentifierType.WithIDOnly: {
                                //currentScript = `${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -Action ${currentAction.name} ${parameters} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        url: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                                break;
                            }
                            case ResourceIdentifierType.WithGroupType: {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -Action ${currentAction.name} ${parameters} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                                  break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                //currentScript = `${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName ${cmdParameters.resourceIdentifier.resourceName} -Action ${currentAction.name} ${parameters} -ApiVersion ${cmdParameters.apiVersion} -Force`;
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                                currentScript += "        resource_name: '" + cmdParameters.resourceIdentifier.resourceName + "'\n";
                                break;
                            }
                        }
                    }
                    else {
                        currentScript += '    - name: LIST ' + this.resolver.getActionNameFromList() + '\n';
                        currentScript += '      azure_rm_resource:\n';
                        switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                            case ResourceIdentifierType.WithIDOnly: {
                                //currentScript = `$resource = ${cmdActionPair.cmd} -ResourceId ${cmdParameters.resourceIdentifier.resourceId} -Action list -ApiVersion ${cmdParameters.apiVersion} -Force\n$resource.Properties`
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        url: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                                break;
                            }
                            case ResourceIdentifierType.WithGroupType: {
                                //currentScript = `$resource = ${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -Action list -ApiVersion ${cmdParameters.apiVersion} -Force\n$resource.Properties`
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                                  break;
                            }
                            case ResourceIdentifierType.WithGroupTypeName: {
                                //currentScript = `$resource = ${cmdActionPair.cmd} -ResourceGroupName ${cmdParameters.resourceIdentifier.resourceGroup} -ResourceType ${cmdParameters.resourceIdentifier.resourceType} -ResourceName "${cmdParameters.resourceIdentifier.resourceName}" -Action list -ApiVersion ${cmdParameters.apiVersion} -Force\n$resource.Properties`
                                currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                                currentScript += "        resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                                currentScript += "        provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                                currentScript += "        resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                                currentScript += "        resource_name: '" + cmdParameters.resourceIdentifier.resourceName + "'\n";
                                break;
                            }
                        }
                    }
                    break;
                }
                
                case CmdType.NewResourceGroup: {
                    currentScript += '    - name: CREATE ' + this.resolver.getActionName() + '\n';
                    currentScript += '      azure_rm_resource:\n';                    
                    currentScript += "        api_version: '" + cmdParameters.apiVersion + "'\n";
                    currentScript += '        resource_group: NewResourceGroup\n';                    
                    currentScript += '        body:\n';                    
                    currentScript += '          location: eastus\n';                    
                    break;
                }
            }
            return currentScript + "\n\n";
        }

        private yamlFromObject(o: any, prefix: string): string {
            let yaml: string = ""

            for (let key in o) {
                if (typeof o[key] === 'object') {
                    yaml += prefix + key + ":\n";
                    yaml += this.yamlFromObject(o[key], prefix + "  ");
                } else {
                    yaml += prefix + key + ": " + o[key] + "\n";
                }
            }

            return yaml;
        }
    }
}

