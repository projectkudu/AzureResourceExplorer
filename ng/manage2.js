
//http://stackoverflow.com/a/22253161
angular.module("mp.resizer", [])
     .directive('resizer', function ($document) {

         return function ($scope, $element, $attrs) {

             $element.on('mousedown', function (event) {
                 event.preventDefault();

                 $document.on('mousemove', mousemove);
                 $document.on('mouseup', mouseup);
             });

             function mousemove(event) {

                 if ($attrs.resizer == 'vertical') {
                     // Handle vertical resizer
                     var x = event.pageX;

                     if ($attrs.resizerMax && x > $attrs.resizerMax) {
                         x = parseInt($attrs.resizerMax);
                     }

                     $element.css({
                         left: x + 'px'
                     });

                     var offset = 0;
                     if ($attrs.resizerOffsetElement) {
                         offset = $($attrs.resizerOffsetElement).outerWidth(true);
                     }

                     $($attrs.resizerLeft).css({
                         width: (x - offset) + 'px'
                     });

                     var oldLeft = $($attrs.resizerRight).position().left;
                     $($attrs.resizerRight).css({
                         left: (x + parseInt($attrs.resizerWidth)) + 'px',
                         width: $($attrs.resizerRight).outerWidth() - ((x + parseInt($attrs.resizerWidth)) - oldLeft) + 'px'
                     });

                 } else {
                     // Handle horizontal resizer
                     var y = window.innerHeight - event.pageY;

                     $element.css({
                         bottom: y + 'px'
                     });

                     $($attrs.resizerTop).css({
                         bottom: (y + parseInt($attrs.resizerHeight)) + 'px'
                     });
                     $($attrs.resizerBottom).css({
                         height: y + 'px'
                     });
                 }
             }

             function mouseup() {
                 $document.unbind('mousemove', mousemove);
                 $document.unbind('mouseup', mouseup);
             }
         };
     })

angular.module("armExplorer", ["ngRoute", "ngAnimate", "ngSanitize", "ui.bootstrap", "angularBootstrapNavTree", "rx", "mp.resizer"])
    .controller("rawBodyController", function ($scope, $routeParams, $location, $http, $q, $timeout, rx) {
        var requestEditor, responseEditor;
        initTenants();
        $(document).keydown(function (e) {
            if (e.ctrlKey && e.keyCode == 83) {
                e.preventDefault();
                e.stopPropagation();
                var content = requestEditor.session.getTextRange(requestEditor.getSelectionRange());
                var message = parseText(content);
                if (message !== undefined) {
                    $scope.loading = true;
                    if (window.localStorage) {
                        window.localStorage.csmRawContent = requestEditor.getValue();
                    }
                    $http({
                        method: "POST",
                        url: "api/operations",
                        data: {
                            Url: message.url,
                            HttpMethod: message.httpMethod,
                            RequestBody: message.body,
                            RequireApiVersion: true
                        }
                    }).error(function (err) {
                        responseEditor.setValue(JSON.stringify(err, undefined, 2));
                    }).success(function (data) {
                        responseEditor.setValue(JSON.stringify(data, undefined, 2));
                    }).finally(function () {
                        responseEditor.moveCursorTo(0, 0);
                        responseEditor.session.selection.clearSelection();
                        responseEditor.resize();
                        $scope.loading = false;
                    });

                } else {
                    responseEditor.setValue("Couldn't parse the selected text below \n\n" + content);
                    responseEditor.session.selection.clearSelection();
                    responseEditor.moveCursorTo(0, 0);
                }
            }
        });
        $timeout(function () {
            requestEditor = ace.edit("request-editor");
            responseEditor = ace.edit("response-editor");
            [requestEditor, responseEditor].map(function (e) {
                e.setOptions({
                    fontSize: 16,
                    wrap: "free",
                    showPrintMargin: false,
                    scrollPastEnd: true
                });
                e.setTheme("ace/theme/ambiance");//_night_eighties");
                e.getSession().setMode("ace/mode/rawarm");
                //e.commands.removeCommand('find');
            });
            var initialContent = window.localStorage.csmRawContent;
            requestEditor.setValue(initialContent ? initialContent : getTutorialContent());
            requestEditor.session.selection.clearSelection();
            requestEditor.moveCursorTo(0, 0);

        });

        $scope.tenantSelect = function () {
            window.location = "api/tenants/" + $scope.selectedTenant.id;
        };

        function getTutorialContent() {
            return "# You can execute a request by highlighting it and hitting CTR+S (for Send)\n# You can send a request body simply by writing the body right after the request.\n# The body has to be a valid JSON object\n\n## Get subscriptions\nGET https:\/\/management.azure.com\/subscriptions?api-version=2014-11-01\n\n## Get resource groups in a subscription\nGET https:\/\/management.azure.com\/subscriptions\/<subscriptionId>\/resourceGroups?api-version=2015-01-01\n\n## Get sites in a resource group\nGET https:\/\/management.azure.com\/subscriptions\/<subscriptionId>\/resourceGroups\/<resourceGroup>\/providers\/Microsoft.Web\/sites?api-version=2014-11-01\n\n## Get site\'s config\nGET https:\/\/management.azure.com\/subscriptions\/<subscriptionId>\/resourceGroups\/<resourceGroup>\/providers\/Microsoft.Web\/sites\/<siteName>\/config\/web?api-version=2014-11-01\n\n## Get site\'s app settings\nPOST https:\/\/management.azure.com\/subscriptions\/<subscriptionId>\/resourceGroups\/<resourceGroup>\/providers\/Microsoft.Web\/sites\/<siteName>\/config\/appsettings\/list?api-version=2014-11-01\n\n## Set site\'s app settings\nPUT https:\/\/management.azure.com\/subscriptions\/<subscriptionId>\/resourceGroups\/<resourceGroup>\/providers\/Microsoft.Web\/sites\/<siteName>\/config\/appsettings?api-version=2014-11-01\n\n{\n \"properties\": {\n     \"WEBSITE_NODE_DEFAULT_VERSION\": \"0.10.32\",\n     \"newAppSetting\": \"New Value\"\n  }\n}";
        }

        function parseText(text) {
            try {
                var pattern = /^\s*([a-zA-Z]*)\s(.*)[\r\n]*([\s\S]*)/mi;
                var matches = text.match(pattern);
                return {
                    httpMethod: matches[1],
                    url: matches[2],
                    body: (matches[3] ? JSON.parse(matches[3]) : undefined)
                };
            } catch (e) {
                return undefined;
            }
        }

        function initTenants() {
            $http({
                method: "GET",
                url: "api/tenants"
            }).success(function (tenants) {
                $scope.tenants = tenants.map(function (tenant) {
                    return {
                        name: tenant.DisplayName + " (" + tenant.DomainName + ")",
                        id: tenant.TenantId,
                        current: tenant.Current
                    };
                });
                $scope.selectedTenant = $scope.tenants[$scope.tenants.indexOfDelegate(function (tenant) { return tenant.current; })];
            });
        }
    })
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
    });

