var parser = require("swagger-parser");

if (process.argv.length != 4) {
    printUsage();
    return;
}

switch (process.argv[2]) {
    case '-d': { //directory
        var fs = require('fs');
        var files = fs.readdirSync(process.argv[3]);
        files.forEach(function(item, index) {
            files[index] = process.argv[3]+"\\"+item;
        });
        break;
    }
    case '-f': { // file
        var files = [process.argv[3]];
        break;
    }
    default: {
        printUsage();
        return;
    }
}

var promises = [];
for (f of files) {
    promises.push(parser.parse(f));
}

Promise.all(promises).then(function(apis) {
    var operations = [];
    apis.forEach(function(api) {
        if (api) {
            for (var path in api.paths) {
                if (!shouldSkip(path)) {
                    if (api.paths.hasOwnProperty(path)) {
                        var current = api.paths[path];
                        for (var method in current){
                            if (current.hasOwnProperty(method)) {
                                var operation = {
                                    MethodName: getMethodNameFromHttpVerb(method),
                                    HttpMethod: method.toUpperCase(),
                                    Url: "https://management.azure.com" + path,
                                    ResponseBody: getResponseBody(current[method]),
                                    ResponseBodyDoc: getResponseBody(current[method], true),
                                    RequestBody: getRequestBody(current[method]),
                                    RequestBodyDoc: getRequestBody(current[method], true),
                                    ApiVersion: api.info.version
                                };
                                operations.push(operation);
                            }
                        }
                    }
                }
            }
        }
    })
    return operations;
})
.then(function(operations) {
    console.log(JSON.stringify(operations, undefined, 4));
});

function printUsage() {
    console.log("Usage: \n node ConvertSwaggerToExplorerSpecs.js -d pathToFolderWithMultiPartSwaggerAPI\n node ConvertSwaggerToExplorerSpecs.js -f pathToSwaggerAPIFile")
}

function getMethodNameFromHttpVerb(verb) {
    verb = verb.toLowerCase();
    if (verb === "get") {
        return "Get";
    } else if (verb === "put") {
        return "CreateOrUpdate";
    } else if (verb === "delete") {
        return "Delete";
    } else if (verb === "patch") {
        return "Update";
    } else {
      return "MethodNameWeird";
    }
}

function getResponseBody(swagger, isDoc) {
    if (!swagger.produces || swagger.produces.filter(function (e) { return (e === "application/json" || e === "text/json"); }).length > 0 ) {
        if (!swagger.responses["200"] || swagger.responses["200"].schema === undefined || swagger.responses["200"].schema.properties === undefined) {
            if (!isDoc) {console.error("error processing response body for operation: " + swagger.operationId);}
            if (!swagger.responses["200"]) {
                if (!isDoc) {console.error("Async operation or non 200 responses not supported. responses list is :" + JSON.stringify(swagger.responses));}
            } else if (swagger.responses["200"].schema === undefined || swagger.responses["200"].schema.properties === undefined){
                if (!isDoc) {console.error("200 response has undefined schema or properties");}
            }
            console.error("");
        } else {
            var schema = swagger.responses["200"].schema.properties.contentObject;
            if (schema) {
                return getOperationObject(schema, isDoc);
            }
        }
    }
}

function getRequestBody(swagger, isDoc) {
    if (!swagger.consumes || swagger.consumes.filter(function(e) { 
        return (e === "application/json" || e == "text/json"); 
    }).length > 0 ) {
        var parameter = swagger.parameters.filter(function(e) { return e.in === "body"; })[0];
        if (parameter && parameter.schema) {
            return getOperationObject(parameter.schema, isDoc);
        }
    }
}

function shouldSkip(path){
    var blackList= [
                "backup",
                "restore",
                "backup/config",
                "discover",
                "metrics",
                "repository",
                "Clone",
                "GetOperation",
                "register",
                "unregister",
                "GetSubscription",
                "PutSubscription",
                "ListSubscriptionStorageAccounts",
                "CheckDnsNameAvailability",
                "MigrateSubscription",
                "sharedResourceProviderBase",
                "kuduApiName",
                "ishostingenvironmentnameavailable",
                "ishostnameavailable",
                "ishostnamereservedornotallowed",
                "isusernameavailable",
                "premieraddonoffers",
                "subscriptions/{subscriptionId}/providers/Microsoft.Web/publishingCredentials",
                "webhostingplans",
                "{subscriptionid}/resourcegroups/{resourcegroupname}/providers/microsoft.web/webhostingplan",
                "/providers/Microsoft.Web/publishingUsers/{name}",
                "csrs",
                "deletedSites",
                "/workers/{workerName}",
                "/operations/{operationId}",
                "/extensions/{extensionApiMethod}",
                "/snapshots",
                "/restorablesnapshots"
                ];

    return blackList.some(function(e) {
        return path.toLowerCase().indexOf(e.toLowerCase()) !== -1;
    });
}


function getOperationObject(schema, isDoc) {
    if (schema.type !== "object" && schema.type !== "array" && !schema.properties) {
        return isDoc ? schema.description : "(" + schema.type + ")";
    }

    if (schema.type === "object" || schema.properties || schema.allOf) {
        var obj = {};
        if (schema.allOf){
            schema.allOf.forEach(function(item) {
                for (var prop in item.properties) {
                    if (item.properties.hasOwnProperty(prop)) {
                        obj[prop] = getOperationObject(item.properties[prop], isDoc);
                    }
                }
            })
        }
        for (var prop in schema.properties) {
            if (schema.properties.hasOwnProperty(prop)) {
                obj[prop] = getOperationObject(schema.properties[prop], isDoc);
            }
        }
        return obj;
    }

    if (schema.type === "array") {
        var arr = [{}];
        arr[0] = getOperationObject(schema.items, isDoc);
        return arr;
    }

    console.error("Unknwon type: " + schema.type);
}


if (!Array.prototype.some) {
    Array.prototype.some = function (fun/*, thisArg*/) {
        'use strict';

        if (this == null) {
            throw new TypeError('Array.prototype.some called on null or undefined');
        }

        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(thisArg, t[i], i, t)) {
                return true;
            }
        }

        return false;
    };
}