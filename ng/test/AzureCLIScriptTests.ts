import {IResourceHandlerResolver} from "../scriptGenerators/IResourceHandlerResolver";
import {ICliResource} from "../scriptGenerators/ICliResource";
import {CliResourceType} from "../scriptGenerators/CliResourceType";
import {ISelectHandlerReturn} from "../models/ISelectHandlerReturn";
import {ARMUrlParser} from "../scriptGenerators/ARMUrlParser";
import {TestCommon} from "./TestCommon";
import {ResourceDefinition} from "../models/ResourceDefinition";
import {ScriptParametersResolver} from "../scriptGenerators/ScriptParametersResolver";
import {MockResourceHandlerResolver} from "./MockResourceHandlerResolver";
import {CliScriptGenerator} from "../scriptGenerators/cli/CliScriptGenerator";
import {GenericResource as GenericResource1} from "../scriptGenerators/cli/resources/GernericResource";
import {WebApps} from "../scriptGenerators/cli/resources/WebApps";
import {Subscriptions} from "../scriptGenerators/cli/resources/Subscriptions";
import {WebApp} from "../scriptGenerators/cli/resources/WebApp";
import {Subscription} from "../scriptGenerators/cli/resources/Subscription";
import {ResourceGroups} from "../scriptGenerators/cli/resources/ResourceGroups";
import {ResourceGroup} from "../scriptGenerators/cli/resources/ResourceGroup";
import {SubscriptionLocations} from "../scriptGenerators/cli/resources/SubscriptionLocations";
import {Action} from "../models/Action";

module armExplorer {

    namespace CliScriptGeneratorTests {
        scriptSubscriptions();
        scriptSubscription();
        scriptSubscriptionLocations();
        scriptResourceGroups();
        scriptResourceGroup();
        scriptWebApps();
        scriptWebApp();
        scriptGenericResource();

