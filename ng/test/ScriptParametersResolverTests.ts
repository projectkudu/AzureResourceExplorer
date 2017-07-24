import {ResourceDefinition} from "../models/ResourceDefinition";
import {ISelectHandlerReturn} from "../models/ISelectHandlerReturn";
import {ARMUrlParser} from "../scriptGenerators/ARMUrlParser";
import {RMCommandInfo} from "../scriptGenerators/RMCommandInfo";
import {CmdletParameters} from "../scriptGenerators/CmdletParameters";
import {ResourceIdentifier} from "../scriptGenerators/ResourceIdentifier";
import { ResourceIdentifierType } from "../scriptGenerators/ResourceIdentifierType";
import { ScriptParametersResolver } from "../scriptGenerators/ScriptParametersResolver";
import { TestCommon } from "./TestCommon";
import { PsCmdType } from "../scriptGenerators/PSCmdType";
import {PowerShellScriptGenerator} from "../scriptGenerators/powershell/PowerShellScriptGenerator";
import {Action} from "../models/Action";
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
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions";
    value.resourceDefinition = resourceDefinition;

    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, []));
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Get, isAction: false, isSetAction: false }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

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
        TestCommon.throwIfObjectNotEqual(expectedcCmdletParameters[cmdIndex], resolver.getParameters());
    }

    TestCommon.logSuccess(arguments);
}

function getParametersForSubscriptionsSubId() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, []));
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Get, isAction: false, isSetAction: false }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

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
        TestCommon.throwIfObjectNotEqual(expectedCmdletParameters[cmdIndex], resolver.getParameters());
    }

    TestCommon.logSuccess(arguments);
}

function getParametersForSubscriptionsSubIdResGroup() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "CREATE"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, []));
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Get, isAction: false, isSetAction: false }, { cmd: PsCmdType.NewResourceGroup, isAction: false, isSetAction: false }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

    let cmdletParameters = {} as CmdletParameters;
    let cmdletResourceInfo = {} as ResourceIdentifier;
    cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithIDOnly;
    cmdletResourceInfo.resourceId = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups";
    cmdletParameters.resourceIdentifier = cmdletResourceInfo;
    cmdletParameters.apiVersion = "2014-04-01";
    cmdletParameters.isCollection = false;

    TestCommon.throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

    TestCommon.logSuccess(arguments);
}

function getParametersForResourceIDOnlyWithResourceGroupName() {
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
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, actions));
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [
        { cmd: PsCmdType.Get, isAction: false, isSetAction: false },
        { cmd: PsCmdType.Set, isAction: false, isSetAction: true },
        { cmd: PsCmdType.RemoveAction, isAction: true, isSetAction: false },
        { cmd: PsCmdType.InvokeAction, isAction: true, isSetAction: false },
        { cmd: PsCmdType.InvokeAction, isAction: true, isSetAction: false },
        { cmd: PsCmdType.InvokeAction, isAction: true, isSetAction: false }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

    let cmdletParameters = {} as CmdletParameters;
    let cmdletResourceInfo = {} as ResourceIdentifier;
    cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithIDOnly;
    cmdletResourceInfo.resourceId = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg";
    cmdletParameters.resourceIdentifier = cmdletResourceInfo;
    cmdletParameters.apiVersion = "2014-04-01";
    cmdletParameters.isCollection = false;
    TestCommon.throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

    TestCommon.logSuccess(arguments);
}

function getParametersForResGrpNameResType() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "CREATE"];
    resourceDefinition.apiVersion = "2016-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, []));
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Get, isAction: false, isSetAction: false }, { cmd: PsCmdType.New, isAction: false, isSetAction: false }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

    let cmdletParameters = {} as CmdletParameters;
    let cmdletResourceInfo = {} as ResourceIdentifier;
    cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupType;
    cmdletResourceInfo.resourceGroup = "cloudsvcrg";
    cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames";
    cmdletParameters.resourceIdentifier = cmdletResourceInfo;
    cmdletParameters.apiVersion = "2016-04-01";
    cmdletParameters.isCollection = true;
    TestCommon.throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

    TestCommon.logSuccess(arguments);
}