ace.define('ace/mode/rawarm', function (require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var Tokenizer = require("ace/tokenizer").Tokenizer;
    var ExampleHighlightRules = require("ace/mode/example_highlight_rules").ExampleHighlightRules;

    var Mode = function () {
        this.$tokenizer = new Tokenizer(new ExampleHighlightRules().getRules());
    };
    oop.inherits(Mode, TextMode);

    (function () {
        // Extra logic goes here. (see below)
    }).call(Mode.prototype);

    exports.Mode = Mode;
});

var escapedRe = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
    "u[0-9a-fA-F]{4}|" + // unicode
    "[0-2][0-7]{0,2}|" + // oct
    "3[0-6][0-7]?|" + // oct
    "37[0-7]?|" + // oct
    "[4-7][0-7]?|" + //oct
    ".)";

ace.define('ace/mode/example_highlight_rules', function (require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
    var ExampleHighlightRules = function () {

        this.$rules = {
            start: [{
                token: ["keyword", "storage.type"],
                regex: "(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH|get|post|put|delete|head|options|patch)(.*)"
            },
            {
                token: "comment",
                regex: "\\#.*$"
            }/*,
            {
                token: ["paren", "constant.language"],
                regex: "([a-zA-Z].*\\:)(.*)$"
            }*/,
            {
                token: "paren",
                regex: "(\"[a-zA-Z].*?\":)"
            },
            {
                token: "string",
                regex: "'(?=.)",
                next: "qstring"
            },
            {
                token: "string",
                regex: '"(?=.)',
                next: "qqstring"
            },
            {
                token: "constant.numeric", // hex
                regex: /0[xX][0-9a-fA-F]+\b/
            },
            {
                token: "constant.numeric", // float
                regex: /[+-]?\d+(?:(?:\.\d*)?(?:[eE][+-]?\d+)?)?\b/
            },
            {
                token: "keyword.operator",
                regex: "null"
            },
            {
                token: "constant.language.boolean",
                regex: "true|false"
            },
            {
                token: "invalid",
                regex: "^Couldn't parse.*$"
            }],
            "qqstring": [
            {
                token: "constant.language.escape",
                regex: escapedRe
            }, {
                token: "string",
                regex: "\\\\$",
                next: "qqstring"
            }, {
                token: "string",
                regex: '"|$',
                next: "start"
            }, {
                defaultToken: "string"
            }
            ],
            "qstring": [
                {
                    token: "constant.language.escape",
                    regex: escapedRe
                }, {
                    token: "string",
                    regex: "\\\\$",
                    next: "qstring"
                }, {
                    token: "string",
                    regex: "'|$",
                    next: "start"
                }, {
                    defaultToken: "string"
                }
            ]
        };
    };

    oop.inherits(ExampleHighlightRules, TextHighlightRules);

    exports.ExampleHighlightRules = ExampleHighlightRules;
});