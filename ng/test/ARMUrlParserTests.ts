module armExplorer {

    namespace ARMUrlParserTests {

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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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
            let parser = new ARMUrlParser(value, []);
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