function getParametersForResGrpNameResTypeResName() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "PUT", "DELETE"];
    resourceDefinition.apiVersion = "2016-04-01";
    resourceDefinition.children = ["slots"];

    let actions = [] as Action[];
    actions[0] = new Action("DELETE",
        "Delete",
        "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc");

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, actions));
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Get, isAction: false, isSetAction: false }, { cmd: PsCmdType.Set, isAction: false, isSetAction: true },
        { cmd: PsCmdType.RemoveAction, isAction: true, isSetAction: false }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

    let cmdletParameters = {} as CmdletParameters;
    let cmdletResourceInfo = {} as ResourceIdentifier;
    cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
    cmdletResourceInfo.resourceGroup = "cloudsvcrg";
    cmdletResourceInfo.resourceName = "x123cloudsvc";
    cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames";
    cmdletParameters.resourceIdentifier = cmdletResourceInfo;
    cmdletParameters.apiVersion = "2016-04-01";
    cmdletParameters.isCollection = false;
    TestCommon.throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

    TestCommon.logSuccess(arguments);
}

function getParametersForResGrpNameResTypeResNameSubType1() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "CREATE"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, []));
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Get, isAction: false, isSetAction: false }, { cmd: PsCmdType.New, isAction: false, isSetAction: false }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

    let cmdletParameters = {} as CmdletParameters;
    let cmdletResourceInfo = {} as ResourceIdentifier;
    cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
    cmdletResourceInfo.resourceGroup = "cloudsvcrg";
    cmdletResourceInfo.resourceName = "x123cloudsvc";
    cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots";
    cmdletParameters.resourceIdentifier = cmdletResourceInfo;
    cmdletParameters.apiVersion = "2014-04-01";
    cmdletParameters.isCollection = false; // bug fix
    TestCommon.throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

    TestCommon.logSuccess(arguments);
}

function getParametersForResGrpNameResTypeResNameSubType1SubName1() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "DELETE", "PUT"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = ["roles"];

    let actions = [] as Action[];
    actions[0] = new Action("DELETE", "Delete", "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production");

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, actions));
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Get, isAction: false, isSetAction: false }, { cmd: PsCmdType.Set, isAction: false, isSetAction: true },
        { cmd: PsCmdType.RemoveAction, isAction: true, isSetAction: false }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

    let cmdletParameters = {} as CmdletParameters;
    let cmdletResourceInfo = {} as ResourceIdentifier;
    cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
    cmdletResourceInfo.resourceGroup = "cloudsvcrg";
    cmdletResourceInfo.resourceName = "x123cloudsvc/Production";
    cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots";
    cmdletParameters.resourceIdentifier = cmdletResourceInfo;
    cmdletParameters.apiVersion = "2014-04-01";
    cmdletParameters.isCollection = false;
    TestCommon.throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

    TestCommon.logSuccess(arguments);
}

function getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "CREATE"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, []));
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Get, isAction: false, isSetAction: false }, { cmd: PsCmdType.New, isAction: false, isSetAction: false }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

    let cmdletParameters = {} as CmdletParameters;
    let cmdletResourceInfo = {} as ResourceIdentifier;
    cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
    cmdletResourceInfo.resourceGroup = "cloudsvcrg";
    cmdletResourceInfo.resourceName = "x123cloudsvc/Production";
    cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots/roles";
    cmdletParameters.resourceIdentifier = cmdletResourceInfo;
    cmdletParameters.apiVersion = "2014-04-01";
    cmdletParameters.isCollection = false; // bug fix
    TestCommon.throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

    TestCommon.logSuccess(arguments);
}

function getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2SubName2() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "DELETE", "PUT"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = ["metricDefinitions", "metrics"];

    let actions = [] as Action[];
    actions[0] = new Action("DELETE",
        "Delete",
        "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1");

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, actions));
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Get, isAction: false, isSetAction: false }, { cmd: PsCmdType.Set, isAction: false, isSetAction: true },
        { cmd: PsCmdType.RemoveAction, isAction: true, isSetAction: false }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

    let cmdletParameters = {} as CmdletParameters;
    let cmdletResourceInfo = {} as ResourceIdentifier;
    cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
    cmdletResourceInfo.resourceGroup = "cloudsvcrg";
    cmdletResourceInfo.resourceName = "x123cloudsvc/Production/WorkerRole1";
    cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots/roles";
    cmdletParameters.resourceIdentifier = cmdletResourceInfo;
    cmdletParameters.apiVersion = "2014-04-01";
    cmdletParameters.isCollection = false;
    TestCommon.throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

    TestCommon.logSuccess(arguments);
}

function getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["GET", "CREATE"];
    resourceDefinition.apiVersion = "2014-04-01";
    resourceDefinition.children = "{name}";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, []));
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Get, isAction: false, isSetAction: false }, { cmd: PsCmdType.New, isAction: false, isSetAction: false }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

    let cmdletParameters = {} as CmdletParameters;
    let cmdletResourceInfo = {} as ResourceIdentifier;
    cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
    cmdletResourceInfo.resourceGroup = "cloudsvcrg";
    cmdletResourceInfo.resourceName = "x123cloudsvc/Production/WorkerRole1";
    cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions";
    cmdletParameters.resourceIdentifier = cmdletResourceInfo;
    cmdletParameters.apiVersion = "2014-04-01";
    cmdletParameters.isCollection = false; //bug fix
    TestCommon.throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

    TestCommon.logSuccess(arguments);
}

function getParametersForResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3SubName3() {
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
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Get, isAction: false, isSetAction: false }, { cmd: PsCmdType.Set, isAction: false, isSetAction: true },
        { cmd: PsCmdType.RemoveAction, isAction: true, isSetAction: false }];
    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

    let cmdletParameters = {} as CmdletParameters;
    let cmdletResourceInfo = {} as ResourceIdentifier;
    cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
    cmdletResourceInfo.resourceGroup = "cloudsvcrg";
    cmdletResourceInfo.resourceName = "x123cloudsvc/Production/WorkerRole1/Percentage CPU";
    cmdletResourceInfo.resourceType = "Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions";
    cmdletParameters.resourceIdentifier = cmdletResourceInfo;
    cmdletParameters.apiVersion = "2014-04-01";
    cmdletParameters.isCollection = false;
    TestCommon.throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

    TestCommon.logSuccess(arguments);
}

function getParametersForResourceUrlWithList() {
    let resourceDefinition = {} as ResourceDefinition;
    resourceDefinition.actions = ["PUT", "GETPOST"];
    resourceDefinition.apiVersion = "2016-03-01";

    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "POST";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rgrp1/providers/Microsoft.Web/sites/WebApp120170517014339/config/appsettings/list";
    value.resourceDefinition = resourceDefinition;
    let resolver = new ScriptParametersResolver(new ARMUrlParser(value, []));
    let scriptor = new PowerShellScriptGenerator(resolver);
    let actualSupportedCommands: Array<RMCommandInfo> = resolver.getSupportedCommands();
    let expectedSupportedCommands: Array<RMCommandInfo> = [{ cmd: PsCmdType.Invoke, isAction: false, isSetAction: false }, { cmd: PsCmdType.New, isAction: false, isSetAction: true }];

    TestCommon.throwIfArrayNotEqual(expectedSupportedCommands, actualSupportedCommands);

    let cmdletParameters = {} as CmdletParameters;
    let cmdletResourceInfo = {} as ResourceIdentifier;
    cmdletResourceInfo.resourceIdentifierType = ResourceIdentifierType.WithGroupTypeName;
    cmdletResourceInfo.resourceGroup = "rgrp1";
    cmdletResourceInfo.resourceName = "WebApp120170517014339/appsettings";
    cmdletResourceInfo.resourceType = "Microsoft.Web/sites/config";
    cmdletParameters.resourceIdentifier = cmdletResourceInfo;
    cmdletParameters.apiVersion = "2016-03-01";
    cmdletParameters.isCollection = false;
    TestCommon.throwIfObjectNotEqual(cmdletParameters, resolver.getParameters());

    TestCommon.logSuccess(arguments);
}

