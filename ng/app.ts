/// <reference path="references.ts" />

module managePortalUi {
    "use strict";

    var managePortalUiMvc = angular.module("managePortal", ["ngRoute", "ngAnimate", "ngSanitize", "ui.bootstrap", "angularBootstrapNavTree"])
        .controller("bodyController", bodyController)
        .controller("homeController", homeController)
        .service("managePortalApi", managePortalApi)
        .config(($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) => {
            $routeProvider
                .when("/", {
                    controller: "homeController",
                    templateUrl: "ng/ngViews/Home.html",
                    caseInsensitiveMatch: true
                })
                .otherwise({ redirectTo: "/" }); //TODO: add 404 page
            $locationProvider.html5Mode(true);
        });

    $(function () {
        $('label.tree-toggler').click(function () {
            $(this).parent().children('ul.tree').toggle(300);
        });
        if (typeof String.prototype.startsWith != 'function') {
            String.prototype.startsWith = function (str) {
                return this.slice(0, str.length) == str;
            };
        }
        if (typeof String.prototype.endsWith != 'function') {
            String.prototype.endsWith = function (str) {
                return this.indexOf(str, this.length - str.length) !== -1;
            };
        }

        Array.prototype.remove = function (from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        };
    });
}