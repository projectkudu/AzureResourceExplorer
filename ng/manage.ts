//http://stackoverflow.com/a/22253161
angular.module('mp.resizer', []).directive('resizer', function ($document) {

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

                $($attrs.resizerLeft).css({
                    width: x + 'px'
                });
                $($attrs.resizerRight).css({
                    left: (x + parseInt($attrs.resizerWidth)) + 'px'
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
});

angular.module("armExplorer", ["ngRoute", "ngAnimate", "ngSanitize", "ui.bootstrap", "angularBootstrapNavTree", "rx", "mp.resizer", "ui.ace"])
    .controller("treeBodyController", ["$scope", "$routeParams", "$location", "$http", "$q", "$timeout", "rx", "$document", ($scope: ArmTreeScope, $routeParams: ng.route.IRouteParamsService, $location: ng.ILocationService, $http: ng.IHttpService, $q: ng.IQService, $timeout: ng.ITimeoutService, rx: any, $document: ng.IDocumentService) => {

    $scope.treeControl = <ITreeControl>{};
    $scope.createModel = {};
    $scope.actionsModel = {};
    $scope.resourcesDefinitionsTable = [];
    $scope.resources = [];
    $scope.readOnlyMode = true;
    $scope.editMode = false;
    $scope.activeTab = [false, false, false, false];

    $scope.aceConfig = {
        mode: "json",
        theme: "tomorrow",
        onLoad: (_ace) => {
            _ace.setOptions({
                maxLines: Infinity,
                fontSize: 15,
                wrap: "free",
                showPrintMargin: false
            });
            _ace.resize();
        }
    };

    var responseEditor, requestEditor, createEditor;
    $timeout(() => {
        responseEditor = ace.edit("response-json-editor");
        requestEditor = ace.edit("request-json-editor");
        createEditor = ace.edit("json-create-editor");
        [responseEditor, requestEditor, createEditor].map((e) => {
            e.setOptions({
                maxLines: Infinity,
                fontSize: 15,
                wrap: "free",
                showPrintMargin: false
            });
            e.setTheme("ace/theme/tomorrow");
            e.getSession().setMode("ace/mode/json");
            e.customSetValue = function (stringValue) {
                this.setValue(stringValue);
                this.session.selection.clearSelection();
                this.moveCursorTo(0, 0);
            };
            e.setReadOnly = function () {
                this.setOptions({
                    readOnly: true,
                    highlightActiveLine: false,
                    highlightGutterLine: false
                });
                this.renderer.$cursorLayer.element.style.opacity = 0;
                this.renderer.setStyle("disabled", true);
                this.container.style.background = "#f5f5f5";
                this.blur();
            };
            e.commands.removeCommand("find");
        });
        responseEditor.setReadOnly();
        responseEditor.customSetValue(stringify({ message: "Select a node to start" }));

    });

    $document.on('mouseup',() => {
        $timeout(() => {
            [responseEditor, requestEditor, createEditor].map(e => e.resize());
        });
    });

    $scope.$createObservableFunction("selectResourceHandler")
        .flatMapLatest(args => {
        var branch: ITreeBranch = args[0];
        var event = args[1];
        $scope.loading = true;
        delete $scope.errorResponse;
        if (branch.is_instruction) {
            var parent = $scope.treeControl.get_parent_branch(branch);
            $scope.treeControl.collapse_branch(parent);
            $timeout(() => {
                $scope.expandResourceHandler(parent, undefined, undefined, undefined, true /*dontFilterEmpty*/);
            });
        }
        var resourceDefinition = branch.resourceDefinition;
        if (!resourceDefinition) return rx.Observable.fromPromise($q.when({ branch: branch }));
        $scope.apiVersion = resourceDefinition.apiVersion;
        var getActions = resourceDefinition.actions.filter(a => (a === "GET" || a === "GETPOST"));

        if (getActions.length === 1) {
            var getAction = (getActions[0] === "GETPOST" ? "POST" : "GET");
            var url = (getAction === "POST" ? branch.elementUrl + "/list" : branch.elementUrl);
            var httpConfig = (url.endsWith("resourceGroups") || url.endsWith("subscriptions") || url.split("/").length === 3)
                ? {
                    method: "GET",
                    url: "api" + url.substring(url.indexOf("/subscriptions")),
                    resourceDefinition: resourceDefinition,
                    filledInUrl: url
                }
                : {
                    method: "POST",
                    url: "api/operations",
                    data: {
                        Url: url,
                        HttpMethod: getAction,
                        ApiVersion: resourceDefinition.apiVersion
                    },
                    resourceDefinition: resourceDefinition,
                    filledInUrl: url
                };
            $scope.loading = true;
            return rx.Observable.fromPromise($http(httpConfig)).map(data => { return { resourceDefinition: resourceDefinition, data: data.data, url: url, branch: branch, httpMethod: getAction }; });
        }
        return rx.Observable.fromPromise($q.when({ branch: branch, resourceDefinition: resourceDefinition }));
    })
        .do(() => { }, err => {
        setStateForErrorOnResourceClick();
        if (err.config && err.config.resourceDefinition) {
            var resourceDefinition = err.config.resourceDefinition;
            $scope.putUrl = err.config.filledInUrl;
            responseEditor.customSetValue("");
            $scope.readOnlyResponse = "";
        }
        delete err.config;
        $scope.errorResponse = syntaxHighlight(err);
        $scope.selectedResource = {
            url: $scope.putUrl,
            httpMethod: "GET"
        };
        fixSelectedTabIfNeeded();
    })
        .retry()
        .subscribe(value => {
        setStateForClickOnResource();
        if (value.data === undefined) {
            if (value.resourceDefinition !== undefined && !isEmptyObjectorArray(value.resourceDefinition.requestBody)) {
                responseEditor.customSetValue(stringify(value.resourceDefinition.requestBody));
            } else {
                responseEditor.customSetValue(stringify({ message: "No GET Url" }));
            }
            fixSelectedTabIfNeeded();
            return;
        }
        var resourceDefinition = value.resourceDefinition;
        var url = value.url;
        $scope.putUrl = url;
        var putActions = resourceDefinition.actions.filter(a => (a === "POST" || a === "PUT"));
        var createActions = resourceDefinition.actions.filter(a => (a === "CREATE"));
        if (putActions.length === 1) {
            var editable;
            if (resourceDefinition.requestBody && isEmptyObjectorArray(resourceDefinition.requestBody.properties)) {
                editable = value.data;
            } else {
                editable = jQuery.extend(true, {}, resourceDefinition.requestBody);
                var dataCopy = jQuery.extend(true, {}, value.data);
                mergeObject(dataCopy, editable);
            }
            requestEditor.customSetValue(stringify(sortByObject(editable, value.data)));
            if (url.endsWith("list")) {
                $scope.putUrl = url.substring(0, url.lastIndexOf("/"));
            }
        } else {
            requestEditor.customSetValue("");
        }

        responseEditor.customSetValue(stringify(value.data));

        if (createActions.length === 1) {
            $scope.creatable = true;
            $scope.createMetaData = resourceDefinition.requestBody;
            createEditor.customSetValue(stringify(resourceDefinition.requestBody));
        }

        var actionsAndVerbs = resourceDefinition.actions.filter(a => (a === "DELETE")).map(a => {
            return {
                httpMethod: a,
                name: "Delete",
                url: url
            };
        });

        if (Array.isArray(resourceDefinition.children))
            Array.prototype.push.apply(actionsAndVerbs, resourceDefinition.children.filter(childString => {
                var d = $scope.resourcesDefinitionsTable.filter(r => (r.resourceName === childString) && ((r.url === resourceDefinition.url) || r.url === (resourceDefinition.url + "/" + childString)));
                return d.length === 1;
            }).map(childString => {
                var d = getResourceDefinitionByNameAndUrl(childString, resourceDefinition.url + "/" + childString);
                if (d.children === undefined && Array.isArray(d.actions) && d.actions.filter(actionName => actionName === "POST").length > 0) {
                    return {
                        httpMethod: "POST",
                        name: d.resourceName,
                        url: url + "/" + d.resourceName,
                        requestBody: (d.requestBody ? stringify(d.requestBody) : undefined),
                        query: d.query
                    };
                }
            }).filter(r => r !== undefined));
        var doc = (resourceDefinition.responseBodyDoc ? resourceDefinition.responseBodyDoc : resourceDefinition.requestBodyDoc);
        var docArray = getDocumentationFlatArray(value.data, doc);

        $scope.selectedResource = {
            url: url,
            actionsAndVerbs: actionsAndVerbs,
            httpMethods: resourceDefinition.actions.filter(e => e !== "DELETE" && e !== "CREATE").map((e) => (e === "GETPOST" ? "POST" : e)).sort(),
            doc: docArray
        };
        $location.path(url.substring("https://management.azure.com/".length));
        fixSelectedTabIfNeeded();
    });

    $scope.handleClick = (method, event) => {
        if (method === "PUT" || method === "PATCH") {
            invokePutOrPatch(method, event);
        } else {
            refreshContent();
        }
    };

    $scope.invokeAction = (action, event) => {
        _invokeAction(action, event);
    };

    function invokePutOrPatch(method, event) {
        try {
            setStateForInvokePut();
            var userObject = JSON.parse(requestEditor.getValue());
            cleanObject(userObject);
            userHttp({
                method: "POST",
                url: "api/operations",
                data: {
                    Url: $scope.putUrl,
                    HttpMethod: method,
                    RequestBody: userObject,
                    ApiVersion: $scope.apiVersion
                }
            },() => {
                    $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined);
                    fadeInAndFadeOutSuccess();
                },(err) => {
                    $scope.putError = syntaxHighlight(err);
                    fadeInAndFadeOutError();
                },() => {
                    $scope.invoking = false;
                    $scope.loading = false;
                }, event);
        } catch (e) {
            $scope.putError = syntaxHighlight({ error: "Error parsing JSON" });
            $scope.invoking = false;
            $scope.loading = false;
        }
    };

    $scope.expandResourceHandler = (branch: ITreeBranch, row: any, event: Event, dontExpandChildren: boolean, dontFilterEmpty: boolean) => {
        var promise: ng.IPromise<any> | ng.IHttpPromise<any> = $q.when();
        if (branch.is_leaf) return promise;

        if (branch.expanded) {
            // clear the children array on collapse
            branch.children.length = 0;
            $scope.treeControl.collapse_branch(branch);
            return promise;
        }

        var resourceDefinition = branch.resourceDefinition;
        if (!resourceDefinition) return promise;

        // children are either an array or a string
        // if array
        //      Predefined list of options. Like Providers or (config, appsettings, etc)
        // else if string
        //      this means it's a Url that we need to ge fetch and display.

        if (Array.isArray(resourceDefinition.children)) {
            if (isItemOf(branch, "subscriptions")) {
                // if we are expanding an element of subscriptions (a subscription),
                // then we need to make a request to the server to get a list of available providers in its resourceGroups
                // then we can continue with normal expanding of an item
                var originalIcon = showExpandingTreeItemIcon(row, branch);
                promise = $http({
                    method: "GET",
                    url: "api/operations/providers/" + branch.value
                }).success((data: any[]) => {
                    branch.providersFilter = data;
                }).finally(() => {
                    endExpandingTreeItem(branch, originalIcon);
                });
            }
            promise = promise.finally(() => {
                var filtedList = false;
                branch.children = resourceDefinition.children.filter((childName) => {
                    var childDefinition = getResourceDefinitionByNameAndUrl(childName, resourceDefinition.url + "/" + childName);
                    if (!childDefinition) return false;
                    if (childDefinition.children === undefined &&
                        Array.isArray(childDefinition.actions) &&
                        childDefinition.actions.filter(actionName => actionName === "POST").length > 0) {
                        return false;
                    }
                    if (!dontFilterEmpty) {
                        var keepResult = keepChildrenBasedOnExistingResources(branch, childName);
                        filtedList = filtedList ? filtedList : !keepResult;
                        return keepResult;
                    } else {
                        return true;
                    }
                }).map(childName => {
                    var childDefinition = getResourceDefinitionByNameAndUrl(childName, resourceDefinition.url + "/" + childName);
                    return {
                        label: childName,
                        resourceDefinition: childDefinition,
                        is_leaf: (childDefinition.children ? false : true),
                        elementUrl: branch.elementUrl + "/" + childName
                    };
                    });

                var offset = 0;
                if (!dontFilterEmpty && filtedList) {
                    var parent = $scope.treeControl.get_parent_branch(branch);
                    if (branch.label === "providers" || (parent && parent.currentResourceGroupProviders)) {
                        branch.children.unshift({
                            label: "Show all",
                            is_instruction: true,
                            resourceDefinition: resourceDefinition
                        });
                        offset++;
                    }
                }

                $scope.treeControl.expand_branch(branch);
                if ((branch.children.length - offset) === 1 && !dontExpandChildren) {
                    $timeout(() => {
                        $scope.expandResourceHandler($scope.treeControl.get_first_non_instruction_child(branch));
                    });
                }
            });
        } else if (typeof resourceDefinition.children === "string") {
            var getUrl = branch.elementUrl;

            var originalIcon = showExpandingTreeItemIcon(row, branch);
            var httpConfig = (getUrl.endsWith("resourceGroups") || getUrl.endsWith("subscriptions") || getUrl.split("/").length === 3)
                ? {
                    method: "GET",
                    url: "api" + getUrl.substring(getUrl.indexOf("/subscriptions"))
                }
                : {
                    method: "POST",
                    url: "api/operations",
                    data: {
                        Url: getUrl,
                        HttpMethod: "GET",
                        ApiVersion: resourceDefinition.apiVersion
                    }
                };
            promise = $http(httpConfig).success((data: any) => {
                var childDefinition = getResourceDefinitionByNameAndUrl(resourceDefinition.children, resourceDefinition.url + "/" + resourceDefinition.children);
                branch.children = (data.value ? data.value : data).map((d) => {
                    var csmName = getCsmNameFromIdAndName(d.id, d.name);
                    return {
                        label: (d.displayName ? d.displayName : csmName),
                        resourceDefinition: childDefinition,
                        value: (d.subscriptionId ? d.subscriptionId : csmName),
                        is_leaf: (childDefinition.children ? false : true),
                        elementUrl: branch.elementUrl + "/" + (d.subscriptionId ? d.subscriptionId : csmName)
                    };
                });
            }).finally(() => {
                endExpandingTreeItem(branch, originalIcon);
                $scope.treeControl.expand_branch(branch);
                if (branch.children && branch.children.length === 1 && !dontExpandChildren)
                    $timeout(() => {
                        $scope.expandResourceHandler($scope.treeControl.get_first_child(branch));
                    });
            });
        }
        return promise;
    };

    function keepChildrenBasedOnExistingResources(branch: ITreeBranch, childName: string): boolean {
        var parent = $scope.treeControl.get_parent_branch(branch);
        if (branch.label === "providers") {
            // filter the providers by providersFilter
            var providersFilter = getProvidersFilter(branch);
            if (providersFilter) {
                var currentResourceGroup = (parent && isItemOf(parent, "resourceGroups") ? parent.label : undefined);
                if (currentResourceGroup) {
                    var currentResourceGroupProviders = providersFilter[currentResourceGroup.toUpperCase()];
                    if (currentResourceGroupProviders) {
                        branch.currentResourceGroupProviders = currentResourceGroupProviders;
                        return (currentResourceGroupProviders[childName.toUpperCase()] ? true : false);
                    } else {
                        return false;
                    }
                }
            }
        } else if (parent && parent.currentResourceGroupProviders) {
            return parent.currentResourceGroupProviders[branch.label.toUpperCase()] &&
                parent.currentResourceGroupProviders[branch.label.toUpperCase()].some(c => c.toUpperCase() === childName.toUpperCase());
        }
        return true;
    }

    $scope.tenantSelect = () => {
        window.location.href = "api/tenants/" + $scope.selectedTenant.id;
    };

    $scope.resourceSearch = () => {
        // trigger a refresh if needed, but do not need to wait for it to finish since cache should already exist
        refreshResourceSearchCache();

        var results: IResourceSearchSuggestion[] = [];
        var keyword = $scope.resourceSearchModel.searchKeyword || "";

        results = $scope.resourceSearchCache.data.filter((item) => {
            return (item.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1
                || item.type.toLowerCase().indexOf(keyword.toLowerCase()) > -1);
        });

        results.sort((a, b) => {
            var result = a.type.compare(b.type, true /*ignore case*/);
            if (result === 0) {
                return a.name.compare(b.name, true /*ignore case*/);
            }

            return result;
        });

        $scope.resourceSearchModel.suggestions = results;
        if ($scope.resourceSearchModel.suggestions.length > 0) {
            $scope.resourceSearchModel.isSuggestListDisplay = true;
        } else {
            $scope.resourceSearchModel.isSuggestListDisplay = false;
        }
    };

    $scope.$createObservableFunction("delayResourceSearch")
        .flatMapLatest(() => {
        // set 300 millionseconds gap, since user might still typing, 
        // we want to trigger search only when user stop typing
        return $timeout(() => { }, 300);
    }).subscribe(() => {
        $scope.resourceSearch();
    });

    $scope.selectResourceSearch = (item) => {
        $scope.treeControl.collapse_all();
        handlePath(item.id.substr(1), true);
        $scope.resourceSearchModel.isSuggestListDisplay = false;
    };

    $scope.enterCreateMode = () => {
        $scope.createMode = true;
        createEditor.resize();
        delete $scope.createModel.createdResourceName;
    };

    $scope.leaveCreateMode = () => {
        $scope.createMode = false;
        responseEditor.resize();
        requestEditor.resize();
    };

    $scope.clearCreate = () => {
        delete $scope.createModel.createdResourceName;
        createEditor.customSetValue(stringify($scope.createMetaData));
    };

    $scope.invokeCreate = (event) => {
        try {
            var resourceName = $scope.createModel.createdResourceName;
            if (!resourceName) {
                $scope.createError = syntaxHighlight({
                    error: {
                        message: "{Resource Name} can't be empty"
                    }
                });
                $scope.invoking = false;
                $scope.loading = false;
                return;
            }

            delete $scope.createError;
            var userObject = JSON.parse(createEditor.getValue());
            cleanObject(userObject);
            $scope.invoking = true;
            var selectedBranch = $scope.treeControl.get_selected_branch();
            userHttp({
                method: "POST",
                url: "api/operations",
                data: {
                    Url: $scope.putUrl + "/" + resourceName,
                    HttpMethod: "PUT",
                    RequestBody: userObject,
                    ApiVersion: $scope.apiVersion
                }
            },() => {
                    $scope.treeControl.collapse_branch(selectedBranch);
                    if (selectedBranch.uid === $scope.treeControl.get_selected_branch().uid) {
                        $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined);
                        fadeInAndFadeOutSuccess();
                    }
                    $timeout(() => {
                        $scope.expandResourceHandler(selectedBranch);
                    }, 50);
                },(err) => {
                    $scope.createError = syntaxHighlight(err);
                    fadeInAndFadeOutError();
                },() => {
                    $scope.invoking = false;
                    $scope.loading = false;
                }, event);
        } catch (e) {
            $scope.createError = syntaxHighlight({ error: "Error parsing JSON" });
            $scope.invoking = false;
            $scope.loading = false;
        }
    };

    function refreshContent() {
        $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined);
    };

    $scope.enterDataTab = () => {
        [responseEditor, requestEditor].map((e) => {
            if (e) {
                e.resize();
            }
        });
    };

    $scope.hideDocs = () => {

        var newWidth = $("#doc").outerWidth(true) + $("#content").outerWidth(true);
        $("#content").css({ width: newWidth });
        $("#doc").hide();
        $("#doc-resizer").hide();
        $("#show-doc-btn").show();
    }

    $scope.showDocs = () => {
        $("#doc").show();
        $("#doc-resizer").show();
        var newWidth = $("#content").outerWidth(true) - $("#doc").outerWidth(true);
        $("#content").css({ width: newWidth });
        $("#show-doc-btn").hide();
    }

    $scope.hideConfirm = () => {
        $(".confirm-box").fadeOut(300);
        $('#dark-blocker').hide();
    }

    $scope.setReadOnlyMode = (readOnlyMode) => {
        $scope.readOnlyMode = readOnlyMode;
        $.cookie("readOnlyMode", readOnlyMode, { expires: 10 * 365 });
    }

    $scope.toggleEditMode = () => {
        $scope.editMode = !$scope.editMode;
        $timeout(() => {
            [responseEditor, requestEditor].map((e) => {
                if (e) {
                    e.resize();
                }
            });
        });
    }

    $scope.showHttpVerb = (verb) => {
        return ((verb === "GET" || verb === "POST") && !$scope.editMode) || ((verb === "PUT" || verb === "PATCH") && $scope.editMode);
    };

    $scope.logout = () => {
        window.location.href = "/logout"
    };

    $scope.refresh = () => {
        window.location.href = "/";
    };

    // Get resourcesDefinitions
    initResourcesDefinitions();

    // Get tenants list
    initTenants();

    initSettings();

    initUser();

    initResourceSearch();

    function initResourceSearch(): void {
        $scope.resourceSearchModel = <IResourceSearch>{
            isSuggestListDisplay: false,
            suggestions: []
        };

        refreshResourceSearchCache();

        // hide suggestion list when user click somewhere else
        $("body").click(function (event) {
            if (event && event.target
                && event.target.getAttribute("id") !== "resource-search-input"
                && !$.contains($("#resource-search-input")[0], event.target)
                && event.target.getAttribute("id") !== "resource-search-list"
                && !$.contains($("#resource-search-list")[0], event.target)) {

                $scope.resourceSearchModel.isSuggestListDisplay = false;
            }
        });
    }

    // ARM not accept filter, query all data and perform client filter for now
    var isResourceSearchCacheRefreshing: boolean = false;
    function refreshResourceSearchCache(): void {
        // only refresh cache if cache wasn`t there or too old
        if (!isResourceSearchCacheRefreshing
            && (!$scope.resourceSearchCache || Date.now() - $scope.resourceSearchCache.timestamp > 10000)) {

            isResourceSearchCacheRefreshing = true;
            $http({
                method: "GET",
                url: "api/search?keyword="
            }).success((response: any[]) => {
                $scope.resourceSearchCache = <IResearchSearchCache>{
                    data: response,
                    timestamp: Date.now()
                };
            }).finally(() => {
                isResourceSearchCacheRefreshing = false;
            });
        }
    }

    function initUser() {
        $http({
            method: "GET",
            url: "api/token"
        }).success((data: any) => {
            $scope.user = {
                name: (data.given_name && data.family_name ? data.given_name + " " + data.family_name : undefined) || data.name || data.email || data.unique_name || "User",
                imageUrl: "https://secure.gravatar.com/avatar/" + CryptoJS.MD5((data.email || data.unique_name || data.upn || data.name || "").toString()) + ".jpg?d=mm"
            };
        }).error(() => {
            $scope.user = {
                name: "User",
                imageUrl: "https://secure.gravatar.com/avatar/.jpg?d=mm"
            };
        });
    }

    function fixSelectedTabIfNeeded() {
        var selectedIndex = $scope.activeTab.indexOf(true);
        if ((!$scope.creatable && selectedIndex === 2) ||
            (!($scope.selectedResource && $scope.selectedResource.actionsAndVerbs && $scope.selectedResource.actionsAndVerbs.length > 0) && selectedIndex === 1)) {
            $timeout(() => {
                $scope.activeTab[0] = true;
            });
        }
    }

    function initSettings() {
        if ($.cookie("readOnlyMode") !== undefined) {
            $scope.setReadOnlyMode($.cookie("readOnlyMode") === "true");
        }
    }

    function handlePath(path: string, startFromRoot?: boolean) {
        if (path.length === 0) return;

        var index = path.indexOf("/");
        index = (index === -1 ? undefined : index);
        var current = path.substring(0, index);
        var rest = path.substring(index + 1);
        var child: any;
        var selectedBranch = $scope.treeControl.get_selected_branch();
        if (startFromRoot || !selectedBranch) {
            var matches = $scope.treeControl.get_roots().filter(e => e.label.toLocaleUpperCase() === current.toLocaleUpperCase());
            child = (matches.length > 0 ? matches[0] : undefined);
        } else {
            var matches = $scope.treeControl.get_children(selectedBranch).filter(e => current.toLocaleUpperCase() === (e.value ? e.value.toLocaleUpperCase() : e.label.toLocaleUpperCase()));
            child = (matches.length > 0 ? matches[0] : undefined);
        }

        if (!child) return;
        $scope.treeControl.select_branch(child);
        $timeout(() => {
            child = $scope.treeControl.get_selected_branch();
            var promis = $scope.expandResourceHandler(child, undefined, undefined, true);
            promis.finally(() => { handlePath(rest); });
        });
    }

    function setStateForClickOnResource() {
        delete $scope.putError;
        delete $scope.selectedResource;
        $scope.invoking = false;
        $scope.loading = false;
        $scope.creatable = false;
        $scope.editMode = false;
    }

    function setStateForErrorOnResourceClick() {
        $scope.invoking = false;
        $scope.loading = false;
        $scope.editMode = false;
    }

    function setStateForInvokeAction() {
        $scope.loading = true;
        delete $scope.actionResponse;
    }

    function setStateForInvokePut() {
        delete $scope.putError;
        $scope.invoking = true;
    }

    function _invokeAction(action, event: Event, confirmed?: boolean) {
        try {
            setStateForInvokeAction();
            var currentBranch = $scope.treeControl.get_selected_branch();
            var parent = $scope.treeControl.get_parent_branch(currentBranch);
            var body, queryString;
            if (action.requestBody) {
                var s = ace.edit(action.name + "-editor");
                body = JSON.parse(s.getValue());
            }
            if (action.query) {
                queryString = action.query.reduce((previous, current) => {
                    return previous + (($scope.actionsModel[current] && $scope.actionsModel[current].trim() != "") ? "&" + current + "=" + $scope.actionsModel[current].trim() : "")
                }, "");
            }
            userHttp({
                method: "POST",
                url: "api/operations",
                data: {
                    Url: action.url,
                    RequestBody: body,
                    HttpMethod: action.httpMethod,
                    ApiVersion: $scope.apiVersion,
                    QueryString: queryString
                }
            },(data, status) => {
                    if (data) $scope.actionResponse = syntaxHighlight(data);
                    // async DELETE returns 202. That might fail later. So don't remove from the tree
                    if (action.httpMethod === "DELETE" && status === 200 /* OK */) {
                        if (currentBranch.uid === $scope.treeControl.get_selected_branch().uid) {
                            $scope.treeControl.select_branch(parent);
                            scrollToTop(900);
                        }
                        parent.children = parent.children.filter(branch => branch.uid !== currentBranch.uid);
                    } else {
                        $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined);
                    }
                    fadeInAndFadeOutSuccess();
                },(err) => {
                    $scope.actionResponse = syntaxHighlight(err);
                    fadeInAndFadeOutError();
                },() => { $scope.loading = false; }, event, confirmed);
        } catch (e) {
            $scope.actionResponse = syntaxHighlight({ error: "Error parsing JSON" });
            $scope.loading = false;
        }
    }

    function fadeInAndFadeOutSuccess() {
        setTimeout(() => {
            $("#success-marker").fadeIn(1500);
            setTimeout(() => {
                $("#success-marker").fadeOut(1500);
            }, 1200);
        }, 500);
    }

    function fadeInAndFadeOutError() {
        setTimeout(() => {
            $("#failure-marker").fadeIn(1500);
            setTimeout(() => {
                $("#failure-marker").fadeOut(1500);
            }, 1200);
        }, 500);
    }

    function getCsmNameFromIdAndName(id, name) {
        var splited = (id && id !== null ? decodeURIComponent(id) : name).split("/");
        return splited[splited.length - 1];
    }

    function scrollToTop(delay) {
        $timeout(() => {
            $("html, body").scrollTop(0);
        }, delay);
    }

    function getResourceDefinitionByNameAndUrl(name, url) {
        var resourceDefinitions = $scope.resourcesDefinitionsTable.filter(r => (r.resourceName === name) && ((r.url === url) || r.url === (url + "/" + name)));
        if (resourceDefinitions.length > 1) {
            console.log("ASSERT! duplicate ids in resourceDefinitionsTable");
            console.log(resourceDefinitions);
        }
        return resourceDefinitions[0];
    }

    function initTenants() {
        $http({
            method: "GET",
            url: "api/tenants"
        }).success((tenants: any[]) => {
            $scope.tenants = tenants.map(tenant => {
                return {
                    name: tenant.DisplayName + " (" + tenant.DomainName + ")",
                    id: tenant.TenantId,
                    current: tenant.Current
                };
            });
            $scope.selectedTenant = $scope.tenants[$scope.tenants.indexOfDelegate(tenant => tenant.current)];
        });
    }

    function initResourcesDefinitions() {
        $http({
            method: "GET",
            url: "api/operations"
        }).success((operations: any[]) => {
            operations.sort((a, b) => {
                return a.Url.localeCompare(b.Url);
            });
            operations.map((operation) => {
                //TODO: remove this
                operation = fixOperationUrl(operation);

                buildResourcesDefinitionsTable(operation);

                $scope.resourcesDefinitionsTable.map((r) => {
                    if (Array.isArray(r.children)) {
                        r.children.sort();
                    }
                });
            });

            // Initializes the root nodes for the tree
            $scope.resources = getRootTreeNodes();

        }).finally(() => { $timeout(() => { handlePath($location.path().substring(1)) }); });
    }

    function getRootTreeNodes() {

        return $scope.resourcesDefinitionsTable.filter((rd) => { return rd.url.split("/").length === 4; })
            .getUnique((rd) => { return rd.url.split("/")[3]; }).map((urd) => {
            return {
                label: urd.url.split("/")[3],
                resourceDefinition: urd,
                data: undefined,
                resource_icon: "fa fa-cube fa-fw",
                children: [],
                elementUrl: urd.url
            };
        });
    }

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

    function buildResourcesDefinitionsTable(operation, url?: string) {
        url = (operation ? operation.Url : url);
        var segments = url.split("/").filter(a => a.length !== 0);
        var resourceName = segments.pop();
        var addedElement;

        if (resourceName === "list" && operation && operation.HttpMethod === "POST") {
            // handle resources that has a "secure GET"
            setParent(url, "GETPOST");
            return;
        } else if (operation && (operation.MethodName.startsWith("Create") || operation.MethodName.startsWith("BeginCreate") || operation.MethodName.startsWith("Put")) && operation.HttpMethod === "PUT") {
            // handle resources that has a CreateOrUpdate
            setParent(url, "CREATE", operation.RequestBody);
            if (operation.MethodName.indexOf("Updat") === -1) {
                return;
            }
        }

        //set the element itself
        var elements = $scope.resourcesDefinitionsTable.filter(r => r.url === url);
        if (elements.length === 1) {
            //it's there, update it's actions
            if (operation) {
                elements[0].requestBody = (elements[0].requestBody ? elements[0].requestBody : operation.RequestBody);
                if (elements[0].actions.filter(c => c === operation.HttpMethod).length === 0) {
                    elements[0].actions.push(operation.HttpMethod);
                }
                if (operation.HttpMethod === "GET") {
                    elements[0].responseBodyDoc = operation.ResponseBodyDoc
                } else if (operation.HttpMethod === "PUT") {
                    elements[0].requestBodyDoc = operation.RequestBodyDoc;
                }
            }
        } else {
            addedElement = {
                resourceName: resourceName,
                children: undefined,
                actions: (operation ? [operation.HttpMethod] : []),
                url: url,
                requestBody: operation ? operation.RequestBody : {},
                requestBodyDoc: operation ? operation.RequestBodyDoc : {},
                responseBodyDoc: operation ? operation.ResponseBodyDoc : {},
                query: operation ? operation.Query : [],
                apiVersion: operation && operation.ApiVersion ? operation.ApiVersion : "2014-04-01"
            };
            $scope.resourcesDefinitionsTable.push(addedElement);
        }

        // set the parent recursively
        setParent(url);
        return addedElement;
    };

    function setParent(url, action?: any, requestBody?: any) {
        var segments = url.split("/").filter(a => a.length !== 0);
        var resourceName = segments.pop();
        var parentName = url.substring(0, url.lastIndexOf("/"));
        if (parentName === undefined || parentName === "" || resourceName === undefined) return;
        var parents = $scope.resourcesDefinitionsTable.filter(rd => rd.url === parentName);
        var parent;
        if (parents.length === 1) {
            parent = parents[0];
            if (resourceName.match(/\{.*\}/g)) {
                // this means the parent.children should either be an undefined, or a string.
                // if it's anything else assert! because that means we have a mistake in our assumptions
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
                    if (parent.children.filter(c => c === resourceName).length === 0) {
                        parent.children.push(resourceName);
                    }
                } else {
                    console.log("ASSERT, typeof parent.children: " + typeof parent.children)
                }
            }
        } else {
            //this means the parent is not in the array. Add it
            parent = buildResourcesDefinitionsTable(undefined, url.substring(0, url.lastIndexOf("/")));
            setParent(url);
        }

        if (action && parent && parent.actions.filter(c => c === action).length === 0) {
            parent.actions.push(action);
        }

        if (requestBody && parent && !parent.requestBody) {
            parent.requestBody = requestBody;
        }
    }

    function fixWidths(event) {
        if (!event) return;
        var anchor = $(event.currentTarget);
        var span = $(event.currentTarget).find("span");
        var width = span.width() + parseInt(span.css("left"), 10) + 37;
        anchor.width((width < 280 ? 280 : width) - 20);
    }

    function syntaxHighlight(json) {
        if (typeof json === "string") return escapeHtmlEntities(json);
        var str = stringify(json);
        str = escapeHtmlEntities(str);
        return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,(match) => {
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
        var hadProperties = (obj.properties !== undefined);
        recursiveCleanObject(obj);
        if (hadProperties && !obj.properties) {
            obj.properties = {};
        }
    }

    function recursiveCleanObject(obj) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] === "string" && (/\(.*\)/.test(obj[property]))) {
                    delete obj[property];
                } else if (Array.isArray(obj[property])) {
                    var toRemove = [];
                    obj[property] = obj[property].filter((element) => {
                        if (typeof element === "string" && (/\(.*\)/.test(element))) {
                            return false
                        } else if (typeof element === "object" && !$.isEmptyObject(element)) {
                            recursiveCleanObject(element);
                        } else if (typeof element === "object" && $.isEmptyObject(element)) {
                            return false;
                        }
                        if ($.isEmptyObject(element)) return false;
                        return true;
                    });
                    if (obj[property].length === 0) delete obj[property];
                } else if (typeof obj[property] === "object" && !$.isEmptyObject(obj[property])) {
                    recursiveCleanObject(obj[property]);
                    if ($.isEmptyObject(obj[property])) delete obj[property];
                } else if (typeof obj[property] === "object" && $.isEmptyObject(obj[property])) {
                    delete obj[property];
                }
            }
        }
    }

    function sortByObject(toBeSorted: any, toSortBy: any): any {
        if (toBeSorted === toSortBy) return toBeSorted;
        var sorted = {};
        for (var key in toSortBy) {
            if (toSortBy.hasOwnProperty(key)) {
                var obj;
                if (typeof toSortBy[key] === "object" && !Array.isArray(toSortBy[key]) && toSortBy[key] != null) {
                    obj = sortByObject(toBeSorted[key], toSortBy[key]);
                } else {
                    obj = toBeSorted[key];
                }
                sorted[key] = obj;
            }
        }
        for (var key in toBeSorted) {
            if (toBeSorted.hasOwnProperty(key) && sorted[key] === undefined) {
                sorted[key] = toBeSorted[key]
            }
        }
        return sorted;
    }

    function mergeObject(source, target): any {
        for (var sourceProperty in source) {
            if (source.hasOwnProperty(sourceProperty) && target.hasOwnProperty(sourceProperty)) {
                if (!isEmptyObjectorArray(source[sourceProperty]) && (typeof source[sourceProperty] === "object") && !Array.isArray(source[sourceProperty])) {
                    mergeObject(source[sourceProperty], target[sourceProperty]);
                } else if (Array.isArray(source[sourceProperty]) && Array.isArray(target[sourceProperty])) {
                    var targetModel = target[sourceProperty][0];
                    target[sourceProperty] = source[sourceProperty];
                    target[sourceProperty].push(targetModel);
                } else {
                    target[sourceProperty] = source[sourceProperty];
                }
            } else if (source.hasOwnProperty(sourceProperty)) {
                target[sourceProperty] = source[sourceProperty];
            }
        }
        return target;
    }

    function stringify(object: any): string {
        return JSON.stringify(object, undefined, 2)
    }

    function getDocumentationFlatArray(editorData, doc) {
        var docArray = [];
        if (doc) {
            doc = (doc.properties ? doc.properties : (doc.value ? doc.value[0].properties : {}));
        }

        if (editorData && doc) {
            editorData = (editorData.properties ? editorData.properties : ((editorData.value && editorData.value.length > 0) ? editorData.value[0].properties : {}));
            var set = {};
            for (var prop in editorData) {
                if (editorData.hasOwnProperty(prop) && doc[prop]) {
                    docArray.push({
                        name: prop,
                        doc: doc[prop]
                    });
                    set[prop] = 1;
                }
            }

            for (var prop in doc) {
                if (doc.hasOwnProperty(prop) && !set[prop]) {
                    docArray.push({
                        name: prop,
                        doc: doc[prop]
                    });
                }
            }
            delete set;

        } else {
            docArray.push({
                name: "message",
                doc: "No documentation available"
            });
        }

        return flattenArray(docArray);
    }

    function flattenArray(array: any[]): any[] {
        for (var i = 0; i < array.length; i++) {
            if (typeof array[i].doc !== "string") {
                var flat = flattenObject(array[i].name, array[i].doc);
                var first = array.slice(0, i);
                var end = array.slice(i + 1);
                array = first.concat(flat).concat(end);
                i += flat.length - 1;
            }
        }
        return array;
    }

    function flattenObject(prefix: string, object: any): any[] {
        var flat = [];
        if (typeof object === "string") {
            flat.push({
                name: prefix,
                doc: object
            });
        } else if (Array.isArray(object)) {
            flat = flat.concat(flattenObject(prefix, object[0]));
        } else if (isEmptyObjectorArray(object)) {
            flat.push({
                name: prefix,
                doc: ""
            });
        } else {
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    if (typeof object[prop] === "string") {
                        flat.push({
                            name: prefix + "." + prop,
                            doc: object[prop]
                        });
                    } else if (Array.isArray(object[prop]) && object[prop].length > 0) {
                        flat = flat.concat(flattenObject(prefix + "." + prop, object[prop][0]));
                    } else if (typeof object[prop] === "object") {
                        flat = flat.concat(flattenObject(prefix + "." + prop, object[prop]));
                    } else {
                        flat.push({
                            name: prefix,
                            doc: object
                        });
                    }
                }
            }
        }
        return flat;
    }

    function isItemOf(branch: ITreeBranch, elementType: string): boolean {
        var parent = $scope.treeControl.get_parent_branch(branch);
        return (parent && parent.resourceDefinition.resourceName === elementType);
    }

    function showExpandingTreeItemIcon(row: any, branch: ITreeBranch): string {
        var originalTreeIcon = row ? row.tree_icon : "icon-plus  glyphicon glyphicon-plus fa fa-plus";
        $(document.getElementById("expand-icon-" + branch.uid)).removeClass(originalTreeIcon).addClass("fa fa-refresh fa-spin");
        return originalTreeIcon;
    }

    function endExpandingTreeItem(branch: ITreeBranch, originalTreeIcon: string) {
        $(document.getElementById("expand-icon-" + branch.uid)).removeClass("fa fa-spinner fa-spin").addClass(originalTreeIcon);
    }

    function getProvidersFilter(branch: ITreeBranch): any[] {
        if (!branch) return;
        if (branch.providersFilter) return branch.providersFilter;
        return getProvidersFilter($scope.treeControl.get_parent_branch(branch));
    }

    function userHttp(config: ng.IRequestConfig, success: ng.IHttpPromiseCallback<any>, error: ng.IHttpPromiseCallback<any>, always: () => any, event: Event, confirmed?: boolean) {
        var method = (config.data ? config.data.HttpMethod : config.method);
        var url = (config.data ? config.data.Url : config.url);
        if ($scope.readOnlyMode) {
            if (method !== "GET" && !(method === "POST" && url.split('/').last() === "list")) {
                if (event) {
                    var clickedButton = $(event.currentTarget);
                    var readonlyConfirmation = $("#readonly-confirm-box");
                    // I don't know why the top doesn't center the value for the small buttons but does for the large ones
                    // add an 8px offset if the button outer height < 40
                    var offset = (clickedButton.outerHeight() < 40 ? 8 : 0);
                    readonlyConfirmation.css({ top: (clickedButton.offset().top - clickedButton.outerHeight(true) - offset) + 'px', left: (clickedButton.offset().left + clickedButton.outerWidth()) + 'px' });
                    $("#dark-blocker").show();
                    readonlyConfirmation.show();
                }
                return decoratePromise($q.reject()).finally(always);
            }
        } else if (method === "DELETE" && !confirmed) {
            var deleteButton = $(event.currentTarget);
            var deleteConfirmation = $("#delete-confirm-box");
            deleteConfirmation.css({ top: (deleteButton.offset().top - (((deleteButton.outerHeight() + 10) / 2))) + 'px', left: (deleteButton.offset().left + deleteButton.outerWidth()) + 'px' });
            $("#yes-delete-confirm").off("click").click((e) => {
                e.stopPropagation();
                e.preventDefault();
                $scope.hideConfirm();
                _invokeAction({
                    httpMethod: "DELETE",
                    url: url
                }, e, true /*confirmed*/);
            });
            $("#dark-blocker").show();
            deleteConfirmation.show();
            return decoratePromise($q.when().finally(always));
        } else {
            return $http(config).success(success).error(error).finally(always);
        }
    }

    function decoratePromise(promise) {
        promise.success = (fn) => {
            promise.then((response) => {
                fn(response);
            });
            return promise;
        };

        promise.error = (fn) => {
            promise.then(null,(response) => {
                fn(response);
            });
            return promise;
        };
        return promise;
    }
}])
    .config(($routeProvider, $locationProvider) => {
    $locationProvider.html5Mode(true);
});


// Global JS fixes
$('label.tree-toggler').click(function () {
    $(this).parent().children('ul.tree').toggle(300);
});


$(document).mouseup((e) => {
    var container = $(".confirm-box");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.fadeOut(300);
        $('#dark-blocker').hide();
    }
});
