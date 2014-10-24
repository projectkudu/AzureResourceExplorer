/// <reference path="references.ts" />

module managePortalUi {
    "use strict";

    var managePortalUiMvc = angular.module("managePortal", ["ngRoute", "ngAnimate", "ngSanitize", "ui.bootstrap", "angularBootstrapNavTree"])
        .controller("bodyController", bodyController)
        .controller("homeController", homeController)
        .service("managePortalApi", managePortalApi)
        .config(($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) => {
            $routeProvider
                .when("/manage", {
                    controller: "homeController",
                    templateUrl: "ng/ngViews/Home.html",
                    caseInsensitiveMatch: true
                })
                .otherwise({ redirectTo: "/manage" }); //TODO: add 404 page
            $locationProvider.html5Mode(true);
        });
}