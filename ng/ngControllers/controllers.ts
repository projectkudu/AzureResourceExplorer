/// <reference path="../references.ts" />

module managePortalUi {
    "use strict";

    export class angularBaseController {
        public static $inject = [
            "$scope",
            "$routeParams",
            "$location",
            "$http",
            "managePortalApi"
        ];

        constructor($scope?: IBaseScope, $location?: ng.ILocationService) {

        }
    }

    export class bodyController extends angularBaseController {

        private resourceToQueryStringName = {
            "WebSite": "webSiteName",
            "WebHostingPlan": "webHostingPlanName"
        };

        constructor(
            private $scope: any,
            private $routeParams: IBodyRouteParams,
            private $location: ng.ILocationService,
            private $http: ng.IHttpService,
            private managePortalApi: managePortalApi) {
            super();

            $scope.jsonHtml = "select something";
            $scope.resources = [];
            $scope.methods = {};
            $scope.treeControl = {};
            $scope.inject = {};
            var container = document.getElementById("jsoneditor");
            var editor = new JSONEditor(container);

            $scope.selectResourceHandler = (resource) => {
                $scope.inject[resource.resourceName.replace("{", "").replace("}", "")] = resource.value;
                var resourceUrls = resourcesUrlsTable.filter((r) => r.resourceName === resource.resourceName);
                if (resourceUrls.length !== 1) return;
                var resourceUrl = resourceUrls[0];
                var getActions = resourceUrl.actions.filter((a) => (a === "Get" || a === "GetPost"));
                if (getActions.length === 1) {
                    var getAction = (getActions[0] === "GetPost" ? "Post" : "Get");
                    var url = (getAction === "Post" ? resourceUrl.url + "/list" : resourceUrl.url);
                    for (var value in $scope.inject) {
                        url = url.replace("{" + value + "}", $scope.inject[value]);
                    }
                    var q;
                    if (url.endsWith("resourceGroups") || url.endsWith("subscriptions") || url.split("/").length === 3) {
                        q = $http({
                            method: "GET",
                            url: "api" + url.substring(url.indexOf("/subscriptions")),//"https://management.azure.com/", "api/"),
                        }).success((data: any) => {
                                $scope.jsonHtml = this.managePortalApi.syntaxHighlight(data);
                                $scope.rawData = data;
                            });
                    } else {
                        q = $http({
                            method: "POST",
                            url: "api/operations",
                            data: {
                                Url: url,
                                HttpMethod: getAction
                            }
                        }).success((data: any) => {
                                $scope.jsonHtml = this.managePortalApi.syntaxHighlight(data);
                                $scope.rawData = data;
                            });
                    }
                    q.then(() => {
                        var putActions = resourceUrl.actions.filter((a) => (a === "Post" || a === "Put"));
                        if (putActions.length === 1) {
                            var editable = jQuery.extend(true, {}, resourceUrl.responseBody);
                            this.megeObject($scope.rawData, editable);
                            editor.set(editable);
                            $scope.show = true;
                            editor.expandAll();
                            if (url.endsWith("list")) {
                                url = url.substring(0, url.lastIndexOf("/"));
                            }
                            $scope.putUrl = url;
                            $scope.selectedResource = resource;
                        } else {
                            editor.set({});
                            $scope.show = false;
                        }
                    });
                }
                //$scope.jsonHtml = resource.data.html;
                //$scope.selectedResource = resource;
                //$scope.resourceMethods = $scope.methods[resource.data.resourceType];
                //$scope.show = false;
            };

            $scope.invokeMethod = () => {
                var userObject = editor.get();
                managePortalApi.cleanObject(userObject);
                console.log(userObject);

                $http({
                    method: "POST",
                    url: "api/operations",
                    data: {
                        Url: $scope.putUrl,
                        HttpMethod: "Put",
                        RequestBody: userObject
                    }
                }).success((e) => {
                        $scope.selectResourceHandler($scope.selectedResource);
                    });
            };

            $scope.expandResourceHandler = (branch, row) => {
                if (branch.expanded) {
                    $scope.treeControl.collapse_branch(branch);
                    return;
                }

                var resourceUrls = resourcesUrlsTable.filter((r) => r.resourceName === branch.resourceName);
                if (resourceUrls.length !== 1) return;
                var resourceUrl = resourceUrls[0];

                if (Array.isArray(resourceUrl.children)) {
                    branch.children = resourceUrl.children.map((c) => {
                        return {
                            label: c,
                            resourceName: c
                        };
                    });
                } else if (typeof resourceUrl.children === "string") {
                    var childUrl = resourceUrl.url;
                    for (var value in $scope.inject) {
                        childUrl = childUrl.replace("{" + value + "}", $scope.inject[value]);
                    }

                    if (childUrl.endsWith("resourceGroups") || childUrl.endsWith("subscriptions") || childUrl.split("/").length === 3) {
                        $http({
                            method: "GET",
                            url: "api" + childUrl.substring(childUrl.indexOf("/subscriptions")),
                        }).success((data: any) => {
                                branch.children = (data.value ? data.value : data).map((d) => {
                                    return {
                                        label: (d.displayName ? d.displayName : d.name),
                                        resourceName: resourceUrl.children,
                                        value: (d.subscriptionId ? d.subscriptionId : d.name)
                                    };
                                });
                            });
                    } else {
                        $http({
                            method: "POST",
                            url: "api/operations",
                            data: {
                                Url: childUrl,
                                HttpMethod: "Get"
                            }
                        }).success((data: any) => {
                                branch.children = (data.value ? data.value : data).map((d) => {
                                    return {
                                        label: (d.displayName ? d.displayName : d.name),
                                        resourceName: resourceUrl.children,
                                        value: (d.subscriptionId ? d.subscriptionId : d.name)
                                    };
                                });
                            });
                    }
                } //else if undefined

                $scope.treeControl.expand_branch(branch);
            };

            var resourcesUrlsTable = [];

            this.addToResourceUrlTable(resourcesUrlsTable, {
                MethodName: "Get",
                HttpMethod: "Get",
                ResponseBody: {},
                Url: "api/subscriptions"
            });

            this.addToResourceUrlTable(resourcesUrlsTable, {
                MethodName: "Get",
                HttpMethod: "Get",
                ResponseBody: {},
                Url: "api/subscriptions/{subscriptionId}"
            });

            $http({
                method: "GET",
                url: "api/operations"
            }).success((operations: IOperation[]) => {
                    operations.sort((a, b) => {
                        return a.Url.localeCompare(b.Url);
                    });
                    operations.map((operation) => {
                        if (operation.Url.indexOf("{name}") !== -1) {
                            operation.Url = operation.Url.replace("{name}", "{webHostingPlanName}");
                        }
                        if (operation.Url.indexOf("resourcegroups") !== -1) {
                            operation.Url = operation.Url.replace("resourcegroups", "resourceGroups");
                        }
                        if (operation.Url.endsWith("/")) {
                            operation.Url = operation.Url.substring(0, operation.Url.length - 1);
                        }

                        this.addToResourceUrlTable(resourcesUrlsTable, operation);
                        resourcesUrlsTable.map((r) => {
                            if (Array.isArray(r.children)) {
                                r.children.sort()
                        }
                        });
                    });
                });

            $scope.resources = [{
                label: "subscriptions",
                resourceName: "subscriptions",
                data: undefined,
                resource_icon: "fa fa-cube fa-fw"
            }];
        }

