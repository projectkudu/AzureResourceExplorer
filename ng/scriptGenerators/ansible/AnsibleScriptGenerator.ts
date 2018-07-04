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
                    currentScript += this.yamlFromResourceId("        ");
                    break;
                }
                case CmdType.New: {
                    if (cmdActionPair.isSetAction) {
                        currentScript += '    - name: SET ' + this.resolver.getActionName() + '\n';
                        currentScript += '      azure_rm_resource:\n';
                        currentScript += this.yamlFromResourceId("        ");
                    }
                    else {
                        let newName: string = "New" + this.resolver.getResourceName();
                        currentScript += '    - name: CREATE ' + this.resolver.getActionName() + '\n';
                        currentScript += '      azure_rm_resource:\n';
                        // XXX - resolve this
                        //prefixString += '$ResourceLocation = "West US"\n';
                        //prefixString += '$ResourceName = "${newName}"\n';
                        //prefixString += '$PropertiesObject = @{ \n\t#Property = value; \n }\n';

                        currentScript += this.yamlFromResourceId("        ");
                    }

                    // append actual structure of request body
                    if (this.resourceDefinition.requestBody) {
                        currentScript += "        body:\n";
                        currentScript += this.yamlFromObject(this.resourceDefinition.requestBody, "          ");
                    }
                    break;
                }
                case CmdType.Set: {

                    currentScript += '    - name: SET ' + this.resolver.getActionNameFromList() + '\n';
                    currentScript += '      azure_rm_resource:\n';
                    currentScript += this.yamlFromResourceId("        ");

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
                    currentScript += this.yamlFromResourceId("        ");
                    currentScript += "        state: absent\n";

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

                        currentScript += this.yamlFromResourceId("        ");
                    }
                    else {
                        currentScript += '    - name: LIST ' + this.resolver.getActionNameFromList() + '\n';
                        currentScript += '      azure_rm_resource:\n';
                        currentScript += this.yamlFromResourceId("        ");
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

        private yamlFromResourceId(prefix: string): string {
            let yaml: string = "";
            let cmdParameters = this.resolver.getParameters();

            switch (cmdParameters.resourceIdentifier.resourceIdentifierType) {
                case ResourceIdentifierType.WithIDOnly: {
                    yaml += prefix + "api_version: '" + cmdParameters.apiVersion + "'\n";
                    yaml += prefix + "url: " + cmdParameters.resourceIdentifier.resourceId + "\n";
                    break;
                }
                case ResourceIdentifierType.WithGroupType: {
                    yaml += prefix + "api_version: '" + cmdParameters.apiVersion + "'\n";
                    yaml += prefix + "resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                    yaml += prefix + "provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                    yaml += prefix + "resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                    break;
                }
                case ResourceIdentifierType.WithGroupTypeName: {
                    yaml += prefix + "api_version: '" + cmdParameters.apiVersion + "'\n";
                    yaml += prefix + "resource_group: '" + cmdParameters.resourceIdentifier.resourceGroup + "'\n";
                    yaml += prefix + "provider: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[0].split('.')[1] + "'\n";
                    yaml += prefix + "resource_type: '" + cmdParameters.resourceIdentifier.resourceType.split('/')[1] + "'\n";
                    yaml += prefix + "resource_name: '" + cmdParameters.resourceIdentifier.resourceName + "'\n";
                    break;
                }
            }

            return yaml;
        }
    }
}

