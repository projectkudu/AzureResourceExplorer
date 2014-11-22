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
            private $scope: IBodyScope,
            private $routeParams: IBodyRouteParams,
            private $location: ng.ILocationService,
            private $http: ng.IHttpService,
            private managePortalApi: managePortalApi) {
            super();

            $scope.jsonHtml = "select something";
            $scope.treeControl = <any>{};
            var container = document.getElementById("jsoneditor");
            var editor = new JSONEditor(container);

            $scope.selectResourceHandler = (resource: ITreeBranch) => {
                var resourceUrls = resourcesUrlsTable.filter((r) => {
                    return (r.resourceName === resource.resourceName) && ((r.url === resource.resourceUrl) || r.url === (resource.resourceUrl + "/" + resource.resourceName));
                });
                if (resourceUrls.length !== 1) return;
                var resourceUrl = resourceUrls[0];
                var getActions = resourceUrl.actions.filter((a) => (a === "Get" || a === "GetPost"));
                if (getActions.length === 1) {
                    var getAction = (getActions[0] === "GetPost" ? "Post" : "Get");
                    var url = (getAction === "Post" ? resourceUrl.url + "/list" : resourceUrl.url);
                    url = this.injectTemplateValues(url, resource);
                    var q;
                    if (url.endsWith("resourceGroups") || url.endsWith("subscriptions") || url.split("/").length === 3) {
                        q = $http({
                            method: "GET",
                            url: "api" + url.substring(url.indexOf("/subscriptions")),
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
                    return q.then(() => {
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
            };

            $scope.invokeMethod = () => {
                var userObject = editor.get();
                managePortalApi.cleanObject(userObject);
                $scope.loading = true;
                $http({
                    method: "POST",
                    url: "api/operations",
                    data: {
                        Url: $scope.putUrl,
                        HttpMethod: "Put",
                        RequestBody: userObject
                    }
                }).then((e) => {
                        $scope.selectResourceHandler($scope.selectedResource).then(() => {
                            $scope.loading = false;
                            $("html, body").scrollTop(0);
                        });
                    });
            };

            // Flowing $event is currently a hack as there must be a better way in Angular to do this.
            $scope.expandResourceHandler = (branch: ITreeBranch, row: ITreeRow, event: Event) => {
                if (branch.expanded) {
                    // clear the children array on collapse
                    branch.children.length = 0;
                    $scope.treeControl.collapse_branch(branch);
                    return;
                }

                var resourceUrls = resourcesUrlsTable.filter((r) => {
                    return (r.resourceName === branch.resourceName) && ((r.url === branch.resourceUrl) || r.url === (branch.resourceUrl + "/" + branch.resourceName));
                });
                if (resourceUrls.length > 1) {
                    console.log("ASSERT! More than 1 resourceUrl. This is an error");
                    return;
                }
                if (resourceUrls.length !== 1) return;
                var resourceUrl = resourceUrls[0];

                if (Array.isArray(resourceUrl.children)) {
                    branch.children = resourceUrl.children.map((c) => {
                        return {
                            label: c,
                            resourceName: c,
                            resourceUrl: resourceUrl.url
                        };
                    });
                } else if (typeof resourceUrl.children === "string") {
                    var childUrl = this.injectTemplateValues(resourceUrl.url, branch);

                    var originalTreeIcon = row.tree_icon;
                    $(event.target).removeClass(originalTreeIcon).addClass("fa fa-refresh fa-spin");

                    if (childUrl.endsWith("resourceGroups") || childUrl.endsWith("subscriptions") || childUrl.split("/").length === 3) {
                        $http({
                            method: "GET",
                            url: "api" + childUrl.substring(childUrl.indexOf("/subscriptions")),
                        }).success((data: any) => {
                                branch.children = (data.value ? data.value : data).map((d) => {
                                    return {
                                        label: (d.displayName ? d.displayName : d.name),
                                        resourceName: resourceUrl.children,
                                        resourceUrl: resourceUrl.url,
                                        value: (d.subscriptionId ? d.subscriptionId : d.name)
                                    };
                                });
                        }).finally(() => {
                                $(event.target).removeClass("fa fa-refresh fa-spin").addClass(originalTreeIcon);
                                $scope.treeControl.expand_branch(branch);
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
                                        resourceUrl: resourceUrl.url,
                                        value: (d.subscriptionId ? d.subscriptionId : d.name)
                                    };
                                });
                            }).finally(() => {
                                $(event.target).removeClass("fa fa-refresh fa-spin").addClass(originalTreeIcon);
                                $scope.treeControl.expand_branch(branch);
                            });
                    }
                    return;
                } //else if undefined
                $scope.treeControl.expand_branch(branch);
            };

            var resourcesUrlsTable: IResourceUrlInfo[] = [];

            $http({
                method: "GET",
                url: "api/operations"
            }).success((operations: IOperation[]) => {
                    operations.sort((a, b) => {
                        return a.Url.localeCompare(b.Url);
                    });
                operations.map((operation) => {
                        if (operation.Url.indexOf("SourceControls/{name}") !== -1) {
                            operation.Url = operation.Url.replace("SourceControls/{name}", "SourceControls/{sourceControlName}");
                        }
                        if (operation.Url.indexOf("serverFarms/{name}") !== -1) {
                            operation.Url = operation.Url.replace("serverFarms/{name}", "serverFarms/{webHostingPlanName}");
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
                    (<any>console).table(resourcesUrlsTable);
                $scope.resources = resourcesUrlsTable.map((r) => r.url.split("/")).filter((a) => a.length > 3).map(a => {
                    return { resourceName: a[3], resourceUrl: a.slice(0, 4).join("/") };
                }).getUnique((d) => d.resourceName).map((s) => {
                        return {
                            label: s.resourceName,
                            resourceName: s.resourceName,
                            resourceUrl: s.resourceUrl,
                            data: undefined,
                            resource_icon: "fa fa-cube fa-fw",
                            children: []
                        };
                    });
                });

            $scope.resources = [];
        }

        addToResourceUrlTable(resourceUrlTable: IResourceUrlInfo[], operation: IOperation, url?: string): IResourceUrlInfo {
            url = (operation ? operation.Url : url);
            var segments = url.split("/").filter(a => a.length !== 0);
            var resourceName = segments.pop();
            var addedElement;

            if (resourceName === "list" && operation && operation.HttpMethod === "Post") {
                this.setParent(resourceUrlTable, url, "GetPost");
                return;
            }

            //set the element itself
            var elements = resourceUrlTable.filter((r) => r.url === url);
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

        setParent(resourceUrlTable: IResourceUrlInfo[], url: string, action?: string) {
            var segments = url.split("/").filter(a => a.length !== 0);
            var resourceName = segments.pop();
            var parentName = url.substring(0, url.lastIndexOf("/"));//segments.pop();
            if (parentName === undefined || parentName === "" || resourceName === undefined) return;
            var parents = resourceUrlTable.filter((r) => r.url === parentName);
            var parent;
            if (parents.length === 1) {
                parent = parents[0];
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
                parent = this.addToResourceUrlTable(resourceUrlTable, undefined, url.substring(0, url.lastIndexOf("/")));
                this.setParent(resourceUrlTable, url);
            }
            if (action && parent && parent.actions.filter((c) => c === action).length === 0) {
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

        injectTemplateValues(url: string, branch: ITreeBranch): string{
            var resourceParent = branch;
            while (resourceParent !== undefined) {
                if (resourceParent.value !== undefined) {
                    url = url.replace(resourceParent.resourceName, resourceParent.value);
                }
                resourceParent = this.$scope.treeControl.get_parent_branch(resourceParent);
            }
            return url;
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
