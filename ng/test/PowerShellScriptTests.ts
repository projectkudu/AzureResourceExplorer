import {ISelectHandlerReturn} from "../models/ISelectHandlerReturn";
import {ARMUrlParser} from "../scriptGenerators/ARMUrlParser";
import {RMCommandInfo} from "../scriptGenerators/RMCommandInfo";
import {TestCommon} from "./TestCommon";
import {ResourceDefinition} from "../models/ResourceDefinition";
import {ScriptParametersResolver} from "../scriptGenerators/ScriptParametersResolver";
import { PowerShellScriptGenerator } from "../scriptGenerators/powershell/PowerShellScriptGenerator";
import {Action} from "../models/Action";
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
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions";
    value.resourceDefinition = resourceDefinition;

    let resolver = new ScriptParametersResolver(new ARMUrlParser(value,[]));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = "# GET subscriptions\nGet-AzureRmResource -ResourceId /subscriptions -ApiVersion 2014-04-01\n\n";

    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);
    let expectedScriptIndex : number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}

function scriptSubscriptionsSubId() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value,[]));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = "# GET 00000000-0000-0000-0000-000000000000\nGet-AzureRmResource -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000 -ApiVersion 2014-04-01\n\n";
    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}

function scriptSubscriptionsSubIdResGroup() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "CREATE"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value,[]));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = "# GET resourceGroups\nGet-AzureRmResource -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups -ApiVersion 2014-04-01\n\n";
    expectedScripts[1] = '# CREATE resourceGroups\n$ResourceLocation = "West US"\n$ResourceName = "NewresourceGroup"\n\nNew-AzureRmResourceGroup -Location $ResourceLocation -Name $ResourceName\n\n';
    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}

function scriptResourceIDOnlyWithResourceGroupName() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "PUT", "DELETE"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = ["exportTemplate", "moveResources", "providers", "validateMoveResources"];

    let actions = [] as Action[];
    actions[0] = new Action("DELETE",
        "delete",
        "https://management.azure.com/subscriptions/6e6e25b…-43f4-bdde-1864842e524b/resourceGroups/cloudsvcrg");
    actions[1] = new Action("POST",
        "exportTemplate",
        "https://management.azure.com/subscriptions/6e6e25b…842e524b/resourceGroups/cloudsvcrg/exportTemplate");
    actions[1].requestBody = "{'options': 'IncludeParameterDefaultValue, IncludeComments', 'resources': ['* ']}";

    actions[2] = new Action("POST",
        "moveResources",
        "https://management.azure.com/subscriptions/6e6e25b…842e524b/resourceGroups/cloudsvcrg/moveResources");
    actions[2].requestBody = "{'targetResourceGroup': '(string)','resources': ['(string)']}";

    actions[3] = new Action("POST",
        "validateMoveResources",
        "https://management.azure.com/subscriptions/6e6e25b…842e524b/resourceGroups/cloudsvcrg/validateMoveResources");
    actions[3].requestBody = "{'targetResourceGroup': '(string)','resources': ['(string)']}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value,actions));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = "# GET cloudsvcrg\nGet-AzureRmResource -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -ApiVersion 2014-04-01\n\n";
    expectedScripts[1] = '# SET cloudsvcrg\n$PropertiesObject = @{\n\t#Property = value;\n}\nSet-AzureRmResource -PropertyObject $PropertiesObject -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -ApiVersion 2014-04-01 -Force\n\n';
    expectedScripts[2] = '# DELETE cloudsvcrg\nRemove-AzureRmResource -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -ApiVersion 2014-04-01 -Force\n\n';
    expectedScripts[3] = '# Action exportTemplate\n$ParametersObject = @{\n\toptions = "IncludeParameterDefaultValue, IncludeComments"\n\tresources = (\n\t\t"* "\n\t)\n}\n\nInvoke-AzureRmResourceAction -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -Action exportTemplate -Parameters $ParametersObject -ApiVersion 2014-04-01 -Force\n\n';
    expectedScripts[4] = '# Action moveResources\n$ParametersObject = @{\n\ttargetResourceGroup = "(string)"\n\tresources = (\n\t\t"(string)"\n\t)\n}\n\nInvoke-AzureRmResourceAction -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -Action moveResources -Parameters $ParametersObject -ApiVersion 2014-04-01 -Force\n\n';
    expectedScripts[5] = '# Action validateMoveResources\n$ParametersObject = @{\n\ttargetResourceGroup = "(string)"\n\tresources = (\n\t\t"(string)"\n\t)\n}\n\nInvoke-AzureRmResourceAction -ResourceId /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg -Action validateMoveResources -Parameters $ParametersObject -ApiVersion 2014-04-01 -Force\n\n';
            
    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}

