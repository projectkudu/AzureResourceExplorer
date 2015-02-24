
//http://stackoverflow.com/a/22253161
angular.module("mp.resizer", [])
     .directive('resizer', function($document) {

         return function($scope, $element, $attrs) {

             $element.on('mousedown', function(event) {
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
    .controller("treeBodyController", function ($scope, $routeParams, $location, $http, $q, $timeout, rx, $document) {

        $scope.treeControl = {};
        $scope.createModel = {};
        $scope.resourcesDefinitionsTable = [];
        $scope.resources = [];
        $scope.readOnly = true;

        var editor, createEditor;
        $timeout(function () {
            editor = ace.edit("json-editor");
            createEditor = ace.edit("json-create-editor");
            [editor, createEditor].map(function (e) {
                e.setOptions({
                    maxLines: Infinity,
                    fontSize: 15,
                    wrap: "free",
                    showPrintMargin: false
                });
                e.setTheme("ace/theme/tomorrow");
                e.getSession().setMode("ace/mode/json");
            });
            editor.setValue(stringify({ message: "Select a node to start" }));
            editor.session.selection.clearSelection();
        });

        $document.on('mouseup', function () {
            [editor, createEditor].map(function (e) { e.resize() });
        });

        $scope.$createObservableFunction("selectResourceHandler")
            .flatMapLatest(function (args) {
                var branch = args[0];
                var event = args[1];
                var dontClickFirstTab = (args.length === 3 ? args[2] : false);
                $scope.loading = true;
                delete $scope.errorResponse;
                var resourceDefinition = branch.resourceDefinition;
                if (!resourceDefinition) return rx.Observable.fromPromise($q.when({ branch: branch, dontClickFirstTab: dontClickFirstTab }));
                $scope.apiVersion = resourceDefinition.apiVersion;
                var getActions = resourceDefinition.actions.filter(function (a) {
                    return (a === "GET" || a === "GETPOST");
                });

                if (getActions.length === 1) {
                    var getAction = (getActions[0] === "GETPOST" ? "POST" : "GET");
                    var url = (getAction === "POST" ? branch.elementUrl + "/list" : branch.elementUrl);
                    var httpConfig = (url.endsWith("resourceGroups") || url.endsWith("subscriptions") || url.split("/").length === 3)
                    ? {
                        method: "GET",
                        url: "api" + url.substring(url.indexOf("/subscriptions")),
                        resourceDefinition: resourceDefinition,
                        filledInUrl: url,
                        dontClickFirstTab: dontClickFirstTab
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
                        filledInUrl: url,
                        dontClickFirstTab: dontClickFirstTab
                    };
                    $scope.loading = true;
                    return rx.Observable.fromPromise($http(httpConfig)).map(function (data) { return { resourceDefinition: resourceDefinition, data: data.data, url: url, branch: branch, httpMethod: getAction, dontClickFirstTab: dontClickFirstTab }; });
                }
                return rx.Observable.fromPromise($q.when({ branch: branch, resourceDefinition: resourceDefinition, dontClickFirstTab: dontClickFirstTab }));
            })
            .do(function () {}, function (err) {
                setStateForErrorOnResourceClick();
                if (!err.config.dontClickFirstTab) selectFirstTab(1);
                if (err.config && err.config.resourceDefinition) {
                    var resourceDefinition = err.config.resourceDefinition;
                    $scope.putUrl = err.config.filledInUrl;
                    editor.setValue("");
                    editor.session.selection.clearSelection();
                }
                delete err.config;
                $scope.errorResponse = syntaxHighlight(err);
                $scope.selectedResource = {
                    url: $scope.putUrl,
                    httpMethod: "GET"
                };
            })
            .retry()
            .subscribe(function (value) {
                setStateForClickOnResource();
                if (!value.dontClickFirstTab) { selectFirstTab(1); delete $scope.actionResponse; }
                if (value.data === undefined) {
                    if (value.resourceDefinition !== undefined && !isEmptyObjectorArray(value.resourceDefinition.requestBody)) {
                        editor.setValue(stringify(value.resourceDefinition.requestBody));
                        editor.session.selection.clearSelection();
                    } else {
                        editor.setValue(stringify({ message: "No GET Url" }));
                        editor.session.selection.clearSelection();
                    }
                    return;
                }
                var resourceDefinition = value.resourceDefinition;
                var url = value.url;
                $scope.putUrl = url;
                var putActions = resourceDefinition.actions.filter(function (a) { return (a === "POST" || a === "PUT"); });
                var createActions = resourceDefinition.actions.filter(function (a) { return (a === "CREATE"); });
                var editorData;
                if (putActions.length === 1) {
                    var editable = jQuery.extend(true, {}, resourceDefinition.requestBody);
                    mergeObject(value.data, editable);
                    editor.setValue(stringify(editable));
                    editor.session.selection.clearSelection();
                    editorData = editable;
                    if (url.endsWith("list")) {
                        $scope.putUrl = url.substring(0, url.lastIndexOf("/"));
                    }
                } else {
                    editor.setValue(stringify(value.data));
                    editor.session.selection.clearSelection();
                    editorData = value.data;
                }

                if (createActions.length === 1) {
                    $scope.creatable = true;
                    $scope.createMetaData = resourceDefinition.requestBody;
                    createEditor.setValue(stringify(resourceDefinition.requestBody));
                    createEditor.session.selection.clearSelection();
                }

                var actionsAndVerbs = resourceDefinition.actions.filter(function (a) { return (a === "DELETE"); }).map(function (a) {
                    return {
                        httpMethod: a,
                        name: "Delete",
                        url: url
                    };
                });

                if (Array.isArray(resourceDefinition.children))
                    Array.prototype.push.apply(actionsAndVerbs, resourceDefinition.children.filter(function (childString) {
                        var d = $scope.resourcesDefinitionsTable.filter(function (r) {
                            return (r.resourceName === childString) && ((r.url === resourceDefinition.url) || r.url === (resourceDefinition.url + "/" + childString));
                        });
                        return d.length === 1;
                    }).map(function (childString) {
                        var d = getResourceDefinitionByNameAndUrl(childString, resourceDefinition.url + "/" + childString);
                        if (d.children === undefined && Array.isArray(d.actions) && d.actions.filter(function (actionName) { return actionName === "POST"; }).length > 0) {
                            return {
                                httpMethod: "POST",
                                name: d.resourceName,
                                url: url + "/" + d.resourceName
                            };
                        }
                    }).filter(function(r) {return r !== undefined;}));
                var doc = (resourceDefinition.responseBodyDoc ? resourceDefinition.responseBodyDoc : resourceDefinition.requestBodyDoc);
                var docArray = getDocumentationFlatArray(editorData, doc);

                $scope.selectedResource = {
                    url: url,
                    actionsAndVerbs: actionsAndVerbs,
                    httpMethods: resourceDefinition.actions.filter(function (e) { return e !== "DELETE" && e !== "CREATE" }).map(function (e) { return (e === "GETPOST" ? "POST" : e); }).sort(),
                    doc: docArray
                };
                $location.path(url.substring("https://management.azure.com/".length));
            });

        $scope.handleClick = function (method, event) {
            if (method === "PUT" || method === "PATCH" ) {
                invokePutOrPatch(method, event);
            } else {
                refreshContent();
            }
        }

        $scope.invokeAction = function (action, url, event) {
            if (action === "DELETE") {
                //confirm
                var deleteButton = $(event.currentTarget);
                var deleteConfirmation = $("#delete-confirm-box");
                deleteConfirmation.css({ top: (deleteButton.offset().top - (((deleteButton.outerHeight() + 10) / 2))) + 'px', left: (deleteButton.offset().left + deleteButton.outerWidth()) + 'px' });
                $("#yes-delete-confirm").off("click").click(function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $scope.hideConfirm();
                    _invokeAction(action, url, event);
                });
                $("#dark-blocker").show();
                deleteConfirmation.show();
            } else {
                _invokeAction(action, url, event);
            }
        };

        function invokePutOrPatch(method, event) {
            setStateForInvokePut();
            var userObject = JSON.parse(editor.getValue());
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
            }, event).error(function (err) {
                $scope.putError = syntaxHighlight(err);
                $scope.invoking = false;
                $scope.loading = false;
                fadeInAndFadeOutError();
            }).success(function () {
                $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined);
                fadeInAndFadeOutSuccess();
            });
        };

        $scope.expandResourceHandler = function (branch, row, event, dontExpandChildren) {
            var promise = $q.when();
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
                    }).success(function (data) {
                        branch.providersFilter = data;
                    }).finally(function () {
                        endExpandingTreeItem(branch, originalIcon);
                    });
                }
                promise = promise.finally(function () {
                    branch.children = resourceDefinition.children.filter(function (childName) {
                        var childDefinition = getResourceDefinitionByNameAndUrl(childName, resourceDefinition.url + "/" + childName);
                        if (!childDefinition) return false;
                        if (childDefinition.children === undefined &&
                            Array.isArray(childDefinition.actions) &&
                            childDefinition.actions.filter(function (actionName) { return actionName === "POST"; }).length > 0) {
                            return false;
                        }
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
                                   parent.currentResourceGroupProviders[branch.label.toUpperCase()].some(function (c) { return c.toUpperCase() === childName.toUpperCase(); });
                        }
                        return true;
                    }).map(function (childName) {
                        var childDefinition = getResourceDefinitionByNameAndUrl(childName, resourceDefinition.url + "/" + childName);
                        return {
                            label: childName,
                            resourceDefinition: childDefinition,
                            is_leaf: (childDefinition.children ? false : true),
                            elementUrl: branch.elementUrl + "/" + childName
                        };
                    });
                    $scope.treeControl.expand_branch(branch);
                    if (branch.children.length === 1 && !dontExpandChildren) {
                        $timeout(function () {
                            $scope.expandResourceHandler($scope.treeControl.get_first_child(branch));
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
                promise = $http(httpConfig).success(function (data) {
                    var childDefinition = getResourceDefinitionByNameAndUrl(resourceDefinition.children, resourceDefinition.url + "/" + resourceDefinition.children);
                    branch.children = (data.value ? data.value : data).map(function (d) {
                        var csmName = getCsmNameFromIdAndName(d.id, d.name);
                        return {
                            label: (d.displayName ? d.displayName : csmName),
                            resourceDefinition: childDefinition,
                            value: (d.subscriptionId ? d.subscriptionId : csmName),
                            is_leaf: (childDefinition.children ? false : true),
                            elementUrl: branch.elementUrl + "/" + (d.subscriptionId ? d.subscriptionId : csmName)
                        };
                    });
                }).finally(function () {
                    endExpandingTreeItem(branch, originalIcon);
                    $scope.treeControl.expand_branch(branch);
                    if (branch.children && branch.children.length === 1 && !dontExpandChildren)
                        $timeout(function () {
                            $scope.expandResourceHandler($scope.treeControl.get_first_child(branch));
                        });
                });
            }
            return promise;
        };

        $scope.tenantSelect = function () {
            window.location = "api/tenants/" + $scope.selectedTenant.id;
        };

        $scope.enterCreateMode = function () {
            $scope.createMode = true;
            createEditor.resize();
            delete $scope.createModel.createdResourceName;
        };

        $scope.leaveCreateMode = function () {
            $scope.createMode = false;
            editor.resize();
        };

        $scope.clearCreate = function () {
            delete $scope.createModel.createdResourceName;
            createEditor.setValue(stringify($scope.createMetaData));
            createEditor.session.selection.clearSelection();
        };

        $scope.invokeCreate = function (event) {
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
            }, event).error(function (err) {
                $scope.createError = syntaxHighlight(err);
                $scope.invoking = false;
                $scope.loading = false;
                fadeInAndFadeOutError();
            }).success(function () {
                $scope.treeControl.collapse_branch(selectedBranch);
                if (selectedBranch.uid === $scope.treeControl.get_selected_branch().uid) {
                    $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined, /* dontClickFirstTab */ true);
                    fadeInAndFadeOutSuccess();
                }
                $timeout(function () {
                    $scope.expandResourceHandler(selectedBranch);
                }, 50);
            });
        };

        function refreshContent() {
            $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined);
        };

        $scope.enterDataTab = function () {
            if (editor) {
                editor.resize();
            }
        };

        $scope.hideDocs = function () {

            var newWidth = $("#doc").outerWidth(true) + $("#content").outerWidth(true);
            $("#content").css({ width: newWidth });
            $("#doc").hide();
            $("#doc-resizer").hide();
            $("#show-doc-btn").show();
        }

        $scope.showDocs = function () {
            $("#doc").show();
            $("#doc-resizer").show();
            var newWidth = $("#content").outerWidth(true) - $("#doc").outerWidth(true);
            $("#content").css({ width: newWidth });
            $("#show-doc-btn").hide();
        }

        $scope.hideConfirm = function () {
            $(".confirm-box").fadeOut(300);
            $('#dark-blocker').hide();
        }

        $scope.setReadOnly = function (readOnly) {
            $scope.readOnly = readOnly;
        }

        // Get resourcesDefinitions
        initResourcesDefinitions();

        // Get tenants list
        initTenants();

        function handlePath(path) {
            if (path.length === 0) return;

            var index = path.indexOf("/");
            index = (index === -1 ? undefined : index);
            var current = path.substring(0, index);
            var rest = path.substring(index + 1);

            var selectedBranch = $scope.treeControl.get_selected_branch();
            if (!selectedBranch) {
                var matches = $scope.treeControl.get_roots().filter(function (e) { return e.label === current; });
                child = (matches.length > 0 ? matches[0] : undefined);
            } else {
                var matches = $scope.treeControl.get_children(selectedBranch).filter(function (e) { return current === (e.value ? e.value : e.label); });
                child = (matches.length > 0 ? matches[0] : undefined);
            }
            
            if (!child) return;
            $scope.treeControl.select_branch(child);
            $timeout(function () {
                child = $scope.treeControl.get_selected_branch();
                var promis = $scope.expandResourceHandler(child, undefined, undefined, true);
                promis.finally(function () { handlePath(rest); });
            });
        }

        function setStateForClickOnResource() {
            delete $scope.putError;
            delete $scope.selectedResource;
            $scope.invoking = false;
            $scope.loading = false;
            $scope.creatable = false;
        }

        function setStateForErrorOnResourceClick() {
            $scope.invoking = false;
            $scope.loading = false;
        }

        function setStateForInvokeAction() {
            $scope.loading = true;
            delete $scope.actionResponse;
        }

        function setStateForInvokePut() {
            delete $scope.putError;
            $scope.invoking = true;
        }

        function _invokeAction(action, url, event) {
            setStateForInvokeAction();
            var currentBranch = $scope.treeControl.get_selected_branch();
            var parent = $scope.treeControl.get_parent_branch(currentBranch);
            userHttp({
                method: "POST",
                url: "api/operations",
                data: {
                    Url: url,
                    HttpMethod: action,
                    ApiVersion: $scope.apiVersion
                }
            }, event).success(function (data, status) {
                $scope.actionResponse = syntaxHighlight(data);
                $scope.loading = false;
                // async DELETE returns 202. That might fail later. So don't remove from the tree
                if (action === "DELETE" && status === 200 /*OK*/) {
                    if (currentBranch.uid === $scope.treeControl.get_selected_branch().uid) {
                        $scope.treeControl.select_branch(parent);
                        selectFirstTab(900);
                        scrollToTop(900);
                    }
                    parent.children = parent.children.filter(function (branch) { return branch.uid !== currentBranch.uid; });
                } else {
                    $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined, /* dontClickFirstTab */ true);
                }
                fadeInAndFadeOutSuccess();
            }).error(function (err) {
                $scope.loading = false;
                $scope.actionResponse = syntaxHighlight(err);
                fadeInAndFadeOutError();
            });
        }

        function fadeInAndFadeOutSuccess() {
            setTimeout(function () {
                $("#success-marker").fadeIn(1500);
                setTimeout(function () {
                    $("#success-marker").fadeOut(1500);
                }, 1200);
            }, 500);
        }

        function fadeInAndFadeOutError() {
            setTimeout(function () {
                $("#failure-marker").fadeIn(1500);
                setTimeout(function () {
                    $("#failure-marker").fadeOut(1500);
                }, 1200);
            }, 500);
        }

        function getCsmNameFromIdAndName(id, name) {
            var splited = (id && id !== null ? id : name).split("/");
            return splited[splited.length - 1];
        }

        function selectFirstTab(delay) {
            $timeout(function () {
                $("#data-tab").find('a:first').click();
            }, delay);
        }

        function scrollToTop(delay) {
            $timeout(function () {
                $("html, body").scrollTop(0);
            }, delay);
        }

        function getResourceDefinitionByNameAndUrl(name, url) {
            var resourceDefinitions = $scope.resourcesDefinitionsTable.filter(function (r) {
                return (r.resourceName === name) && ((r.url === url) || r.url === (url + "/" + name));
            });
            if (resourceDefinitions > 1) {
                console.log("ASSERT! duplicate ids in resourceDefinitionsTable");
                console.log(resourceDefinitions);
            }
            return resourceDefinitions[0];
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

        function initResourcesDefinitions() {
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

                    buildResourcesDefinitionsTable(operation);

                    $scope.resourcesDefinitionsTable.map(function (r) {
                        if (Array.isArray(r.children)) {
                            r.children.sort();
                        }
                    });
                });

                // Initializes the root nodes for the tree
                $scope.resources = getRootTreeNodes();

            }).finally(function () { $timeout(function() {handlePath($location.path().substring(1))}); });
        }

        function getRootTreeNodes() {

            return $scope.resourcesDefinitionsTable.filter(function (rd) { return rd.url.split("/").length === 4; })
                .getUnique(function (rd) { return rd.url.split("/")[3]; }).map(function (urd) {
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

        function buildResourcesDefinitionsTable(operation, url) {
            url = (operation ? operation.Url : url);
            var segments = url.split("/").filter(function (a) { return a.length !== 0; });
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
            var elements = $scope.resourcesDefinitionsTable.filter(function (r) { return r.url === url; });
            if (elements.length === 1) {
                //it's there, update it's actions
                if (operation) {
                    elements[0].requestBody = (elements[0].requestBody ? elements[0].requestBody : operation.RequestBody);
                    if (elements[0].actions.filter(function (c) { return c === operation.HttpMethod; }).length === 0) {
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
                    apiVersion: operation && operation.ApiVersion ? operation.ApiVersion : "2014-04-01"
                };
                $scope.resourcesDefinitionsTable.push(addedElement);
            }

            // set the parent recursively
            setParent(url);
            return addedElement;
        };

        function setParent(url, action, requestBody) {
            var segments = url.split("/").filter(function (a) { return a.length !== 0; });
            var resourceName = segments.pop();
            var parentName = url.substring(0, url.lastIndexOf("/"));
            if (parentName === undefined || parentName === "" || resourceName === undefined) return;
            var parents = $scope.resourcesDefinitionsTable.filter(function (rd) { return rd.url === parentName; });
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
                        if (parent.children.filter(function (c) { return c === resourceName; }).length === 0) {
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

            if (action && parent && parent.actions.filter(function (c) { return c === action; }).length === 0) {
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
                        obj[property] = obj[property].filter(function (element) {
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
                    } else if (!isEmptyObjectorArray(source[sourceProperty])) {
                        target[sourceProperty] = source[sourceProperty];

                    }
                } else if (!isEmptyObjectorArray(source[sourceProperty])) {
                    target[sourceProperty] = source[sourceProperty];
                }
            }
            return target;
        }

        function stringify(object) {
            return JSON.stringify(object, undefined, 2)
        }

        function getDocumentationFlatArray(editorData, doc) {
            var docArray = [];
            if (doc) {
                doc = (doc.properties ? doc.properties : (doc.value ? doc.value[0].properties : { }));
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

        function flattenArray(array) {
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

        function flattenObject(prefix, object) {
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

        function isItemOf(branch, elementType) {
            var parent = $scope.treeControl.get_parent_branch(branch);
            return (parent && parent.resourceDefinition.resourceName === elementType);
        }

        function showExpandingTreeItemIcon(row, branch) {
            var originalTreeIcon = row ? row.tree_icon : "icon-plus  glyphicon glyphicon-plus fa fa-plus";
            $(document.getElementById("expand-icon-" + branch.uid)).removeClass(originalTreeIcon).addClass("fa fa-refresh fa-spin");
            return originalTreeIcon;
        }

        function endExpandingTreeItem(branch, originalTreeIcon) {
            $(document.getElementById("expand-icon-" + branch.uid)).removeClass("fa fa-spinner fa-spin").addClass(originalTreeIcon);
        }

        function getProvidersFilter(branch) {
            if (!branch) return;
            if (branch.providersFilter) return branch.providersFilter;
            return getProvidersFilter($scope.treeControl.get_parent_branch(branch));
        }

        function userHttp(config, event) {
            if ($scope.readOnly) {
                var method = (config.data ? config.data.HttpMethod : config.method);
                var path = (config.data ? config.data.Url : config.url).split('/').last();
                if (method !== "GET" && !(method === "POST" && path == "list")) {
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
                    return decoratePromise($q.reject());
                }
            }
            return $http(config);
        }

        function decoratePromise(promise) {
            promise.success = function (fn) {
                promise.then(function (response) {
                    fn(response);
                });
                return promise;
            };

            promise.error = function (fn) {
                promise.then(null, function (response) {
                    fn(response);
                });
                return promise;
            };
            return promise;
        }
    })
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
};

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

if (!Array.prototype.some) {
    Array.prototype.some = function (fun/*, thisArg*/) {
        'use strict';

        if (this == null) {
            throw new TypeError('Array.prototype.some called on null or undefined');
        }

        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(thisArg, t[i], i, t)) {
                return true;
            }
        }

        return false;
    };
}


//http://devdocs.io/javascript/global_objects/array/contains
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
        if (this === undefined || this === null) {
            throw new TypeError('Cannot convert this value to object');
        }
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) k = 0;
        }
        while (k < len) {
            var currentElement = O[k];
            if (searchElement === currentElement ||
               (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
            k++;
        }
        return false;
    }
}

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

$(document).mouseup(function (e) {
    var container = $(".confirm-box");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.fadeOut(300);
        $('#dark-blocker').hide();
    }
});