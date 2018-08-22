module armExplorer {

    export class AnsibleScriptGenerator {
        private script: string = "";
        private actionsIndex: number = 0;
        private resourceDefinition: any = {};
        constructor(private resolver: ScriptParametersResolver, resourceDefinition: any) {
            this.resourceDefinition = resourceDefinition;
        }

        getScript(cmdActionPair: RMCommandInfo): string {
            const cmdParameters = this.resolver.getParameters();
            let currentScript: string = "";
            
            currentScript += "- hosts: localhost\n";
            currentScript += "  tasks:\n";

            switch (cmdActionPair.cmd) {
                case CmdType.Get: {
                    currentScript += '    - name: GET ' + this.resolver.getActionName() + '\n';
                    currentScript += '      azure_rm_resource_facts:\n';
                    currentScript += this.yamlFromResourceId(cmdActionPair, "        ");
                    break;
                }
                case CmdType.New: {
                    if (cmdActionPair.isSetAction) {
                        currentScript += '    - name: SET ' + this.resolver.getActionName() + '\n';
                        currentScript += '      azure_rm_resource:\n';
                        currentScript += this.yamlFromResourceId(cmdActionPair, "        ");
                    }
                    else {
                        let newName: string = "New" + this.resolver.getResourceName();
                        currentScript += '    - name: CREATE ' + this.resolver.getActionName() + '\n';
                        currentScript += '      azure_rm_resource:\n';
                        currentScript += this.yamlFromResourceId(cmdActionPair, "        ");
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
                    currentScript += this.yamlFromResourceId(cmdActionPair, "        ");

                    // append actual structure of request body
                    if (this.resourceDefinition.requestBody) {
                        currentScript += "        body:\n";
                        currentScript += this.yamlFromObject(this.resourceDefinition.requestBody, "          ");
                    }

                    break;
                }

                case CmdType.RemoveAction: {
                    currentScript += '    - name: DELETE ' + this.resolver.getActionNameFromAction(this.actionsIndex) + '\n';
                    currentScript += '      azure_rm_resource:\n';
                    currentScript += this.yamlFromResourceId(cmdActionPair, "        ");
                    currentScript += "        state: absent\n";

                    this.actionsIndex++;
                    break;
                }
                case CmdType.Invoke:
                case CmdType.InvokeAction: {
                    if (cmdActionPair.isAction) {
                        currentScript += '    - name: Action ' + this.resolver.getActionNameFromAction(this.actionsIndex) + '\n';
                        currentScript += '      azure_rm_resource:\n';
                        currentScript += '        method: POST\n';

                        currentScript += this.yamlFromResourceId(cmdActionPair, "        ");

                        // append actual structure of request body
                        const body = this.resolver.getActionParameters(this.actionsIndex).requestBody;

                        if (body) {
                            currentScript += "        body:\n";
                            // parse, as body is apparently returned as JSON string, not an object
                            currentScript += this.yamlFromObject(JSON.parse(body), "          ");
                        }

                        this.actionsIndex++;
                    }
                    else {
                        currentScript += '    - name: LIST ' + this.resolver.getActionNameFromList() + '\n';
                        currentScript += '      azure_rm_resource:\n';
                        currentScript += this.yamlFromResourceId(cmdActionPair, "        ");
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

        private yamlFromResourceId(cmdActionPair: RMCommandInfo, prefix: string): string {
            let yaml: string = "";
            const cmdParameters = this.resolver.getParameters();

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

                    const split_name = cmdParameters.resourceIdentifier.resourceName.split('/');

                    yaml += prefix + "resource_name: '" + split_name[0] + "'\n";

                    if (split_name.length > 1) {
                        yaml += prefix + "subresource:\n";
                        yaml += prefix + "  - type: " + split_name[1] + "\n";
                    }
                    else if (cmdActionPair.isAction) {
                        yaml += prefix + "subresource:\n";
                        yaml += prefix + "  - type: " + this.resolver.getActionNameFromAction(this.actionsIndex) + "\n";
                    }

                    break;
                }
            }

            return yaml;
        }
    }
}