function scriptResGrpNameResType() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "CREATE"];
    resourceDefinition.apiVersion = "2016-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value,[]));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = "# GET domainNames\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames -IsCollection -ApiVersion 2016-04-01\n\n";
    expectedScripts[1] = '# CREATE domainNames\n$ResourceLocation = "West US"\n$ResourceName = "NewdomainName"\n$PropertiesObject = @{\n\t#Property = value;\n}\nNew-AzureRmResource -ResourceName $ResourceName -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames -ApiVersion 2016-04-01 -Force\n\n';
    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}

function scriptResGrpNameResTypeResName() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "PUT", "DELETE"];
    resourceDefinition.apiVersion = "2016-04-01";
    resourceDefinition.children = ["slots"];

    let actions = [] as Action[];
    actions[0] = new Action("DELETE",
        "Delete",
        "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc")

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, actions));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = '# GET x123cloudsvc\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames -ResourceName "x123cloudsvc" -ApiVersion 2016-04-01\n\n';
    expectedScripts[1] = '# SET x123cloudsvc\n$PropertiesObject = @{\n\t#Property = value;\n}\nSet-AzureRmResource -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames -ResourceName "x123cloudsvc" -ApiVersion 2016-04-01 -Force\n\n';
    expectedScripts[2] = '# DELETE x123cloudsvc\nRemove-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames -ResourceName "x123cloudsvc" -ApiVersion 2016-04-01 -Force\n\n';

    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }
    TestCommon.logSuccess(arguments);
}

function scriptResGrpNameResTypeResNameSubType1() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "CREATE"];
    resourceDefinition.apiVersion = "2016-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value,[]));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = '# GET slots\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots -ResourceName "x123cloudsvc" -ApiVersion 2016-04-01\n\n';
    expectedScripts[1] = '# CREATE slots\n$ResourceLocation = "West US"\n$ResourceName = "Newslot"\n$PropertiesObject = @{\n\t#Property = value;\n}\nNew-AzureRmResource -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots -ResourceName "x123cloudsvc/$ResourceName" -ApiVersion 2016-04-01 -Force\n\n';

    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}

function scriptResGrpNameResTypeResNameSubType1SubName1() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "DELETE", "PUT"];
    resourceDefinition.apiVersion = "2016-04-01";
    resourceDefinition.children = ["roles"];

    let actions = [] as Action[];
    actions[0] = new Action("DELETE", "Delete", "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production");

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, actions));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = '# GET Production\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots -ResourceName "x123cloudsvc/Production" -ApiVersion 2016-04-01\n\n';
    expectedScripts[1] = '# SET Production\n$PropertiesObject = @{\n\t#Property = value;\n}\nSet-AzureRmResource -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots -ResourceName "x123cloudsvc/Production" -ApiVersion 2016-04-01 -Force\n\n';
    expectedScripts[2] = '# DELETE Production\nRemove-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots -ResourceName "x123cloudsvc/Production" -ApiVersion 2016-04-01 -Force\n\n';
    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}

function scriptResGrpNameResTypeResNameSubType1SubName1SubType2() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "CREATE"];
    resourceDefinition.apiVersion = "2016-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, []));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = '# GET roles\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles -ResourceName "x123cloudsvc/Production" -ApiVersion 2016-04-01\n\n';
    expectedScripts[1] = '# CREATE roles\n$ResourceLocation = "West US"\n$ResourceName = "Newrole"\n$PropertiesObject = @{\n\t#Property = value;\n}\nNew-AzureRmResource -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles -ResourceName "x123cloudsvc/Production/$ResourceName" -ApiVersion 2016-04-01 -Force\n\n';
    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}

