module armExplorer {

    namespace ScriptParameterResolverTests {

        getParametersForSubscriptions();
        getParametersForSubscriptionsSubId();
        getParametersForSubscriptionsSubIdResGroup();
        getParametersForResourceIDOnlyWithResourceGroupName();
        getParametersForResGrpNameResType();
        getParametersForResGrpNameResTypeResName();
        getParametersForResGrpNameResTypeResNameSubType1();
        getParametersForResGrpNameResTypeResNameSubType1SubName1();
        getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2();
        getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2SubName2();
        getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3();
        getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3SubName3();
        getParametersForResourceUrlWithList();

        function getParametersForSubscriptions() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions";
            value.resourceDefinition = resourceDefinition;

            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, []));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Get-AzureRmResource", isAction: false, isSetAction: false }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let expectedcCmdletParameters = [] as Array<CmdletParameters>;
            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithIDOnly;
            cmdletResourceInfo.resourceId = "/subscriptions";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2014-04-01";
            cmdletParameters.isCollection = false;

            expectedcCmdletParameters.push(cmdletParameters);

            let cmdIndex = 0;
            for (let actualCmdType of actualSupportedCommands) {
                throwIfObjectNotEqual(expectedcCmdletParameters[cmdIndex], resolver.getParameters());
            }

            logSuccess(arguments);
        }

        function getParametersForSubscriptionsSubId() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, []));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Get-AzureRmResource", isAction: false, isSetAction: false }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let expectedCmdletParameters = [] as Array<CmdletParameters>;
            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithIDOnly;
            cmdletResourceInfo.resourceId = "/subscriptions/00000000-0000-0000-0000-000000000000";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2014-04-01";
            cmdletParameters.isCollection = false;

            expectedCmdletParameters.push(cmdletParameters);

            let cmdIndex = 0;
            for (let actualCmdType of actualSupportedCommands) {
                throwIfObjectNotEqual(expectedCmdletParameters[cmdIndex], resolver.getParameters());
            }

            logSuccess(arguments);
        }

        function getParametersForSubscriptionsSubIdResGroup() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, []));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Get-AzureRmResource", isAction: false, isSetAction: false }, { cmd: "New-AzureRmResourceGroup", isAction: false, isSetAction: false }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithIDOnly;
            cmdletResourceInfo.resourceId = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2014-04-01";
            cmdletParameters.isCollection = false;

            throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

            logSuccess(arguments);
        }

        function getParametersForResourceIDOnlyWithResourceGroupName() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "PUT", "DELETE"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = ["exportTemplate", "moveResources", "providers", "validateMoveResources"];

            let actions = [] as IAction[];
            actions[0] = { httpMethod: "DELETE", name: "Delete", url: "https://management.azure.com/subscriptions/6e6e25b…-43f4-bdde-1864842e524b/resourceGroups/cloudsvcrg", query: undefined, requestBody: undefined };
            actions[1] = { httpMethod: "POST", name: "exportTemplate", url: "https://management.azure.com/subscriptions/6e6e25b…842e524b/resourceGroups/cloudsvcrg/exportTemplate", query: undefined, requestBody: "{'options': 'IncludeParameterDefaultValue, IncludeComments', 'resources': ['* ']}" };
            actions[2] = { httpMethod: "POST", name: "moveResources", url: "https://management.azure.com/subscriptions/6e6e25b…842e524b/resourceGroups/cloudsvcrg/moveResources", query: undefined, requestBody: "{'targetResourceGroup': '(string)','resources': ['(string)']}" };
            actions[3] = { httpMethod: "POST", name: "validateMoveResources", url: "https://management.azure.com/subscriptions/6e6e25b…842e524b/resourceGroups/cloudsvcrg/validateMoveResources", query: undefined, requestBody: "{'targetResourceGroup': '(string)','resources': ['(string)']}" };

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, actions));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [
                { cmd: "Get-AzureRmResource", isAction: false, isSetAction: false },
                { cmd: "Set-AzureRmResource", isAction: false, isSetAction: true },
                { cmd: "Remove-AzureRmResource", isAction: true, isSetAction: false },
                { cmd: "Invoke-AzureRmResourceAction", isAction: true, isSetAction: false },
                { cmd: "Invoke-AzureRmResourceAction", isAction: true, isSetAction: false },
                { cmd: "Invoke-AzureRmResourceAction", isAction: true, isSetAction: false }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithIDOnly;
            cmdletResourceInfo.resourceId = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2014-04-01";
            cmdletParameters.isCollection = false;
            throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

            logSuccess(arguments);
        }

        function getParametersForResGrpNameResType() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2016-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, []));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Get-AzureRmResource", isAction: false, isSetAction: false }, { cmd: "New-AzureRmResource", isAction: false, isSetAction: false }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupType;
            cmdletResourceInfo.resourceGroup = "cloudsvcrg";
            cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2016-04-01";
            cmdletParameters.isCollection = true;
            throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

            logSuccess(arguments);
        }

        function getParametersForResGrpNameResTypeResName() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "PUT", "DELETE"];
            resourceDefinition.apiVersion = "2016-04-01";
            resourceDefinition.children = ["slots"];

            let actions = [] as IAction[];
            actions[0] = { httpMethod: "DELETE", name: "Delete", url: "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc", query: undefined, requestBody: undefined };

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, actions));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Get-AzureRmResource", isAction: false, isSetAction: false }, { cmd: "Set-AzureRmResource", isAction: false, isSetAction: true },
                { cmd: "Remove-AzureRmResource", isAction: true, isSetAction: false }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
            cmdletResourceInfo.resourceGroup = "cloudsvcrg";
            cmdletResourceInfo.resourceName = "x123cloudsvc";
            cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2016-04-01";
            cmdletParameters.isCollection = false;
            throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

            logSuccess(arguments);
        }

        function getParametersForResGrpNameResTypeResNameSubType1() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, []));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Get-AzureRmResource", isAction: false, isSetAction: false }, { cmd: "New-AzureRmResource", isAction: false, isSetAction: false }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
            cmdletResourceInfo.resourceGroup = "cloudsvcrg";
            cmdletResourceInfo.resourceName = "x123cloudsvc";
            cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2014-04-01";
            cmdletParameters.isCollection = false; // bug fix
            throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

            logSuccess(arguments);
        }

        function getParametersForResGrpNameResTypeResNameSubType1SubName1() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "DELETE", "PUT"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = ["roles"];

            let actions = [] as IAction[];
            actions[0] = { httpMethod: "DELETE", name: "Delete", url: "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production", query: undefined, requestBody: undefined };

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, actions));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Get-AzureRmResource", isAction: false, isSetAction: false }, { cmd: "Set-AzureRmResource", isAction: false, isSetAction: true },
                { cmd: "Remove-AzureRmResource", isAction: true, isSetAction: false }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
            cmdletResourceInfo.resourceGroup = "cloudsvcrg";
            cmdletResourceInfo.resourceName = "x123cloudsvc/Production";
            cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2014-04-01";
            cmdletParameters.isCollection = false;
            throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

            logSuccess(arguments);
        }

        function getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, []));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Get-AzureRmResource", isAction: false, isSetAction: false }, { cmd: "New-AzureRmResource", isAction: false, isSetAction: false }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
            cmdletResourceInfo.resourceGroup = "cloudsvcrg";
            cmdletResourceInfo.resourceName = "x123cloudsvc/Production";
            cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots/roles";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2014-04-01";
            cmdletParameters.isCollection = false; // bug fix
            throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

            logSuccess(arguments);
        }

        function getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2SubName2() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "DELETE", "PUT"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = ["metricDefinitions", "metrics"];

            let actions = [] as IAction[];
            actions[0] = { httpMethod: "DELETE", name: "Delete", url: "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1", query: undefined, requestBody: undefined };

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, actions));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Get-AzureRmResource", isAction: false, isSetAction: false }, { cmd: "Set-AzureRmResource", isAction: false, isSetAction: true },
                { cmd: "Remove-AzureRmResource", isAction: true, isSetAction: false }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
            cmdletResourceInfo.resourceGroup = "cloudsvcrg";
            cmdletResourceInfo.resourceName = "x123cloudsvc/Production/WorkerRole1";
            cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots/roles";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2014-04-01";
            cmdletParameters.isCollection = false;
            throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

            logSuccess(arguments);
        }

        function getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, []));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Get-AzureRmResource", isAction: false, isSetAction: false }, { cmd: "New-AzureRmResource", isAction: false, isSetAction: false }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
            cmdletResourceInfo.resourceGroup = "cloudsvcrg";
            cmdletResourceInfo.resourceName = "x123cloudsvc/Production/WorkerRole1";
            cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2014-04-01";
            cmdletParameters.isCollection = false; //bug fix
            throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

            logSuccess(arguments);
        }

        function getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3SubName3() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["PUT", "GET", "DELETE"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let actions = [] as IAction[];
            actions[0] = { httpMethod: "DELETE", name: "Delete", url: "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions/Percentage CPU", query: undefined, requestBody: undefined };

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions/Percentage CPU";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, actions));
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Get-AzureRmResource", isAction: false, isSetAction: false }, { cmd: "Set-AzureRmResource", isAction: false, isSetAction: true },
                { cmd: "Remove-AzureRmResource", isAction: true, isSetAction: false }];
            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
            cmdletResourceInfo.resourceGroup = "cloudsvcrg";
            cmdletResourceInfo.resourceName = "x123cloudsvc/Production/WorkerRole1/Percentage CPU";
            cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2014-04-01";
            cmdletParameters.isCollection = false;
            throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

            logSuccess(arguments);
        }

        function getParametersForResourceUrlWithList() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["PUT", "GETPOST"];
            resourceDefinition.apiVersion = "2016-03-01";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "POST";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rgrp1/providers/Microsoft.Web/sites/WebApp120170517014339/config/appsettings/list";
            value.resourceDefinition = resourceDefinition;
            let resolver = new armExplorer.ScriptParametersResolver(new ARMUrlParser(value, []));
            let scriptor = new armExplorer.PowerShellScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: "Invoke-AzureRmResourceAction", isAction: false, isSetAction: false }, { cmd: "New-AzureRmResource", isAction: false, isSetAction: true }];

            throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

            let cmdletParameters = {} as CmdletParameters;
            let cmdletResourceInfo = {} as ResourceIdentifier;
            cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
            cmdletResourceInfo.resourceGroup = "rgrp1";
            cmdletResourceInfo.resourceName = "WebApp120170517014339/appsettings";
            cmdletResourceInfo.resourceType = "Microsoft.Web/sites/config";
            cmdletParameters.resourceIdentifier = cmdletResourceInfo;
            cmdletParameters.apiVersion = "2016-03-01";
            cmdletParameters.isCollection = false;
            throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

            logSuccess(arguments);
        }
    }

}