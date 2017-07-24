import {ISelectHandlerReturn} from "../models/ISelectHandlerReturn";
import {ARMUrlParser} from "../scriptGenerators/ARMUrlParser";
import {ResourceIdentifier} from "../scriptGenerators/ResourceIdentifier";
import { ResourceIdentifierType } from "../scriptGenerators/ResourceIdentifierType";
import { TestCommon } from "./TestCommon";

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
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithIDOnly, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("/subscriptions", resourceIdentifier.resourceId);
    TestCommon.throwIfDefined(resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceGroup);
    TestCommon.throwIfDefined(resourceIdentifier.resourceType);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResouceIDOnlyWithSubId() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithIDOnly, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("/subscriptions/00000000-0000-0000-0000-000000000000", resourceIdentifier.resourceId);
    TestCommon.throwIfDefined(resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceGroup);
    TestCommon.throwIfDefined(resourceIdentifier.resourceType);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResourceIDOnlyWithResourceGroup() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithIDOnly, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups", resourceIdentifier.resourceId);
    TestCommon.throwIfDefined(resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceGroup);
    TestCommon.throwIfDefined(resourceIdentifier.resourceType);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResourceIDOnlyWithResourceGroupName() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithIDOnly, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg", resourceIdentifier.resourceId);
    TestCommon.throwIfDefined(resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceGroup);
    TestCommon.throwIfDefined(resourceIdentifier.resourceType);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResGrpNameResType() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithGroupType, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
    TestCommon.throwIfNotEqual("Microsoft.ClassicCompute/domainNames", resourceIdentifier.resourceType);
    TestCommon.throwIfDefined(resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceId);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResGrpNameResTypeResName() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
    TestCommon.throwIfNotEqual("Microsoft.ClassicCompute/domainNames", resourceIdentifier.resourceType);
    TestCommon.throwIfNotEqual("x123cloudsvc", resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceId);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResGrpNameResTypeResNameSubType1() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
    TestCommon.throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots", resourceIdentifier.resourceType);
    TestCommon.throwIfNotEqual("x123cloudsvc", resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceId);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResGrpNameResTypeResNameSubType1SubName1() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
    TestCommon.throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots", resourceIdentifier.resourceType);
    TestCommon.throwIfNotEqual("x123cloudsvc/Production", resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceId);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
    TestCommon.throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots/roles", resourceIdentifier.resourceType);
    TestCommon.throwIfNotEqual("x123cloudsvc/Production", resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceId);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2SubName2() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
    TestCommon.throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots/roles", resourceIdentifier.resourceType);
    TestCommon.throwIfNotEqual("x123cloudsvc/Production/WorkerRole1", resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceId);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
    TestCommon.throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions", resourceIdentifier.resourceType);
    TestCommon.throwIfNotEqual("x123cloudsvc/Production/WorkerRole1", resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceId);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResGrpNameResTypeResNameSubType1SubName1SubType2SubName2SubType3SubName3() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "GET";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/cloudsvcrg/providers/Microsoft.ClassicCompute/domainNames/x123cloudsvc/slots/Production/roles/WorkerRole1/metricDefinitions/Percentage CPU";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("cloudsvcrg", resourceIdentifier.resourceGroup);
    TestCommon.throwIfNotEqual("Microsoft.ClassicCompute/domainNames/slots/roles/metricDefinitions", resourceIdentifier.resourceType);
    TestCommon.throwIfNotEqual("x123cloudsvc/Production/WorkerRole1/Percentage CPU", resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceId);
    TestCommon.logSuccess(arguments);
}

function parseUrlWithResourceUrlWithList() {
    let value = {} as ISelectHandlerReturn;
    value.httpMethod = "POST";
    value.url = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rgrp1/providers/Microsoft.Web/sites/WebApp120170517014339/config/appsettings/list";
    let parser = new ARMUrlParser(value, []);
    let resourceIdentifier: ResourceIdentifier = parser.getResourceIdentifier();
    TestCommon.throwIfNotEqual(ResourceIdentifierType.WithGroupTypeName, resourceIdentifier.resourceIdentifierType);
    TestCommon.throwIfNotEqual("rgrp1", resourceIdentifier.resourceGroup);
    TestCommon.throwIfNotEqual("Microsoft.Web/sites/config", resourceIdentifier.resourceType);
    TestCommon.throwIfNotEqual("WebApp120170517014339/appsettings", resourceIdentifier.resourceName);
    TestCommon.throwIfDefined(resourceIdentifier.resourceId);
    TestCommon.logSuccess(arguments);
}