function scriptResGrpNameResTypeResNameSubType1SubName1SubType2SubName2() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "DELETE", "PUT"];
    resourceDefinition.apiVersion = "2016-04-01";
    resourceDefinition.children = ["metricDefinitions", "metrics"];

    let actions = [] as Action[];
    actions[0] = new Action("DELETE",
        "Delete",
        "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1")

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, actions));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = '# GET WorkerRole1\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles -ResourceName "x123cloudsvc/Production/WorkerRole1" -ApiVersion 2016-04-01\n\n';
    expectedScripts[1] = '# SET WorkerRole1\n$PropertiesObject = @{\n\t#Property = value;\n}\nSet-AzureRmResource -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles -ResourceName "x123cloudsvc/Production/WorkerRole1" -ApiVersion 2016-04-01 -Force\n\n';
    expectedScripts[2] = '# DELETE WorkerRole1\nRemove-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles -ResourceName "x123cloudsvc/Production/WorkerRole1" -ApiVersion 2016-04-01 -Force\n\n';
    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}

function scriptResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "CREATE"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, []));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = '# GET metricDefinitions\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions -ResourceName "x123cloudsvc/Production/WorkerRole1" -ApiVersion 2014-04-01\n\n';
    expectedScripts[1] = '# CREATE metricDefinitions\n$ResourceLocation = "West US"\n$ResourceName = "NewmetricDefinition"\n$PropertiesObject = @{\n\t#Property = value;\n}\nNew-AzureRmResource -Location $ResourceLocation -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions -ResourceName "x123cloudsvc/Production/WorkerRole1/$ResourceName" -ApiVersion 2014-04-01 -Force\n\n';
    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}

function scriptResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3SubName3() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["PUT", "GET", "DELETE"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = "{name}";

    let actions = [] as Action[];
    actions[0] = new Action("DELETE",
        "Delete",
        "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions/Percentage CPU");

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions/Percentage CPU";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, actions));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = '# GET Percentage CPU\nGet-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions -ResourceName "x123cloudsvc/Production/WorkerRole1/Percentage CPU" -ApiVersion 2014-04-01\n\n';
    expectedScripts[1] = '# SET Percentage CPU\n$PropertiesObject = @{\n\t#Property = value;\n}\nSet-AzureRmResource -PropertyObject $PropertiesObject -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions -ResourceName "x123cloudsvc/Production/WorkerRole1/Percentage CPU" -ApiVersion 2014-04-01 -Force\n\n';
    expectedScripts[2] = '# DELETE Percentage CPU\nRemove-AzureRmResource -ResourceGroupName cloudsvcrg -ResourceType Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions -ResourceName "x123cloudsvc/Production/WorkerRole1/Percentage CPU" -ApiVersion 2014-04-01 -Force\n\n';
    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}

function scriptResourceUrlWithList() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["PUT", "GETPOST"];
    resourceDefinition.apiVersion = "2016-03-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "POST";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rgrp1/providers/Microsoft.Web/sites/WebApp120170517014339/config/appsettings/list";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value,[]));
    let scriptGenerator = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();

    let expectedScripts = [] as Array<string>;
    expectedScripts[0] = '# LIST appsettings\n$resource = Invoke-AzureRmResourceAction -ResourceGroupName rgrp1 -ResourceType Microsoft.Web/sites/config -ResourceName "WebApp120170517014339/appsettings" -Action list -ApiVersion 2016-03-01 -Force\n$resource.Properties\n\n';
    expectedScripts[1] = '# SET list\n$PropertiesObject = @{\n\t#Property = value;\n}\nNew-AzureRmResource -PropertyObject $PropertiesObject -ResourceGroupName rgrp1 -ResourceType Microsoft.Web/sites/config -ResourceName "WebApp120170517014339/appsettings" -ApiVersion 2016-03-01 -Force\n\n';

    TestCommon.throwIfNotEqual(expectedScripts.length, actualSupportedCommands.length);

    let expectedScriptIndex: number = 0;
    for (let cmdActionPair of actualSupportedCommands) {
        TestCommon.throwIfNotEqual(expectedScripts[expectedScriptIndex++], scriptGenerator.getScript(cmdActionPair));
    }

    TestCommon.logSuccess(arguments);
}