        function scriptSubscriptions() {
            let resourceDefinition = {} as ResourceDefinition;
            resourceDefinition.actions = ["GET"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions";
            value.resourceDefinition = resourceDefinition;

            let parser = new ARMUrlParser(value,[]);
            let resolver: ScriptParametersResolver = new ScriptParametersResolver(parser);
            let resourceHandlerResolver = new MockResourceHandlerResolver(new Subscriptions(resolver));
            let scriptor: CliScriptGenerator = new CliScriptGenerator(resolver, resourceHandlerResolver);
            TestCommon.throwIfNotEqual(CliResourceType.Subscriptions, scriptor.getCliResourceType());

            const expected = "az account list\n\n";
            TestCommon.throwIfNotEqual(expected, scriptor.getScript());

            TestCommon.logSuccess(arguments);
    
        }
        
        function scriptSubscription() {
            let resourceDefinition = {} as ResourceDefinition;
            resourceDefinition.actions = ["GET"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000";
            value.resourceDefinition = resourceDefinition;

            let parser = new ARMUrlParser(value,[]);
            let resolver: ScriptParametersResolver = new ScriptParametersResolver(parser);
            let resourceHandlerResolver = new MockResourceHandlerResolver(new Subscription(resolver));
            let scriptor: CliScriptGenerator = new CliScriptGenerator(resolver, resourceHandlerResolver);
            TestCommon.throwIfNotEqual(CliResourceType.Subscription, scriptor.getCliResourceType());

            const expected = "az account show --subscription 00000000-0000-0000-0000-000000000000\n\n";
            TestCommon.throwIfNotEqual(expected, scriptor.getScript());

            TestCommon.logSuccess(arguments);
        }

        function scriptResourceGroups() {
            let resourceDefinition = {} as ResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2014-04-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups";
            value.resourceDefinition = resourceDefinition;

            let parser = new ARMUrlParser(value,[]);
            let resolver: ScriptParametersResolver = new ScriptParametersResolver(parser);
            let resourceHandlerResolver = new MockResourceHandlerResolver(new ResourceGroups(resolver));
            let scriptor: CliScriptGenerator = new CliScriptGenerator(resolver, resourceHandlerResolver);

            TestCommon.throwIfNotEqual(CliResourceType.ResourceGroups, scriptor.getCliResourceType());

            const expectedScriptGet = "az group list\n\n";
            const expectedScriptNew = "az group create --location westus --name NewResourceGroupName\n\n";
            TestCommon.throwIfNotEqual(expectedScriptGet + expectedScriptNew , scriptor.getScript());

            TestCommon.logSuccess(arguments);
        }

        function scriptResourceGroup() {
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

            let parser = new ARMUrlParser(value,actions);
            let resolver: ScriptParametersResolver = new ScriptParametersResolver(parser);
            let resourceHandlerResolver = new MockResourceHandlerResolver(new ResourceGroup(resolver));
            let scriptor: CliScriptGenerator = new CliScriptGenerator(resolver, resourceHandlerResolver);

            TestCommon.throwIfNotEqual(CliResourceType.ResourceGroup, scriptor.getCliResourceType());

            const expectedScriptGet = 'az group show --name "cloudsvcrg"\n\n';
            const expectedScriptSet = 'az group update --name "cloudsvcrg" <properties>\n\n';
            const expectedScriptRemove = 'az group delete --name "cloudsvcrg"\n\n';
            TestCommon.throwIfNotEqual(expectedScriptGet + expectedScriptSet + expectedScriptRemove, scriptor.getScript());

            TestCommon.logSuccess(arguments);
        }

        function scriptWebApps() {
            let resourceDefinition = {} as ResourceDefinition;
            resourceDefinition.actions = ["GET", "CREATE"];
            resourceDefinition.apiVersion = "2014-03-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/6e6e25b9-3ade-43f4-bdde-1864842e524b/resourceGroups/rgrp1/providers/Microsoft.Web/sites";
            value.resourceDefinition = resourceDefinition;

            let parser = new ARMUrlParser(value, []);
            let resolver: ScriptParametersResolver = new ScriptParametersResolver(parser);
            let resourceHandlerResolver = new MockResourceHandlerResolver(new WebApps(resolver));
            let scriptor: CliScriptGenerator = new CliScriptGenerator(resolver, resourceHandlerResolver);

            TestCommon.throwIfNotEqual(CliResourceType.WebApps, scriptor.getCliResourceType());

            const expectedScriptGet = 'az webapp list --resource-group "rgrp1"\n\n';
            const expectedScriptNew = 'az webapp create --resource-group "rgrp1" --plan planName --name NewWebAppName\n\n';
            TestCommon.throwIfNotEqual(expectedScriptGet + expectedScriptNew, scriptor.getScript());

            TestCommon.logSuccess(arguments);
        }

        function scriptWebApp() {
            let resourceDefinition = {} as ResourceDefinition;
            resourceDefinition.actions = ["GET", "DELETE", "PUT", "CREATE"];
            resourceDefinition.apiVersion = "2016-03-01";
            resourceDefinition.children = "{name}";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/6e6e25b9-3ade-43f4-bdde-1864842e524b/resourceGroups/rgrp1/providers/Microsoft.Web/sites/xdfxdfxdfxdf";
            value.resourceDefinition = resourceDefinition;

            let parser = new ARMUrlParser(value, []);
            let resolver: ScriptParametersResolver = new ScriptParametersResolver(parser);
            let resourceHandlerResolver = new MockResourceHandlerResolver(new WebApp(resolver));
            let scriptor: CliScriptGenerator = new CliScriptGenerator(resolver, resourceHandlerResolver);

            TestCommon.throwIfNotEqual(CliResourceType.WebApp, scriptor.getCliResourceType());

            const expectedScriptGet = 'az webapp show --name "xdfxdfxdfxdf" --resource-group "rgrp1"\n\n';
            const expectedScriptSet = 'az resource update --id /subscriptions/6e6e25b9-3ade-43f4-bdde-1864842e524b/resourceGroups/rgrp1/providers/Microsoft.Web/sites/xdfxdfxdfxdf --api-version 2016-03-01 --set properties.key=value\n\n'
            const expectedScriptNew = 'az webapp create --resource-group "rgrp1" --plan planName --name NewWebAppName\n\n';
            TestCommon.throwIfNotEqual(expectedScriptGet + expectedScriptSet + expectedScriptNew, scriptor.getScript());

            TestCommon.logSuccess(arguments);
        }

        function scriptGenericResource() {
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
            let resourceHandlerResolver = new MockResourceHandlerResolver(new GenericResource1(resolver));
            let scriptor: CliScriptGenerator = new CliScriptGenerator(resolver, resourceHandlerResolver);

            TestCommon.throwIfNotEqual(CliResourceType.GenericResource, scriptor.getCliResourceType());

            const expectedScriptGet = 'az resource show --id /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc --api-version 2016-04-01\n\n';
            const expectedScriptSet = 'az resource update --id /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc --api-version 2016-04-01 --set properties.key=value\n\n';
            const expectedScriptDelete = 'az resource delete --id /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc --api-version 2016-04-01\n\n';
            TestCommon.throwIfNotEqual(expectedScriptGet + expectedScriptSet + expectedScriptDelete, scriptor.getScript());

            TestCommon.logSuccess(arguments);
        }

        function scriptSubscriptionLocations() {
            let resourceDefinition = {} as ResourceDefinition;
            resourceDefinition.actions = ["GET"];
            resourceDefinition.apiVersion = "2014-04-01";

            let value = {} as ISelectHandlerReturn;
            value.httpMethod = "GET";
            value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/locations";
            value.resourceDefinition = resourceDefinition;
            

            let parser = new ARMUrlParser(value,[]);
            let resolver: ScriptParametersResolver = new ScriptParametersResolver(parser);
            let resourceHandlerResolver = new MockResourceHandlerResolver(new SubscriptionLocations(resolver));
            let scriptor: CliScriptGenerator = new CliScriptGenerator(resolver, resourceHandlerResolver);
            TestCommon.throwIfNotEqual(CliResourceType.SubscriptionLocations, scriptor.getCliResourceType());
            const expectedScript = "az account list-locations\n\n";
            TestCommon.throwIfNotEqual(expectedScript, scriptor.getScript());

            TestCommon.logSuccess(arguments);
        }
    }
}