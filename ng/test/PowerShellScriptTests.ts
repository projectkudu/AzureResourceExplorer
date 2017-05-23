module armExplorer
{
    function keyCount(arg: any) {
        let count : number = 0;
        for (let key in arg) {
            count++;
        }
        return count;
    }

    function throwIfObjectNotEqual<T>(expected: T, actual: T) {
        throwIfNotEqual(keyCount(expected), keyCount(actual));
        for (let key in expected) {
            if (typeof expected[key] === 'object') {
                throwIfObjectNotEqual(expected[key], actual[key]);
            }
            else {
                throwIfNotEqual(expected[key], actual[key]);
            }
        }
    }
     
    function throwIfArrayNotEqual<T>(expectedStrings: Array<T>, actualStrings: Array<T>) {
        if (expectedStrings.length != actualStrings.length) {
            throw new Error("Expected: " + expectedStrings.length + "\nActual: " + actualStrings.length+"\n");
        }
        for (let i in expectedStrings) {
            throwIfNotEqual(expectedStrings[i], actualStrings[i]);
        }
    }

    function throwIfNotEqual<T>(expected: T, actual: T) {
        if (typeof expected === 'object') {
            throwIfObjectNotEqual(expected, actual);
        }
        else {
            if (expected !== actual) {
                throw new Error("Expected: " + expected + "\nActual: " + actual + "\n");
            }
        }
    }

    function throwIfDefined(arg: any) {
        if (typeof arg === 'undefined')
            return;
        throw new Error("Expected: undefined Actual: " + arg);
    }

    function logSuccess(callerArg: IArguments) {
        let currentFunction: string = callerArg.callee.toString();
        console.log(currentFunction.substr(0, currentFunction.indexOf('(')).replace("function", "TEST") + " :PASSED");
    }

    namespace PsScriptGeneratorTests {

        scriptSubscriptions();
        scriptSubscriptionsSubId();
        scriptSubscriptionsSubIdResGroup();
        scriptResourceIDOnlyWithResourceGroupName();
        scriptResGrpNameResType();
        scriptResGrpNameResTypeResName();
        scriptResGrpNameResTypeResNameSubType1();
        scriptResGrpNameResTypeResNameSubType1SubName1();
        scriptResGrpNameResTypeResNameSubType1SubName1SubType2();
        scriptResGrpNameResTypeResNameSubType1SubName1SubType2SubName2();
        scriptResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3();
        scriptResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3SubName3();
        scriptResourceUrlWithList();
       
        function scriptSubscriptions() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions";
            value.resourceDefinition = resourceDefinition;

            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = "# GET subscriptions\nGet-AzureRmResource -ResourceId /subscriptions -ApiVersion 2014-04-01\n\n";

            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);
            let expectedScriptIndex : number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }

        function scriptSubscriptionsSubId() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000";
            value.resourceDefinition = resourceDefinition;
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = "# GET 00000000-0000-0000-0000-000000000000\nGet-AzureRmResource -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000 -ApiVersion 2014-04-01\n\n";
            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }

        function scriptSubscriptionsSubIdResGroup() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups";
            value.resourceDefinition = resourceDefinition;
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = "# GET resourceGroups\nGet-AzureRmResource -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups -ApiVersion 2014-04-01\n\n";
            expectedScripts[1] = '# CREATE resourceGroups\n$ResourceLocation = "West US"\n$ResourceName = "NewresourceGroup"\n\nNew-AzureRmResourceGroup -Location $ResourceLocation -Name $ResourceName\n\n';
            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }

        function scriptResourceIDOnlyWithResourceGroupName() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "PUT", "DELETE"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = ["exportTemplate", "moveResources", "providers", "validateMoveResources"];

            let actions = [] as IAction[];
            actions[0] = { httpMethod: "DELETE", name: "Delete", url: "https://management.azure.com/subscriptions/6e6e25b…-43f4-bdde-1864842e524b/resourceGroups/cloudsvcrg", query: undefined, requestBody: undefined };
            actions[1] = { httpMethod: "POST", name: "exportTemplate", url: "https://management.azure.com/subscriptions/6e6e25b…842e524b/resourceGroups/cloudsvcrg/exportTemplate", query: undefined, requestBody: '{"options": "IncludeParameterDefaultValue, IncludeComments", "resources": ["* "]}' };
            actions[2] = { httpMethod: "POST", name: "moveResources", url: "https://management.azure.com/subscriptions/6e6e25b…842e524b/resourceGroups/cloudsvcrg/moveResources", query: undefined, requestBody: '{"targetResourceGroup": "(string)","resources": ["(string)"]}' };
            actions[3] = { httpMethod: "POST", name: "validateMoveResources", url: "https://management.azure.com/subscriptions/6e6e25b…842e524b/resourceGroups/cloudsvcrg/validateMoveResources", query: undefined, requestBody: '{"targetResourceGroup": "(string)","resources": ["(string)"]}' };

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg";
            value.resourceDefinition = resourceDefinition;
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,actions));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = "# GET cloudsvcrg\nGet-AzureRmResource -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -ApiVersion 2014-04-01\n\n";
            expectedScripts[1] = '# SET cloudsvcrg\n$PropertiesObject = @{\n\t#Property = value;\n}\nSet-AzureRmResource -PropertyObject $PropertiesObject -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -ApiVersion 2014-04-01 -Force\n\n';
            expectedScripts[2] = '# DELETE cloudsvcrg\nRemove-AzureRmResource -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -ApiVersion 2014-04-01 -Force\n\n';
            expectedScripts[3] = '# Action exportTemplate\n$ParametersObject = @{\n\toptions = "IncludeParameterDefaultValue, IncludeComments"\n\tresources = (\n\t\t"* "\n\t)\n}\n\nInvoke-AzureRmResourceAction -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -Action exportTemplate -Parameters $ParametersObject -ApiVersion 2014-04-01 -Force\n\n';
            expectedScripts[4] = '# Action moveResources\n$ParametersObject = @{\n\ttargetResourceGroup = "(string)"\n\tresources = (\n\t\t"(string)"\n\t)\n}\n\nInvoke-AzureRmResourceAction -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -Action moveResources -Parameters $ParametersObject -ApiVersion 2014-04-01 -Force\n\n';
            expectedScripts[5] = '# Action validateMoveResources\n$ParametersObject = @{\n\ttargetResourceGroup = "(string)"\n\tresources = (\n\t\t"(string)"\n\t)\n}\n\nInvoke-AzureRmResourceAction -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -Action validateMoveResources -Parameters $ParametersObject -ApiVersion 2014-04-01 -Force\n\n';
            
            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }

        function scriptResGrpNameResType() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2016-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames";
            value.resourceDefinition = resourceDefinition;
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = "# GET domainNames\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames -IsCollection -ApiVersion 2016-04-01\n\n";
            expectedScripts[1] = '# CREATE domainNames\n$ResourceLocation = "West US"\n$ResourceName = "NewdomainName"\n$PropertiesObject = @{\n\t#Property = value;\n}\nNew-AzureRmResource -ResourceName $ResourceName -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames -ApiVersion 2016-04-01 -Force\n\n';
            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }

        function scriptResGrpNameResTypeResName() {
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, actions));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = '# GET x123cloudsvc\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames -ResourceName "x123cloudsvc" -ApiVersion 2016-04-01\n\n';
            expectedScripts[1] = '# SET x123cloudsvc\n$PropertiesObject = @{\n\t#Property = value;\n}\nSet-AzureRmResource -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames -ResourceName "x123cloudsvc" -ApiVersion 2016-04-01 -Force\n\n';
            expectedScripts[2] = '# DELETE x123cloudsvc\nRemove-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames -ResourceName "x123cloudsvc" -ApiVersion 2016-04-01 -Force\n\n';

            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }
            logSuccess(arguments);
        }

        function scriptResGrpNameResTypeResNameSubType1() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2016-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots";
            value.resourceDefinition = resourceDefinition;
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = '# GET slots\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots -ResourceName "x123cloudsvc" -ApiVersion 2016-04-01\n\n';
            expectedScripts[1] = '# CREATE slots\n$ResourceLocation = "West US"\n$ResourceName = "Newslot"\n$PropertiesObject = @{\n\t#Property = value;\n}\nNew-AzureRmResource -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots -ResourceName "x123cloudsvc/$ResourceName" -ApiVersion 2016-04-01 -Force\n\n';

            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }

        function scriptResGrpNameResTypeResNameSubType1SubName1() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "DELETE", "PUT"];
            resourceDefinition.apiVersion = "2016-04-01";
            resourceDefinition.children = ["roles"];

            let actions = [] as IAction[];
            actions[0] = { httpMethod: "DELETE", name: "Delete", url: "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production", query: undefined, requestBody: undefined };

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production";
            value.resourceDefinition = resourceDefinition;
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, actions));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = '# GET Production\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots -ResourceName "x123cloudsvc/Production" -ApiVersion 2016-04-01\n\n';
            expectedScripts[1] = '# SET Production\n$PropertiesObject = @{\n\t#Property = value;\n}\nSet-AzureRmResource -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots -ResourceName "x123cloudsvc/Production" -ApiVersion 2016-04-01 -Force\n\n';
            expectedScripts[2] = '# DELETE Production\nRemove-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots -ResourceName "x123cloudsvc/Production" -ApiVersion 2016-04-01 -Force\n\n';
            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }

        function scriptResGrpNameResTypeResNameSubType1SubName1SubType2() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2016-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles";
            value.resourceDefinition = resourceDefinition;
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, []));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = '# GET roles\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles -ResourceName "x123cloudsvc/Production" -ApiVersion 2016-04-01\n\n';
            expectedScripts[1] = '# CREATE roles\n$ResourceLocation = "West US"\n$ResourceName = "Newrole"\n$PropertiesObject = @{\n\t#Property = value;\n}\nNew-AzureRmResource -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles -ResourceName "x123cloudsvc/Production/$ResourceName" -ApiVersion 2016-04-01 -Force\n\n';
            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }

        function scriptResGrpNameResTypeResNameSubType1SubName1SubType2SubName2() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "DELETE", "PUT"];
            resourceDefinition.apiVersion = "2016-04-01";
            resourceDefinition.children = ["metricDefinitions", "metrics"];

            let actions = [] as IAction[];
            actions[0] = { httpMethod: "DELETE", name: "Delete", url: "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1", query: undefined, requestBody: undefined };

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1";
            value.resourceDefinition = resourceDefinition;
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, actions));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = '# GET WorkerRole1\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles -ResourceName "x123cloudsvc/Production/WorkerRole1" -ApiVersion 2016-04-01\n\n';
            expectedScripts[1] = '# SET WorkerRole1\n$PropertiesObject = @{\n\t#Property = value;\n}\nSet-AzureRmResource -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles -ResourceName "x123cloudsvc/Production/WorkerRole1" -ApiVersion 2016-04-01 -Force\n\n';
            expectedScripts[2] = '# DELETE WorkerRole1\nRemove-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles -ResourceName "x123cloudsvc/Production/WorkerRole1" -ApiVersion 2016-04-01 -Force\n\n';
            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }

        function scriptResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions";
            value.resourceDefinition = resourceDefinition;
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, []));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = '# GET metricDefinitions\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions -ResourceName "x123cloudsvc/Production/WorkerRole1" -ApiVersion 2014-04-01\n\n';
            expectedScripts[1] = '# CREATE metricDefinitions\n$ResourceLocation = "West US"\n$ResourceName = "NewmetricDefinition"\n$PropertiesObject = @{\n\t#Property = value;\n}\nNew-AzureRmResource -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions -ResourceName "x123cloudsvc/Production/WorkerRole1/$ResourceName" -ApiVersion 2014-04-01 -Force\n\n';
            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }

        function scriptResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3SubName3() {
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, actions));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = '# GET Percentage CPU\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions -ResourceName "x123cloudsvc/Production/WorkerRole1/Percentage CPU" -ApiVersion 2014-04-01\n\n';
            expectedScripts[1] = '# SET Percentage CPU\n$PropertiesObject = @{\n\t#Property = value;\n}\nSet-AzureRmResource -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions -ResourceName "x123cloudsvc/Production/WorkerRole1/Percentage CPU" -ApiVersion 2014-04-01 -Force\n\n';
            expectedScripts[2] = '# DELETE Percentage CPU\nRemove-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions -ResourceName "x123cloudsvc/Production/WorkerRole1/Percentage CPU" -ApiVersion 2014-04-01 -Force\n\n';
            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }

        function scriptResourceUrlWithList() {
            let resourceDefinition = {} as IResourceDefinition;
            resourceDefinition.actions = ["PUT", "GETPOST"];
            resourceDefinition.apiVersion = "2016-03-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "POST";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rgrp1/providers/Microsoft.Web/sites/WebApp120170517014339/config/appsettings/list";
            value.resourceDefinition = resourceDefinition;
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
            let scriptGenerator = new PsScriptGenerator(resolver);
            let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

            let expectedScripts = [] as Array<string>;
            expectedScripts[0] = '# LIST appsettings\n$resource = Invoke-AzureRmResourceAction -ResourceGroupName rgrp1 -ResourceType Microsoft.Web/sites/config -ResourceName "WebApp120170517014339/appsettings" -Action list -ApiVersion 2016-03-01 -Force\n$resource.Properties\n\n';
            expectedScripts[1] = '# SET list\n$PropertiesObject = @{\n\t#Property = value;\n}\nNew-AzureRmResource -PropertyObject $PropertiesObject -ResourceGroupName rgrp1 -ResourceType Microsoft.Web/sites/config -ResourceName "WebApp120170517014339/appsettings" -ApiVersion 2016-03-01 -Force\n\n';

            throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

            let expectedScriptIndex: number = 0;
            for (let cmdActionPair of actualSupportedCommands) {
                throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
            }

            logSuccess(arguments);
        }
    }

    namespace PSCmdletParameterResolverTests {
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
            
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, []));
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
            cmdletParameters.isCollection  = false;

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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, actions));
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, actions));
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, actions));
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, actions));
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value, actions));
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
            let resolver = new PSCmdletParameterResolver(new ARMUrlParser(value,[]));
            let scriptor = new PsScriptGenerator(resolver);
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

    namespace RMUrlParserTests {
        parseUrlWithResourceIDOnly();
        parseUrlWithResouceIDOnlyWithSubId();
        parseUrlWithResourceIDOnlyWithResourceGroup();
        parseUrlWithResourceIDOnlyWithResourceGroupName();
        parseUrlWithResGrpNameResType();
        parseUrlWithResGrpNameResTypeResName();
        parseUrlWithResGrpNameResTypeResNameSubType1();
        parseUrlWithResGrpNameResTypeResNameSubType1SubName1();
        parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2();
        parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2SubName2();
        parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3();
        parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3SubName3();
        parseUrlWithResourceUrlWithList();

        function parseUrlWithResourceIDOnly() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithIDOnly, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("/subscriptions", resourceIdentifier.resourceId);
            throwIfDefined(resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceGroup);
            throwIfDefined(resourceIdentifier.resourceType);
            logSuccess(arguments);
        }

        function parseUrlWithResouceIDOnlyWithSubId() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithIDOnly, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("/subscriptions/00000000-0000-0000-0000-000000000000", resourceIdentifier.resourceId);
            throwIfDefined(resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceGroup);
            throwIfDefined(resourceIdentifier.resourceType);
            logSuccess(arguments);
        }

        function parseUrlWithResourceIDOnlyWithResourceGroup() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithIDOnly, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups", resourceIdentifier.resourceId);
            throwIfDefined(resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceGroup);
            throwIfDefined(resourceIdentifier.resourceType);
            logSuccess(arguments);
        }

        function parseUrlWithResourceIDOnlyWithResourceGroupName() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithIDOnly, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg", resourceIdentifier.resourceId);
            throwIfDefined(resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceGroup);
            throwIfDefined(resourceIdentifier.resourceType);
            logSuccess(arguments);
        }

        function parseUrlWithResGrpNameResType() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithGroupType, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
            throwIfNotEqual("Microsoft.ClassicCompute/domainNames", resourceIdentifier.resourceType);
            throwIfDefined(resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceId);
            logSuccess(arguments);
        }

        function parseUrlWithResGrpNameResTypeResName() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
            throwIfNotEqual("Microsoft.ClassicCompute/domainNames", resourceIdentifier.resourceType);
            throwIfNotEqual("x123cloudsvc", resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceId);
            logSuccess(arguments);
        }

        function parseUrlWithResGrpNameResTypeResNameSubType1() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
            throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots", resourceIdentifier.resourceType);
            throwIfNotEqual("x123cloudsvc", resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceId);
            logSuccess(arguments);
        }

        function parseUrlWithResGrpNameResTypeResNameSubType1SubName1() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
            throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots", resourceIdentifier.resourceType);
            throwIfNotEqual("x123cloudsvc/Production", resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceId);
            logSuccess(arguments);
        }

        function parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
            throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots/roles", resourceIdentifier.resourceType);
            throwIfNotEqual("x123cloudsvc/Production", resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceId);
            logSuccess(arguments);
        }

        function parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2SubName2() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
            throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots/roles", resourceIdentifier.resourceType);
            throwIfNotEqual("x123cloudsvc/Production/WorkerRole1", resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceId);
            logSuccess(arguments);
        }

        function parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
            throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions", resourceIdentifier.resourceType);
            throwIfNotEqual("x123cloudsvc/Production/WorkerRole1", resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceId);
            logSuccess(arguments);
        }

        function parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3SubName3() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions/Percentage CPU";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
            throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions", resourceIdentifier.resourceType);
            throwIfNotEqual("x123cloudsvc/Production/WorkerRole1/Percentage CPU", resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceId);
            logSuccess(arguments);
        }

        function parseUrlWithResourceUrlWithList() {
            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "POST";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rgrp1/providers/Microsoft.Web/sites/WebApp120170517014339/config/appsettings/list";
            let parser = new ARMUrlParser(value,[]);
            let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
            throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
            throwIfNotEqual("rgrp1", resourceIdentifier.resourceGroup);
            throwIfNotEqual("Microsoft.Web/sites/config", resourceIdentifier.resourceType);
            throwIfNotEqual("WebApp120170517014339/appsettings", resourceIdentifier.resourceName);
            throwIfDefined(resourceIdentifier.resourceId);
            logSuccess(arguments);
        }
    }
}
