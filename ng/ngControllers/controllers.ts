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
        constructor(
            private $scope: any,
            private $routeParams: IBodyRouteParams,
            private $location: ng.ILocationService,
            private $http: ng.IHttpService,
            private managePortalApi: managePortalApi) {
            super();
            console.log("start");
            $scope.jsonHtml = "select something";
            var container = document.getElementById("jsoneditor");
            var editor = new JSONEditor(container);
            $scope.my_tree_handler = (e) => {
                $scope.viewTitle = e.label;
                $scope.jsonHtml = e.data.html;
                $scope.selected = e;
                if (!e.data.resource_type || e.data.resource_type === 0) return;
                $scope.selectedResourceType = e.data.resource_type === 1 ? "WebSites" : "WebHostingPlans";
                $http({
                    method: "GET",
                    url: "api/methods/" + $scope.selectedResourceType,
                    responseType: "application/json; charset=utf-8"
                }).success((methods: any) => {
                    $scope.methods = methods.filter((m) => m.name.startsWith("Get") || m.name.startsWith("Update") || m.name.startsWith("CreateOrUpdate"));
                    });
            };

            $scope.my_data = [];

            $http({
                method: "GET",
                url: "api/subscriptions",
                responseType: "application/json; charset=utf-8"
            }).success((subscriptions: any) => {
                    $scope.my_data = subscriptions.value.map((subscription) => {
                        return {
                            label: subscription.displayName,
                            data: { subscriptionId: subscription.subscriptionId, html: managePortalApi.syntaxHighlight(subscription), json: subscription, resource_type: 0 },
                            children: [{ label: "Websites", resource_icon: "fa fa-html5 fa-fw", data: { html: "select a WebSite" } }, { label: "WebHostingPlans", resource_icon: "fa fa-building fa-fw", data: { html: "select a WebHostingPlan" }}],
                            resource_icon: "fa fa-cube fa-fw"
                        };
                    });
                $scope.my_data.map((subscription: any) => {

                    $http({
                        method: "GET",
                        url: "api/subscriptions/" + subscription.data.subscriptionId + "/providers/Microsoft.Web/sites",
                        responseType: "application/json; charset=utf-8"
                    }).success((websites: any) => {
                        subscription.children[0].children = websites.map((website: any) => {
                                return {
                                    label: website.name,
                                    data: { html: managePortalApi.syntaxHighlight(website), json: website, subscriptionId: subscription.data.subscriptionId, resource_type: 1 },
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
                                    data: { html: managePortalApi.syntaxHighlight(WebHostingPlan), json: WebHostingPlan, resource_type: 2 },
                                    resource_icon: "fa fa-building fa-fw"
                                };
                            });
                        });
                    });

            });

            $scope.selectMethod = (method: any) => {
                console.log(method);
                console.log(this.$scope.selected);
                editor.set({});
                $scope.show = false;
                $scope.jsonHtml = "";
                $scope.selectedMethod = method;
                $http({
                    method: "GET",
                    url: "api/methods/" + $scope.selectedResourceType + "/" + $scope.selected.data.subscriptionId + "/" + method.name.replace("Update", "Get") + "?resourceGroupName=" + managePortalApi.getRerouceGroupNameFromWebSpaceName($scope.selected.data.json.properties.webSpace) + "&webSiteName=" + $scope.selected.data.json.name,
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
                    url: "api/methods/" + $scope.selectedResourceType + "/" + $scope.selected.data.subscriptionId + "/" + $scope.selectedMethod.name + "?resourceGroupName=" + managePortalApi.getRerouceGroupNameFromWebSpaceName($scope.selected.data.json.properties.webSpace) + "&webSiteName=" + $scope.selected.data.json.name,
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