        addToResourceUrlTable(resourceUrlTable: any[], operation: IOperation, url?: string): any {
            url = (operation ? operation.Url : url);
            var segments = url.split("/").filter(a => a.length !== 0);
            var resourceName = segments.pop();
            var addedElement;

            if (resourceName === "list" && operation && operation.HttpMethod === "Post") {
                this.setParent(resourceUrlTable, url, "GetPost");
                return;
            }

            //set the element itself
            var elements = resourceUrlTable.filter((r) => r.resourceName === resourceName);
            if (elements.length === 1) {
                //it's there, update it's actions
                if (operation) {
                    elements[0].responseBody = (elements[0].responseBody ? elements[0].responseBody : operation.ResponseBody);
                    if (elements[0].actions.filter((c) => c === operation.HttpMethod).length === 0) {
                        elements[0].actions.push(operation.HttpMethod);
                    }
                }
            } else {
                addedElement = {
                    resourceName: resourceName,
                    children: undefined,
                    actions: (operation ? [operation.HttpMethod] : []),
                    url: url,
                    responseBody: operation ? operation.RequestBody : {}
                };
                resourceUrlTable.push(addedElement);
            }

            // set the parent recursively
            this.setParent(resourceUrlTable, url);
            return addedElement;
        }

        setParent(resourceUrlTable: any[], url: string, action?: string) {
            var segments = url.split("/").filter(a => a.length !== 0);
            var resourceName = segments.pop();
            var parentName = segments.pop();
            if (parentName === undefined) return;
            var parents = resourceUrlTable.filter((r) => r.resourceName === parentName);
            if (parents.length === 1) {
                var parent = parents[0];
                if (resourceName.match(/\{.*\}/g)) {
                    // this means the parent.children should either be an undefined, or a string.
                    // if it's anything else assert! because that means we have a mistake in out assumptions
                    if (parent.children === undefined || typeof parent.children === "string") {
                        parent.children = resourceName;
                    } else {
                        console.log("ASSERT, typeof parent.children: " + typeof parent.children)
                    }
                    this.setParent(resourceUrlTable, url.substring(0, url.lastIndexOf("/")))
                } else if (resourceName !== "list") {
                    // this means that the resource is a pre-defined one. the parent.children should be undefined or array
                    // if it's anything else assert! because that means we have a mistake in out assumptions
                    if (parent.children === undefined) {
                        parent.children = [resourceName];
                    } else if (Array.isArray(parent.children)) {
                        if (parent.children.filter((c) => c === resourceName).length === 0) {
                            parent.children.push(resourceName);
                        }
                    } else {
                        console.log("ASSERT, typeof parent.children: " + typeof parent.children)
                    }
                    this.setParent(resourceUrlTable, url.substring(0, url.lastIndexOf("/")))
                }
            } else {
                //this means the parent is not in the array. Add it
                var parent = this.addToResourceUrlTable(resourceUrlTable, undefined, url.substring(0, url.lastIndexOf("/")));
                this.setParent(resourceUrlTable, url.substring(0, url.lastIndexOf("/")))
            }
            if (action && parent.actions.filter((c) => c === action).length === 0) {
                parent.actions.push(action);
            }
        }

        megeObject(source: any, target: any) {
            for (var sourceProperty in source) {
                if (source.hasOwnProperty(sourceProperty) && target.hasOwnProperty(sourceProperty)) {
                    if (!this.managePortalApi.isEmptyObjectorArray(source[sourceProperty]) && (typeof source[sourceProperty] === "object") && !Array.isArray(source[sourceProperty])) {
                        this.megeObject(source[sourceProperty], target[sourceProperty]);
                    } else if (!this.managePortalApi.isEmptyObjectorArray(source[sourceProperty])) {
                        target[sourceProperty] = source[sourceProperty];
                    }
                }
            }
        }
    }


    export class homeController extends angularBaseController {
        constructor(
            private $scope: any,
            private $routeParams: IBodyRouteParams,
            private $location: ng.ILocationService,
            private $http: ng.IHttpService,
            private managePortalApi: managePortalApi) {
            super();
        }
    }
}
