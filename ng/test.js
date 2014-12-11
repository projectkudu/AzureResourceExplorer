angular.module("managePortal", ["ngRoute", "ngAnimate", "ngSanitize", "ui.bootstrap", "angularBootstrapNavTree", "rx"])
    .controller("bodyController", function ($scope, $routeParams, $location, $http, $q, $timeout, rx) {

        $scope.jsonHtml = "select something";
        $scope.treeControl = {};
        $scope.resourcesUrlsTable = [];
        $scope.resources = [];
        var editor;
        $timeout(function () {
            editor = ace.edit("jsoneditor");//new JSONEditor(document.getElementById("jsoneditor"));
            editor.setOptions({
                maxLines: Infinity,
                fontSize: 15
            });
            editor.setTheme("ace/theme/tomorrow");
            editor.getSession().setMode("ace/mode/json");
        });

        $scope.$createObservableFunction("selectResourceHandler")
            .flatMapLatest(selectResource)
            .do(function () {}, function (err) {
                $scope.invoking = false;
                $scope.loading = false;
                if (err.config && err.config.resourceUrl && !isEmptyObjectorArray(err.config.resourceUrl.requestBody)) {
                    var resourceUrl = err.config.resourceUrl;
                    delete err.config.resourceUrl;
                    var editable = jQuery.extend(true, {}, resourceUrl.requestBody);
                    editor.setValue(JSON.stringify(editable, undefined, 4));
                    editor.session.selection.clearSelection();
                    $scope.show = true;
                    $scope.jsonHtml = ""
                }
                $scope.errorResponse = syntaxHighlight(err);
            })
            .retry()
            .subscribe(function (value) {
                delete $scope.putError;
                $scope.invoking = false;
                $scope.loading = false;
                if (value.data === undefined) {
                    if (value.resourceUrl !== undefined && !isEmptyObjectorArray(value.resourceUrl.requestBody)) {
                        var editable = jQuery.extend(true, {}, value.resourceUrl.requestBody);
                        editor.setValue(JSON.stringify(editable, undefined, 4));
                        editor.session.selection.clearSelection();
                        $scope.show = true;
                        $scope.jsonHtml = "";
                    } else {
                        editor.setValue("");
                        $scope.show = false;
                        $scope.jsonHtml = "No GET Url";
                    }
                    if (value.resource) $scope.selectedResource = { label: value.resource.resourceName, url: value.url };
                    return;
                }
                var data = value.data;
                var resourceUrl = value.resourceUrl;
                var url = value.url;
                var resource = value.resource;
                $scope.jsonHtml = syntaxHighlight(data);
                $scope.rawData = data;
                $scope.putUrl = url;
                var putActions = resourceUrl.actions.filter(function (a) { return (a === "POST" || a === "PUT"); });
                if (putActions.length === 1) {
                    var editable = jQuery.extend(true, {}, resourceUrl.requestBody);
                    mergeObject($scope.rawData, editable);
                    editor.setValue(JSON.stringify(editable, undefined, 4));
                    editor.session.selection.clearSelection();
                    $scope.show = true;
                    if (url.endsWith("list")) {
                        $scope.putUrl = url.substring(0, url.lastIndexOf("/"));
                    }
                } else {
                    editor.setValue("");
                    $scope.show = false;
                }

                resource.actions = resourceUrl.actions.filter(function (a) { return (a === "DELETE"); }).map(function(a) {
                    return {
                        httpMethod: a,
                        name: "Delete",
                        url: url
                    };
                });
                if (Array.isArray(resourceUrl.children))
                    Array.prototype.push.apply(resource.actions, resourceUrl.children.filter(function (childString) {
                        var d = $scope.resourcesUrlsTable.filter(function (r) {
                            return (r.resourceName === childString) && ((r.url === resourceUrl.url) || r.url === (resourceUrl.url + "/" + childString));
                        });
                        return d.length === 1;
                    }).map(function (childString) {
                        var d = $scope.resourcesUrlsTable.filter(function (r) {
                            return (r.resourceName === childString) && ((r.url === resourceUrl.url) || r.url === (resourceUrl.url + "/" + childString));
                        });
                        var dd = d[0];
                        if (dd.children === undefined && Array.isArray(dd.actions) && dd.actions.filter(function (actionName) { return actionName === "POST" }).length > 0) {
                            return {
                                httpMethod: "POST",
                                name: dd.resourceName,
                                url: url + "/" + dd.resourceName
                            };
                        }
                    }).filter(function(r) {return r !== undefined;}));

                resource.url = url;
                resource.httpMethod = value.httpMethod
                $scope.selectedResource = resource;
            });

        $scope.invokeAction = function (action, url) {
            $scope.loading = true;
            delete $scope.actionResponse;
            $http({
                method: "POST",
                url: "api/operations",
                data: {
                    Url: url,
                    HttpMethod: action
                }
            }).success(function(data){
                $scope.actionResponse = syntaxHighlight(data);
                $scope.loading = false;
                var parent = $scope.treeControl.get_parent_branch($scope.treeControl.get_selected_branch());
                if (action === "DELETE") {
                    $scope.treeControl.select_branch(parent);
                    $scope.treeControl.collapse_branch(parent);
                    $timeout(function () {
                        $("html, body").scrollTop(0);
                        $("#data-tab").find('a:first').click();
                    }, 900);
                } else {
                    $scope.selectResourceHandler($scope.selectedResource);
                    $("html, body").scrollTop(0);
                }

            }).error(function(err){
                $scope.loading = false;
                $scope.actionResponse = syntaxHighlight(err);
            });
        };

        $scope.invokePut = function () {
            delete $scope.putError;
            var userObject = JSON.parse(editor.getValue());
            cleanObject(userObject);
            $scope.invoking = true;
            $http({
                method: "POST",
                url: "api/operations",
                data: {
                    Url: $scope.putUrl,
                    HttpMethod: "PUT",
                    RequestBody: userObject
                }
            }).error(function (err) {
                $scope.putError = syntaxHighlight(err);
                $scope.invoking = false;
                $scope.loading = false;
            }).success(function () {
                $scope.selectResourceHandler($scope.selectedResource);
            });
        };

        $scope.expandResourceHandler = function (branch, row, event) {
            if (branch.is_leaf) return;
            if (branch.expanded) {
                // clear the children array on collapse
                branch.children.length = 0;
                $scope.treeControl.collapse_branch(branch);
                return;
            }

            var resourceUrls = $scope.resourcesUrlsTable.filter(function (r) {
                return (r.resourceName === branch.resourceName) && ((r.url === branch.resourceUrl) || r.url === (branch.resourceUrl + "/" + branch.resourceName));
            });
            if (resourceUrls.length > 1) {
                console.log("ASSERT! More than 1 resourceUrl. This is an error");
                return;
            }
            if (resourceUrls.length !== 1) return;
            var resourceUrl = resourceUrls[0];

            if (Array.isArray(resourceUrl.children)) {
                //TODO
                branch.children = resourceUrl.children.map(function (c) {
                    var child = $scope.resourcesUrlsTable.filter(function (r) {
                        return (r.resourceName === c) && ((r.url === resourceUrl.url) || r.url === (resourceUrl.url + "/" + c));
                    });
                    if (child[0].children === undefined && Array.isArray(child[0].actions) && child[0].actions.filter(function (actionName) { return actionName === "POST" }).length > 0) return;
                    return {
                        label: c,
                        resourceName: c,
                        resourceUrl: resourceUrl.url,
                        is_leaf: (child.length > 0 && child[0].children ? false : true)
                    };
                }).filter(function (f) { return f !== undefined;});
            } else if (typeof resourceUrl.children === "string") {
                var childUrl = injectTemplateValues(resourceUrl.url, branch);

                var originalTreeIcon = row.tree_icon;
                $(event.target).removeClass(originalTreeIcon).addClass("fa fa-refresh fa-spin");
                var httpConfig = (childUrl.endsWith("resourceGroups") || childUrl.endsWith("subscriptions") || childUrl.split("/").length === 3)
                  ? {
                      method: "GET",
                      url: "api" + childUrl.substring(childUrl.indexOf("/subscriptions")),
                  }
                  : {
                      method: "POST",
                      url: "api/operations",
                      data: {
                          Url: childUrl,
                          HttpMethod: "GET"
                      }
                  };
                return $http(httpConfig).success(function (data) {
                    branch.children = (data.value ? data.value : data).map(function (d) {
                        var child = $scope.resourcesUrlsTable.filter(function (r) {
                            return (r.resourceName === resourceUrl.children) && ((r.url === resourceUrl.url) || r.url === (resourceUrl.url + "/" + resourceUrl.children));
                        });

                        return {
                            label: (d.displayName ? d.displayName : d.name),
                            resourceName: resourceUrl.children,
                            resourceUrl: resourceUrl.url,
                            value: (d.subscriptionId ? d.subscriptionId : d.name),
                            is_leaf: (child.length > 0  && child[0].children ? false : true)
                        };
                    });
                }).finally(function () {
                    $(event.target).removeClass("fa fa-spinner fa-spin").addClass(originalTreeIcon);
                    $scope.treeControl.expand_branch(branch);
                });
            } //else if undefined
            $scope.treeControl.expand_branch(branch);
        };

        $scope.tenantSelect = function () {
            window.location = "api/tenants/" + $scope.selectedTenant.id;
        };

        $http({
            method: "GET",
            url: "api/operations"
        }).success(function (operations) {
            operations.sort(function (a, b) {
                return a.Url.localeCompare(b.Url);
            });
            operations.map(function (operation) {
                //TODO: remove this
                operation = fixOperationUrl(operation);

                addToResourceUrlTable(operation);
                $scope.resourcesUrlsTable.map(function (r) {
                    if (Array.isArray(r.children)) {
                        r.children.sort()
                    }
                });
            });
            $scope.resources = $scope.resourcesUrlsTable.map(function (r) { return r.url.split("/"); }).filter(function (a) { return a.length > 3; }).map(function (a) {
                return { resourceName: a[3], resourceUrl: a.slice(0, 4).join("/") };
            }).getUnique(function (d) { return d.resourceName; }).map(function (s) {
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

        function fixOperationUrl(operation) {
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
            return operation;
        }

        function addToResourceUrlTable(operation, url) {
            url = (operation ? operation.Url : url);
            var segments = url.split("/").filter(function (a) { return a.length !== 0 });
            var resourceName = segments.pop();
            var addedElement;

            if (resourceName === "list" && operation && operation.HttpMethod === "POST") {
                setParent(url, "GETPOST");
                return;
            }

            //set the element itself
            var elements = $scope.resourcesUrlsTable.filter(function (r) { return r.url === url });
            if (elements.length === 1) {
                //it's there, update it's actions
                if (operation) {
                    elements[0].requestBody = (elements[0].requestBody ? elements[0].requestBody : operation.RequestBody);
                    if (elements[0].actions.filter(function (c) { return c === operation.HttpMethod }).length === 0) {
                        elements[0].actions.push(operation.HttpMethod);
                    }
                }
            } else {
                addedElement = {
                    resourceName: resourceName,
                    children: undefined,
                    actions: (operation ? [operation.HttpMethod] : []),
                    url: url,
                    requestBody: operation ? operation.RequestBody : {}
                };
                $scope.resourcesUrlsTable.push(addedElement);
            }

            // set the parent recursively
            setParent(url);
            return addedElement;
        }

        function setParent(url, action) {
            var segments = url.split("/").filter(function (a) { return a.length !== 0; });
            var resourceName = segments.pop();
            var parentName = url.substring(0, url.lastIndexOf("/"));//segments.pop();
            if (parentName === undefined || parentName === "" || resourceName === undefined) return;
            var parents = $scope.resourcesUrlsTable.filter(function (r) { return r.url === parentName; });
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
                } else if (resourceName !== "list") {
                    // this means that the resource is a pre-defined one. the parent.children should be undefined or array
                    // if it's anything else assert! because that means we have a mistake in out assumptions
                    if (parent.children === undefined) {
                        parent.children = [resourceName];
                    } else if (Array.isArray(parent.children)) {
                        if (parent.children.filter(function (c) { return c === resourceName; }).length === 0) {
                            parent.children.push(resourceName);
                        }
                    } else {
                        console.log("ASSERT, typeof parent.children: " + typeof parent.children)
                    }
                }
            } else {
                //this means the parent is not in the array. Add it
                parent = addToResourceUrlTable(undefined, url.substring(0, url.lastIndexOf("/")));
                setParent(url);
            }
            if (action && parent && parent.actions.filter(function (c) { return c === action; }).length === 0) {
                parent.actions.push(action);
            }
        }

        function injectTemplateValues(url, branch) {
            var resourceParent = branch;
            while (resourceParent !== undefined) {
                if (resourceParent.value !== undefined) {
                    url = url.replace(resourceParent.resourceName, resourceParent.value);
                }
                resourceParent = $scope.treeControl.get_parent_branch(resourceParent);
            }
            return url;
        }

        function selectResource(resource) {
            $scope.loading = true;
            delete $scope.errorResponse;
            var resourceUrls = $scope.resourcesUrlsTable.filter(function (r) {
                return (r.resourceName === resource.resourceName) && ((r.url === resource.resourceUrl) || r.url === (resource.resourceUrl + "/" + resource.resourceName));
            });
            if (resourceUrls.length !== 1) return rx.Observable.fromPromise($q.when({resource: resource}));
            var resourceUrl = resourceUrls[0];
            var getActions = resourceUrl.actions.filter(function (a) {
                return (a === "GET" || a === "GETPOST");
            });
            if (getActions.length === 1) {
                var getAction = (getActions[0] === "GETPOST" ? "POST" : "GET");
                var url = (getAction === "POST" ? resourceUrl.url + "/list" : resourceUrl.url);
                url = injectTemplateValues(url, resource);
                var httpConfig = (url.endsWith("resourceGroups") || url.endsWith("subscriptions") || url.split("/").length === 3)
                ? {
                    method: "GET",
                    url: "api" + url.substring(url.indexOf("/subscriptions")),
                }
                : {
                    method: "POST",
                    url: "api/operations",
                    data: {
                        Url: url,
                        HttpMethod: getAction
                    },
                    resourceUrl: resourceUrl
                };
                $scope.loading = true;
                return rx.Observable.fromPromise($http(httpConfig)).map(function (data) { return { resourceUrl: resourceUrl, data: data.data, url: url, resource: resource, httpMethod: getAction }; });
            }
            return rx.Observable.fromPromise($q.when({ resource: resource, resourceUrl: resourceUrl }));
        }

        function syntaxHighlight(json) {
            if (typeof json === "string") return escapeHtmlEntities(json);
            var str = JSON.stringify(json, undefined, 4);
            str = escapeHtmlEntities(str);
            return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                if (cls === 'string' && ((match.slice(0, "\"http://".length) == "\"http://") || (match.slice(0, "\"https://".length) == "\"https://"))) {
                    match = match.replace("/api/", "/");
                    return '<span><a class="json-link" target="_blank" href=' + match + '>' + match + '</a></span>';
                } else {
                    return '<span class="' + cls + '">' + match + '</span>';
                }
            });
        }

        function escapeHtmlEntities(str) {
            return $('<div/>').text(str).html();
        }

        function getRerouceGroupNameFromWebSpaceName(webSpaceName) {
            webSpaceName = webSpaceName.toLowerCase();
            if (!webSpaceName.endsWith("webspace")) {
                return undefined;
            }

            // strip ending webspace
            var ws = webSpaceName.substring(0, webSpaceName.length - 8);
            var index = ws.lastIndexOf('-');
            if (index < 0) {
                return "Default-Web-" + ws;
            }
            else {
                return ws.substring(0, index);
            }
        }

        function isEmptyObjectorArray(obj) {
            if (typeof obj === "number" || typeof obj === "boolean") return false;
            if ($.isEmptyObject(obj)) return true;
            if (obj === null || obj === "" || obj.length === 0) return true;
            return false;
        }

        function cleanObject(obj) {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (typeof obj[property] === "string" && (/\(.*\)/.test(obj[property]))) {
                        delete obj[property];
                    } else if (Array.isArray(obj[property])) {
                        var toRemove = [];
                        obj[property] = obj[property].filter(function (element) {
                            if (typeof element === "string" && (/\(.*\)/.test(element))) {
                                return false
                            } else if (typeof element === "object" && !$.isEmptyObject(element)) {
                                cleanObject(element);
                            } else if (typeof element === "object" && $.isEmptyObject(element)) {
                                return false;
                            }
                            if ($.isEmptyObject(element)) return false;
                            return true;
                        });
                        if (obj[property].length === 0) delete obj[property];
                    } else if (typeof obj[property] === "object" && !$.isEmptyObject(obj[property])) {
                        cleanObject(obj[property]);
                        if ($.isEmptyObject(obj[property])) delete obj[property];
                    } else if (typeof obj[property] === "object" && $.isEmptyObject(obj[property])) {
                        delete obj[property];
                    }
                }
            }
        }

        function mergeObject(source, target) {
            if (typeof source === "string") {
                target = source;
                return target;
            }
            for (var sourceProperty in source) {
                if (source.hasOwnProperty(sourceProperty) && target.hasOwnProperty(sourceProperty)) {
                    if (!isEmptyObjectorArray(source[sourceProperty]) && (typeof source[sourceProperty] === "object") && !Array.isArray(source[sourceProperty])) {
                        mergeObject(source[sourceProperty], target[sourceProperty]);
                    } else if (Array.isArray(source[sourceProperty]) && Array.isArray(target[sourceProperty])) {
                        var targetModel = target[sourceProperty][0];
                        target[sourceProperty] = source[sourceProperty];
                        target[sourceProperty].push(targetModel);
                        //target[sourceProperty].length = 0;
                        //for (var i = 0; i < source[sourceProperty].length; i++) {
                        //    var tempTarget = jQuery.extend(true, {}, targetModel);
                        //    tempTarget = mergeObject(source[sourceProperty][i], tempTarget);
                        //    target[sourceProperty].push(tempTarget);
                        //}
                    } else if (!isEmptyObjectorArray(source[sourceProperty])) {
                        target[sourceProperty] = source[sourceProperty];
                        
                    }
                }
            }
            return target;
        }
    });

// Global JS fixes
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

Array.prototype.getUnique = function (getValue) {
    var u = {}, a = [];
    for (var i = 0, l = this.length; i < l; ++i) {
        var value = getValue(this[i]);
        if (u.hasOwnProperty(value)) {
            continue;
        }
        a.push(this[i]);
        u[value] = 1;
    }
    return a;
}

//http://devdocs.io/javascript/global_objects/array/indexof
Array.prototype.indexOfDelegate = function (searchElement, fromIndex) {

    var k;

    // 1. Let O be the result of calling ToObject passing
    //    the this value as the argument.
    if (this == null) {
        throw new TypeError('"this" is null or not defined');
    }

    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
        return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
        n = 0;
    }

    // 6. If n >= len, return -1.
    if (n >= len) {
        return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
        var kValue;
        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the
        //    HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        //    i.  Let elementK be the result of calling the Get
        //        internal method of O with the argument ToString(k).
        //   ii.  Let same be the result of applying the
        //        Strict Equality Comparison Algorithm to
        //        searchElement and elementK.
        //  iii.  If same is true, return k.
        if (k in O && searchElement(O[k])) {
            return k;
        }
        k++;
    }
    return -1;
};