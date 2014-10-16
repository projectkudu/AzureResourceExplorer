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
            $scope.my_tree_handler = (e) => {
                $scope.viewTitle = e.label;
                $scope.jsonHtml = e.data.html;
            };

            $scope.my_data = [];

            $http({
                method: "GET",
                url: "/api/subscriptions",
                responseType: "application/json; charset=utf-8"
            }).success((subscriptions: any) => {
                    $scope.my_data = subscriptions.value.map((subscription) => {
                        return {
                            label: subscription.displayName,
                            data: { subscriptionId: subscription.subscriptionId, html: managePortalApi.syntaxHighlight(subscription) },
                            resource_icon: "fa fa-cube fa-fw"
                        };
                    });
                    $scope.my_data.map((subscription: any) => {
                        $http({
                            method: "GET",
                            url: "/api/subscriptions/" + subscription.data.subscriptionId + "/resourceGroups",
                            responseType: "application/json; charset=utf-8"
                        }).success((resourceGroups: any) => {
                                subscription.children = resourceGroups.value.map((resourceGroup: any) => {
                                    return {
                                        label: resourceGroup.name,
                                        data: { html: managePortalApi.syntaxHighlight(resourceGroup) },
                                        resource_icon: "fa fa-cloud fa-fw"
                                    };
                                });
                                subscription.children.map((resourceGroup: any) => {
                                    var websitesNodes, whpNodes;
                                    var q1 = $http({
                                        method: "GET",
                                        url: "/api/methods/WebSites/" + subscription.data.subscriptionId + "/ListAsync?resourceGroupName=" + resourceGroup.label,
                                        responseType: "application/json; charset=utf-8"
                                    }).success((websites: any) => {
                                            websitesNodes = websites.map((website: any) => {
                                                return {
                                                    label: website.Name,
                                                    data: { html: managePortalApi.syntaxHighlight(website) },
                                                    resource_icon: "fa fa-html5 fa-fw"
                                                };
                                            });
                                        });
                                    var q2 = $http({
                                        method: "GET",
                                        url: "/api/methods/WebHostingPlans/" + subscription.data.subscriptionId + "/ListAsync?resourceGroupName=" + resourceGroup.label,
                                        responseType: "application/json; charset=utf-8"
                                    }).success((WebHostingPlans: any) => {
                                            whpNodes = WebHostingPlans.map((WebHostingPlan: any) => {
                                                return {
                                                    label: WebHostingPlan.Name,
                                                    data: { html: managePortalApi.syntaxHighlight(WebHostingPlan) },
                                                    resource_icon: "fa fa-building fa-fw"
                                                };
                                            });
                                        });
                                    q1.then(() => q2.then(() => { if (whpNodes.length !== 0 || websitesNodes.length !== 0) resourceGroup.children = whpNodes.concat(websitesNodes) }));
                                });
                            });
                    });

                });
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