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

            var container = document.getElementById("jsoneditor");
            var editor = new JSONEditor(container);

            $scope.selectResourceHandler = (resource) => {
                $scope.jsonHtml = resource.data.html;
                $scope.selectedResource = resource;
                $scope.resourceMethods = $scope.methods[resource.data.resourceType];
                $scope.show = false;
            };

            $http({
                method: "GET",
                url: "api/subscriptions",
                responseType: "application/json; charset=utf-8"
            }).success((subscriptions: any) => {
                $scope.resources = subscriptions.value.map((subscription) => {
                        return {
                            label: subscription.displayName,
                            data: { subscriptionId: subscription.subscriptionId, html: managePortalApi.syntaxHighlight(subscription), json: subscription, resourceType: "Subscription" },
                            children: [{ label: "Websites", resource_icon: "fa fa-html5 fa-fw", data: { html: "select a WebSite" } }, { label: "WebHostingPlans", resource_icon: "fa fa-building fa-fw", data: { html: "select a WebHostingPlan" }}],
                            resource_icon: "fa fa-cube fa-fw"
                        };
                    });
                $scope.resources.map((subscription: any) => {

                    $http({
                        method: "GET",
                        url: "api/subscriptions/" + subscription.data.subscriptionId + "/providers/Microsoft.Web/sites",
                        responseType: "application/json; charset=utf-8"
                    }).success((websites: any) => {
                        subscription.children[0].children = websites.map((website: any) => {
                                return {
                                    label: website.name,
                                    data: { html: managePortalApi.syntaxHighlight(website), json: website, subscriptionId: subscription.data.subscriptionId, resourceType: "WebSite" },
                                    resource_icon: "fa fa-html5 fa-fw"
                                };
                            });
                    });

                    $http({
                        method: "GET",
                        url: "api/subscriptions/" + subscription.data.subscriptionId + "/providers/Microsoft.Web/serverfarms",
                        responseType: "application/json; charset=utf-8"
                    }).success((WebHostingPlans: any) => {
                        subscription.children[1].children = WebHostingPlans.map((WebHostingPlan: any) => {
                                return {
                                    label: WebHostingPlan.name,
                                    data: { html: managePortalApi.syntaxHighlight(WebHostingPlan), json: WebHostingPlan, subscriptionId: subscription.data.subscriptionId, resourceType: "WebHostingPlan" },
                                    resource_icon: "fa fa-building fa-fw"
                                };
                            });
                        });
                    });

            });

            $http({
                method: "GET",
                url: "api/methods/WebSites",
                responseType: "application/json; charset=utf-8"
            }).success((methods: any) => {
                $scope.methods.WebSite = methods.filter((m) => m.name.startsWith("Get") || m.name.startsWith("Update") || m.name.startsWith("CreateOrUpdate"));
            });

            $http({
                method: "GET",
                url: "api/methods/WebHostingPlans",
                responseType: "application/json; charset=utf-8"
            }).success((methods: any) => {
                $scope.methods.WebHostingPlan = methods.filter((m) => m.name.startsWith("Get") || m.name.startsWith("Update") || m.name.startsWith("CreateOrUpdate"));
            });

            $scope.selectMethod = (method: any) => {
                editor.set({});
                $scope.show = false;
                $scope.jsonHtml = "";
                $scope.selectedMethod = method;
                $http({
                    method: "GET",
                    url: "api/methods/" + $scope.selectedResource.data.resourceType + "s" + "/" + $scope.selectedResource.data.subscriptionId + "/" + method.name.replace("Update", "Get") + "?resourceGroupName=" + managePortalApi.getRerouceGroupNameFromWebSpaceName($scope.selectedResource.data.json.properties.webSpace) + "&" + this.resourceToQueryStringName[$scope.selectedResource.data.resourceType] + "=" + $scope.selectedResource.data.json.name,
                    responseType: "application/json; charset=utf-8"
                }).success((data: any) => {
                    $scope.jsonHtml = managePortalApi.syntaxHighlight(data);
                    if (method.name.startsWith("Get")) return;
                    if (method.name === "UpdateAppSettingsAsync" || method.name === "UpdateMetadataAsync" || method.name === "UpdateConnectionStringsAsync") {
                        if (!managePortalApi.isEmptyObjectorArray((data.Resource.Properties))) {
                            method.arguments.parameters.Properties = data.Resource.Properties;
                        }
                    } else {
                        for (var sourceProperty in data) {
                            if (data.hasOwnProperty(sourceProperty)) {
                                if (!managePortalApi.isEmptyObjectorArray((data[sourceProperty])) &&
                                    method.arguments.parameters.hasOwnProperty(sourceProperty)) {
                                    method.arguments.parameters[sourceProperty] = data[sourceProperty];
                                }
                            }
                        }
                    }
                    editor.set(method.arguments.parameters);
                    editor.expandAll();
                    $scope.show = true;
                });
            }
            $scope.invokeMethod = () => {
                var userObject = editor.get();
                managePortalApi.cleanObject(userObject);
                console.log(userObject);
                $http({
                    method: "POST",
                    url: "api/methods/" + $scope.selectedResource.data.resourceType + "s" + "/" + $scope.selectedResource.data.subscriptionId + "/" + $scope.selectedMethod.name + "?resourceGroupName=" + managePortalApi.getRerouceGroupNameFromWebSpaceName($scope.selectedResource.data.json.properties.webSpace) + "&" + this.resourceToQueryStringName[$scope.selectedResource.data.resourceType] + "=" + $scope.selectedResource.data.json.name,
                    data: userObject,
                    responseType: "application/json; charset=utf-8"
                }).success((e) => {
                        $scope.selectMethod($scope.selectedMethod);
                });

            };
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
            console.log("homne");
        }
    }
}
