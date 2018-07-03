module armExplorer
{
angular.module("armExplorer", ["ngRoute", "ngAnimate", "ngSanitize", "ui.bootstrap", "angularBootstrapNavTree", "rx", "mp.resizer", "ui.ace"])
    .controller("treeBodyController", ["$scope", "$routeParams", "$location", "$http", "$timeout", "rx", "$document", ($scope: IArmTreeScope, $routeParams: ng.route.IRouteParamsService, $location: ng.ILocationService, $http: ng.IHttpService, $timeout: ng.ITimeoutService, rx: any, $document: ng.IDocumentService) => {

        $scope.treeControl = <ITreeControl>{};
        $scope.createModel = <ICreateModel>{};
        $scope.actionsModel = {};
        $scope.resources = [];
        $scope.readOnlyMode = true;
        $scope.editMode = false;
        $scope.treeBranchDataOverrides = ClientConfig.treeBranchDataOverrides;
        $scope.aceConfig = ClientConfig.aceConfig;
        const activeTab: boolean[] = [false, false, false, false, false];


        $timeout(() => {
            $scope.editorCollection = new EditorCollection();
            $scope.editorCollection.configureEditors();
        });

        $document.on('mouseup', () => { $timeout(() => { $scope.editorCollection.apply(e => { e.resize() }); }); });

        $scope.$createObservableFunction("selectResourceHandler")
            .flatMapLatest((args: any[]) => {
                var branch: TreeBranch = args[0];
                var event = args[1];
                $scope.loading = true;
                delete $scope.errorResponse;
                
                if (branch.is_instruction) {
                    var parent = $scope.treeControl.get_parent_branch(branch);
                    $scope.treeControl.collapse_branch(parent);
                    $timeout(() => {
                        $scope.expandResourceHandler(parent, undefined, undefined, undefined, true /*dontFilterEmpty*/);
                        $scope.treeControl.select_branch(parent);
                    });
                }

                const resourceDefinition = branch.resourceDefinition;
                if (resourceDefinition) {
                    const getHttpConfig = branch.getGetHttpConfig();
                    if (getHttpConfig) {
                        return rx.Observable.fromPromise($http(getHttpConfig))
                            //http://stackoverflow.com/a/30878646/3234163
                            .map(data => { return { resourceDefinition: resourceDefinition, data: data.data, url: getHttpConfig.data.Url, branch: branch, httpMethod: getHttpConfig.data.HttpMethod};})
                            .catch(error => rx.Observable.of({ error: error }));
                    } else {
                        return rx.Observable.of({ branch: branch, resourceDefinition: resourceDefinition });
                    }
                } else {
                    return rx.Observable.fromPromise(Promise.resolve({ branch: branch }));
                }
            })
            .subscribe((value: ISelectHandlerReturn) => {
                if (value.error) {
                    var error = value.error;
                    setStateForErrorOnResourceClick();
                    let apiVersion = "";
                    let url = "";
                    if (error.config && error.config.resourceDefinition) {
                        url = error.config.filledInUrl;
                        $scope.editorCollection.setValue(Editor.ResponseEditor, "");
                        $scope.readOnlyResponse = "";
                        apiVersion = error.config.resourceDefinition.apiVersion;
                    }
                    $scope.errorResponse = StringUtils.syntaxHighlight({ data: error.data, status: error.status });
                    $scope.selectedResource = {
                        url: url,
                        actionsAndVerbs: [],
                        httpMethods: ["GET"],
                        doc: [],
                        apiVersion: apiVersion,
                        putUrl: url
                    };
                } else {
                    setStateForClickOnResource();
                    
                    if (value.data === undefined) {
                        if (value.resourceDefinition && value.resourceDefinition.hasRequestBody()) {
                            $scope.editorCollection.setValue(Editor.ResponseEditor, StringUtils.stringify(value.resourceDefinition.requestBody));
                        } else {
                            $scope.editorCollection.setValue(Editor.ResponseEditor, StringUtils.stringify({ message: "No GET Url" }));
                            $scope.editorCollection.setValue(Editor.PowershellEditor, "");
                            $scope.editorCollection.setValue(Editor.AnsibleEditor, "");
                            $scope.editorCollection.setValue(Editor.AzureCliEditor, "");
                        }
                    } else {
                        var resourceDefinition = value.resourceDefinition;
                        var url = value.url;
                        var putUrl = url;
                        if (resourceDefinition.hasPutOrPatchAction()) {
                            let editable = resourceDefinition.getEditable(value.data);
                            $scope.editorCollection.setValue(Editor.RequestEditor, StringUtils.stringify(ObjectUtils.sortByObject(editable, value.data)));
                            if (url.endsWith("list")) { putUrl = url.substring(0, url.lastIndexOf("/")); }
                        } else {
                            $scope.editorCollection.setValue(Editor.RequestEditor, "");
                        }

                        $scope.editorCollection.setValue(Editor.ResponseEditor, StringUtils.stringify(value.data));
                        enableCreateEditorIfRequired(resourceDefinition);

                        let actionsAndVerbs = $scope.resourceDefinitionsCollection.getActionsAndVerbs(value.branch);
                        let doc = resourceDefinition.getDocBody();
                        let docArray = DocumentationGenerator.getDocumentationFlatArray(value.data, doc);

                        $scope.selectedResource = {
                            // Some resources may contain # or whitespace in name,
                            // let's selectively URL-encode (for safety)
                            url: StringUtils.selectiveUrlencode(url),
                            actionsAndVerbs: actionsAndVerbs,
                            httpMethods: resourceDefinition.actions.filter(e => e !== "DELETE" && e !== "CREATE").map((e) => (e === "GETPOST" ? "POST" : e)).sort(),
                            doc: docArray,
                            apiVersion: resourceDefinition.apiVersion,
                            putUrl: putUrl
                        };
                        $location.path(url.replace(/https:\/\/[^\/]*\//, ""));

                        $scope.editorCollection.setValue(Editor.AzureCliEditor, getAzureCliScriptsForResource(value));
                        $scope.editorCollection.setValue(Editor.PowershellEditor, getPowerShellScriptsForResource(value, actionsAndVerbs));
                        $scope.editorCollection.setValue(Editor.AnsibleEditor, getAnsibleScriptsForResource(value, actionsAndVerbs, resourceDefinition));
                    }
                }
                fixActiveEditor();
            });

        function enableCreateEditorIfRequired(resourceDefinition: ResourceDefinition) {
            if (resourceDefinition.hasCreateAction()) {
                $scope.creatable = true;
                $scope.createMetaData = resourceDefinition.requestBody;
                $scope.editorCollection.setValue(Editor.CreateEditor, StringUtils.stringify(resourceDefinition.requestBody));
            }
        }

        function fixActiveEditor() {
            const activeIndex = activeTab.indexOf(true);
            if ((!$scope.creatable && activeIndex === Editor.CreateEditor) ||
            (!($scope.selectedResource && $scope.selectedResource.actionsAndVerbs &&
                $scope.selectedResource.actionsAndVerbs.length > 0) && activeIndex === Editor.RequestEditor)) {
                $timeout(() => { activeTab[Editor.ResponseEditor] = true });
            }
        }

        $scope.handleClick = (selectedResource: ISelectedResource, method, event) => {
            if (method === "PUT" || method === "PATCH") {
                const action = new Action(method, "", "");
                invokePutOrPatch(selectedResource, action, event);
            } else {
                refreshContent();
            }
        };

        $scope.invokeAction = (selectedResource : ISelectedResource, action: Action, event) => {
            doInvokeAction(selectedResource, action, event);
        };

        function invokePutFinallyCallback() {
            $timeout(() => { $scope.invoking = false; $scope.loading = false; });
        }

        function invokePutErrorCallback(response: any) {
            $timeout(() => { $scope.putError = response.data ? StringUtils.syntaxHighlight(response.data) : StringUtils.syntaxHighlight(response.message) });
            ExplorerScreen.fadeInAndFadeOutError();
        }

        function finalizePut() {
            $timeout(() => {
                $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined);
                ExplorerScreen.fadeInAndFadeOutSuccess();
            });
        }

        async function invokePutOrPatch(selectedResource: ISelectedResource, action: Action, event: Event) {
            setStateForInvokePut();
            if ($scope.readOnlyMode) {
                if (!action.isGetAction()) {
                    ExplorerScreen.showReadOnlyConfirmation(event);
                }
            } else {
                const repository = new ArmClientRepository($http);
                try {
                    await repository.invokePut(selectedResource, action, $scope.editorCollection);
                    finalizePut();
                } catch (error) {
                    invokePutErrorCallback(error);
                } finally {
                    invokePutFinallyCallback();
                }
            }
            return Promise.resolve().then(invokePutFinallyCallback);
        };

        function keepChildPredicate(childName: string, resourceDefinition: ResourceDefinition, dontFilterEmpty: boolean, branch: TreeBranch,
            providersFilter: any[]): boolean {
                const childDefinition = $scope.resourceDefinitionsCollection.getResourceDefinitionByNameAndUrl(childName,
                    resourceDefinition.url + "/" + childName);

                let keepChild = false;
                if (childDefinition && (childDefinition.children || !childDefinition.hasPostAction())) {
                    if (dontFilterEmpty) {
                        keepChild = true;
                    } else {
                        keepChild = keepChildrenBasedOnExistingResources(branch, childName, providersFilter);
                    }
                }
                return keepChild;
        }

        function getSubscriptionBranch(branch: TreeBranch): TreeBranch {
            if (!branch || isItemOf(branch, "subscriptions")) {
                return branch;
            } else {
                return getSubscriptionBranch($scope.treeControl.get_parent_branch(branch));
            }
        }

        async function getProvidersForBranch(branch: TreeBranch): Promise<any[]> {
            let providers: any[] = undefined;
            const subscriptionBranch = getSubscriptionBranch(branch);
            if (subscriptionBranch) {
                const repository = new ArmClientRepository($http);
                const subscriptionsResponse = await repository.getProvidersForSubscription(subscriptionBranch.value);
                providers = subscriptionsResponse.data;
            }
            return providers;
        }

        $scope.expandResourceHandler = async (branch: TreeBranch, row: any, event: Event, dontExpandChildren: boolean, dontFilterEmpty: boolean): Promise<any> => {

            if (branch.is_leaf) return Promise.resolve();

            if (branch.expanded) {
                // clear the children array on collapse
                branch.children.length = 0;
                $timeout(() => { $scope.treeControl.collapse_branch(branch);});
                return Promise.resolve();
            }

            var resourceDefinition = branch.resourceDefinition;
            if (!resourceDefinition) return Promise.resolve();

            // children are either an array or a string
            // if array
            //      Predefined list of options. Like Providers or (config, appsettings, etc)
            // else if string
            //      this means it's a Url that we need to ge fetch and display.

            const children = resourceDefinition.children;
            if (typeof children !== "string" && Array.isArray(children)) {
                // if we are expanding an element of subscriptions (a subscription),
                // then we need to make a request to the server to get a list of available providers in its resourceGroups
                // then we can continue with normal expanding of an item

                try {
                    const originalTreeIcon = showExpandingTreeItemIcon(row, branch);
                    const providersFilter: any[] = await getProvidersForBranch(branch);

                    const filteredChildren: string[] = children.filter((child: string) => {
                        return keepChildPredicate(child, resourceDefinition, dontFilterEmpty, branch, providersFilter);
                    });
                    const isListFiltered = filteredChildren.length !== children.length;

                    branch.children = filteredChildren.map((childName: string) => {
                        const childDefinition = $scope.resourceDefinitionsCollection.getResourceDefinitionByNameAndUrl(
                            childName,
                            resourceDefinition.url + "/" + childName);
                        const newTreeBranch = new TreeBranch(childName);
                        newTreeBranch.resourceDefinition = childDefinition;
                        newTreeBranch.is_leaf = (childDefinition.children ? false : true);
                        newTreeBranch.elementUrl = branch.elementUrl + "/" + childName;
                        newTreeBranch.sortValue = childName;
                        newTreeBranch.iconNameOverride = null;
                        return newTreeBranch;
                    });

                    endExpandingTreeItem(branch, originalTreeIcon);

                    var offset = 0;
                    if (!dontFilterEmpty && isListFiltered) {
                        var parent = $scope.treeControl.get_parent_branch(branch);
                        if (branch.label === "providers" || (parent && parent.currentResourceGroupProviders)) {
                            const showAllTreeBranch = new TreeBranch("Show all");
                            showAllTreeBranch.is_instruction = true;
                            showAllTreeBranch.resourceDefinition = resourceDefinition;
                            showAllTreeBranch.sortValue = null;
                            showAllTreeBranch.iconNameOverride = null;
                            branch.children.unshift(showAllTreeBranch);
                            offset++;
                        }
                    }

                    $timeout(() => { $scope.treeControl.expand_branch(branch);});
                    if ((branch.children.length - offset) === 1 && !dontExpandChildren) {
                        $timeout(() => { $scope.expandResourceHandler($scope.treeControl.get_first_non_instruction_child(branch)); });
                    }
                } catch (error) {
                    console.log(error);
                }
            } else if (typeof children === "string") {
                var getUrl = branch.elementUrl;

                var originalIcon = showExpandingTreeItemIcon(row, branch);
                var httpConfig = (getUrl.endsWith("resourceGroups") || getUrl.endsWith("subscriptions") || getUrl.split("/").length === 3)
                    ? {
                        method: "GET",
                        url: `api${getUrl.substring(getUrl.indexOf("/subscriptions"))}`
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
                try {
                    const repository = new ArmClientRepository($http);
                    const httpResponse = await repository.invokeHttp(httpConfig);
                    const data = httpResponse.data;
                    var childDefinition = $scope.resourceDefinitionsCollection.getResourceDefinitionByNameAndUrl(children, resourceDefinition.url + "/" + resourceDefinition.children);

                    // get the projection to use for the current node (i.e. functions to provide label, sort key, ...)
                    var treeBranchProjection = getTreeBranchProjection(childDefinition);

                    branch.children = (data.value ? data.value : data).map((d: any) => {
                        var csmName = getCsmNameFromIdAndName(d.id, d.name);
                        var label = treeBranchProjection.getLabel(d, csmName);
                        const treeBranch = new TreeBranch(label);
                        treeBranch.resourceDefinition = childDefinition;
                        treeBranch.value = (d.subscriptionId ? d.subscriptionId : csmName);
                        treeBranch.is_leaf = (childDefinition.children ? false : true);
                        treeBranch.elementUrl = branch.elementUrl + "/" + (d.subscriptionId ? d.subscriptionId : csmName);
                        treeBranch.sortValue = treeBranchProjection.getSortKey(d, label);
                        treeBranch.iconNameOverride = treeBranchProjection.getIconNameOverride(d);
                        return treeBranch;
                    }).sort((a: TreeBranch, b: TreeBranch) => {
                        return a.sortValue.localeCompare(b.sortValue) * treeBranchProjection.sortOrder;
                    });
                } catch (err) {
                    console.log(err);
                } finally {
                    endExpandingTreeItem(branch, originalIcon);
                    $timeout(() => { $scope.treeControl.expand_branch(branch);});
                    if (branch.children && branch.children.length === 1 && !dontExpandChildren) {
                        $timeout(() => { $scope.expandResourceHandler($scope.treeControl.get_first_child(branch)); });
                    }
                }
            }
            return Promise.resolve();
        };

        function keepChildrenBasedOnExistingResources(branch: TreeBranch, childName: string, providersFilter: any[]): boolean {
            const parent = $scope.treeControl.get_parent_branch(branch);
            let keepChild: boolean = true;
            if (branch.label === "providers") {
                // filter the providers by providersFilter
                if (providersFilter) {
                    const currentResourceGroup = (parent && isItemOf(parent, "resourceGroups") ? parent.label : undefined);
                    if (currentResourceGroup) {
                        const currentResourceGroupProviders: any = providersFilter[currentResourceGroup.toUpperCase()];
                        if (currentResourceGroupProviders) {
                            branch.currentResourceGroupProviders = currentResourceGroupProviders;
                            keepChild = (currentResourceGroupProviders[childName.toUpperCase()] ? true : false);
                        } else {
                            keepChild = false;
                        }
                    }
                }
            } else if (parent && parent.currentResourceGroupProviders) {
                keepChild = parent.currentResourceGroupProviders[branch.label.toUpperCase()] &&
                    parent.currentResourceGroupProviders[branch.label.toUpperCase()].some((c: string) => c.toUpperCase() === childName.toUpperCase());
            }
            return keepChild;
        }

        $scope.tenantSelect = () => {
            window.location.href = "api/tenants/" + $scope.selectedTenant.id;
        };

        $scope.$createObservableFunction("delayResourceSearch")
            .flatMapLatest((event) => {

                // set 300 millionseconds gap, since user might still typing, 
                // we want to trigger search only when user stop typing
                return $timeout(() => { return event; }, 300);
            }).subscribe((event) => {
                if (!event || event.keyCode !== 13 /* enter key will handle by form-submit */) {
                    $scope.resourceSearcher.resourceSearch();
                }
            });

        $scope.selectResourceSearch = (item) => {
            var itemId = item.id;
            var currentSelectedBranch = $scope.treeControl.get_selected_branch();
            if (currentSelectedBranch) {
                const commonAncestor = $scope.treeControl.get_selected_branch().getCommonAncestorBranch(item.id);

                while (currentSelectedBranch != null && !currentSelectedBranch.elementUrl.toLowerCase().endsWith(commonAncestor)) {
                    currentSelectedBranch = $scope.treeControl.get_parent_branch(currentSelectedBranch);
                }

                if (currentSelectedBranch) {
                    $scope.treeControl.select_branch(currentSelectedBranch);
                    const subscriptionTokenIndex = currentSelectedBranch.elementUrl.toLowerCase().indexOf("/subscriptions");
                    const currentSelectedBranchPath = currentSelectedBranch.elementUrl.substr(subscriptionTokenIndex);
                    itemId = itemId.substr(currentSelectedBranchPath.length);
                } else {
                    // shouldn`t happen, but if it did happen, we fallback to collapse_all
                    $scope.treeControl.collapse_all();
                }
            }

            handlePath(itemId.substr(1));
            $scope.resourceSearchModel.turnOffSuggestions();
        };

        $scope.enterCreateMode = () => {
            $scope.createMode = true;
            $scope.editorCollection.resize(Editor.CreateEditor);
            delete $scope.createModel.createdResourceName;
        };

        $scope.leaveCreateMode = () => {
            $scope.createMode = false;
            $scope.editorCollection.resize(Editor.ResponseEditor);
            $scope.editorCollection.resize(Editor.RequestEditor);
        };

        $scope.clearCreate = () => {
            delete $scope.createModel.createdResourceName;
            $scope.editorCollection.setValue(Editor.CreateEditor, StringUtils.stringify($scope.createMetaData));
        };

        function finalizeCreate() {
            const selectedBranch = $scope.treeControl.get_selected_branch();
            $timeout(() => { $scope.treeControl.collapse_branch(selectedBranch); });

            if (selectedBranch.uid === $scope.treeControl.get_selected_branch().uid) {
                $timeout(() => { $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined); });
                ExplorerScreen.fadeInAndFadeOutSuccess();
            }

            $timeout(() => { $scope.expandResourceHandler(selectedBranch); }, 50);
        }

        function invokeCreateErrorCallback(response: any) {
            $timeout(() => { $scope.createError = response.data ? StringUtils.syntaxHighlight(response.data) : StringUtils.syntaxHighlight(response.message) });
            ExplorerScreen.fadeInAndFadeOutError();
        }

        function invokeCreateFinallyCallback() {
            $timeout(() => { $scope.invoking = false; $scope.loading = false; });
        }

        function setStateForInvokeCreate() {
            delete $scope.createError;
            $scope.invoking = true;
        }

        async function doInvokeCreate(selectedResource: ISelectedResource, event: Event) {
            const resourceName = $scope.createModel.createdResourceName;
            if (resourceName) {

                setStateForInvokeCreate();
                const action = new Action("PUT", "", "");

                if ($scope.readOnlyMode) {
                    if (!action.isGetAction()) {
                        ExplorerScreen.showReadOnlyConfirmation(event);
                    }
                } else {
                    const repository = new ArmClientRepository($http);
                    try {
                        await repository.invokeCreate(resourceName, selectedResource, action, $scope.editorCollection);
                        finalizeCreate();
                    } catch (error) {
                        invokeCreateErrorCallback(error);
                    } finally {
                        invokeCreateFinallyCallback();
                    }
                }
            } else {
                invokeCreateErrorCallback({ message: "{Resource Name} can't be empty" });
            }
            return Promise.resolve().then(invokeCreateFinallyCallback);
        }


        $scope.invokeCreate = (selectedResource: ISelectedResource, event: Event) => {
            doInvokeCreate(selectedResource, event);
        }

        function refreshContent() {
            $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined);
        };

        $scope.enterDataTab = () => {
            if ($scope.editorCollection) {
                $scope.editorCollection.resize(Editor.ResponseEditor);
                $scope.editorCollection.resize(Editor.RequestEditor);
            }
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
            $.cookie("readOnlyMode", readOnlyMode, { expires: 10 * 365, path: '/' });
        }

        $scope.toggleEditMode = () => {
            $scope.editMode = !$scope.editMode;
            $timeout(() => {
                try {
                    $scope.editorCollection.resize(Editor.ResponseEditor);
                    $scope.editorCollection.resize(Editor.RequestEditor);
                } catch (error) {
                    console.log(error);
                }
            });
        }

        $scope.showHttpVerb = (verb) => {
            return ((verb === "GET" || verb === "POST") && !$scope.editMode) || ((verb === "PUT" || verb === "PATCH") && $scope.editMode);
        };

        $scope.logout = () => {
            window.location.href = "/logout";
        };

        $scope.refresh = () => {
            window.location.href = "/";
        };

        // https://www.reddit.com/r/web_design/comments/33kxgf/javascript_copying_to_clipboard_is_easier_than
        $scope.copyResUrlToClipboard = (text: string) => {
            // We can only use .select() on a textarea,
            // so let's temporarily create one
            var textField: HTMLTextAreaElement = document.createElement<"textarea">('textarea');
            textField.innerText = text;
            document.body.appendChild(textField);
            textField.select();
            if (document.execCommand('copy')) {
                // Cycle resource URL color for visual feedback
                $scope.resUrlColor = '#718c00'; // a soft green
                $timeout(function () {
                    $scope.resUrlColor = '#000';
                }, 350);
            }
            else {
                console.error("document.execCommand('copy') returned false. " +
                    "Your browser may not support this feature or clipboard permissions don't allow it. " +
                    "See http://caniuse.com/#feat=document-execcommand.");
            }
            textField.remove();
        }

        // Get resourcesDefinitions
        // no await since we don't need this to complete before continuing with rest of init
        initResourcesDefinitions();

        // Get tenants list
        initTenants();

        initSettings();

        initUser();

        initResourceSearch();


        function initResourceSearch(): void {
            const repository = new ArmClientRepository($http);
            $scope.resourceSearchModel = new ResourceSearchDataModel();
            $scope.resourceSearcher = new ResourceSearcher($scope.resourceSearchModel, repository);

            // hide suggestion list when user click somewhere else
            $("body").click(event => {
                if (event && event.target
                    && event.target.getAttribute("id") !== "resource-search-input"
                    && !$.contains($("#resource-search-input")[0], event.target)
                    && event.target.getAttribute("id") !== "resource-search-list"
                    && !$.contains($("#resource-search-list")[0], event.target)) {

                    $scope.resourceSearchModel.turnOffSuggestions();
                }
            });
        };

        async function initUser() {
            let currentUser: any;
            try {
                const repository = new ArmClientRepository($http);
                const userTokenResponse = await repository.getUserToken();
                const userToken = userTokenResponse.data;

                currentUser = {
                    name: (userToken.given_name && userToken.family_name ? userToken.given_name + " " + userToken.family_name : undefined) || userToken.name || userToken.email || userToken.unique_name || "User",
                    imageUrl: "https://secure.gravatar.com/avatar/" + CryptoJS.MD5((userToken.email || userToken.unique_name || userToken.upn || userToken.name || "").toString()) + ".jpg?d=mm",
                    email: "(" + (userToken.upn ? userToken.upn : userToken.email) + ")"
                };
            } catch (error) {
                currentUser = {
                    name: "User",
                    imageUrl: "https://secure.gravatar.com/avatar/.jpg?d=mm"
                };
            } finally {
                $timeout(() => {$scope.user = currentUser});
            }
        }

        function initSettings() {
            if ($.cookie("readOnlyMode") !== undefined) {
                $scope.setReadOnlyMode($.cookie("readOnlyMode") === "true");
            }
        }

        async function expandChild(child: TreeBranch, rest: string, selectedBranch: TreeBranch) {
            if (!child) {
                if (selectedBranch) {
                    const top = document.getElementById("expand-icon-" + selectedBranch.uid).documentOffsetTop() - ((window.innerHeight - 50 /*nav bar height*/) / 2);
                    $("#sidebar").scrollTop(top);    
                }
            } else {
                $scope.treeControl.select_branch(child);
                child = $scope.treeControl.get_selected_branch();

                let expandPromise: Promise<any>;
                if (child && $.isArray(child.children) && child.children.length > 0) {
                    expandPromise = Promise.resolve();
                } else {
                    expandPromise = $scope.expandResourceHandler(child, undefined, undefined, true);
                }

                // use .then.catch.then to simulate finally
                expandPromise.then().catch().then(() => { $timeout(() => { handlePath(rest); }); });
            }
        }

        async function handlePath(path: string) {
            if (path.length > 0) {
                let index = path.indexOf("/");
                index = (index === -1 ? undefined : index);
                var current = path.substring(0, index);
                const rest = path.substring(index + 1);
                const selectedBranch = $scope.treeControl.get_selected_branch();

                let matches: TreeBranch[] = [];
                if (selectedBranch) {
                    if (!selectedBranch.expanded) {
                        try {
                            await $scope.expandResourceHandler(selectedBranch, undefined, undefined, true);
                        } catch (err) {
                            console.log(err);
                        }
                    }
                    matches = $scope.treeControl.get_children(selectedBranch).filter(e => current.toLocaleUpperCase() === (e.value ? e.value.toLocaleUpperCase() : e.label.toLocaleUpperCase()));
                } else {
                    matches = $scope.treeControl.get_roots().filter(e => e.label.toLocaleUpperCase() === current.toLocaleUpperCase());
                }

                const child = (matches.length > 0 ? matches[0] : undefined);
                expandChild(child, rest, selectedBranch);
            }
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

        function finalizeDelete(action: Action, response: ng.IHttpPromiseCallbackArg<any>) {
            const currentBranch = $scope.treeControl.get_selected_branch();
            const parent = $scope.treeControl.get_parent_branch(currentBranch);
            if (response.data) $scope.actionResponse = StringUtils.syntaxHighlight(response.data);
            // async DELETE returns 202. That might fail later. So don't remove from the tree
            if (action.isDeleteAction() && response.status === 200 /* OK */) {
                if (currentBranch.uid === $scope.treeControl.get_selected_branch().uid) {
                    $timeout(() => { $scope.treeControl.select_branch(parent); scrollToTop(900);});
                }
                parent.children = parent.children.filter(branch => branch.uid !== currentBranch.uid);
            } else {
                $timeout(() => { $scope.selectResourceHandler($scope.treeControl.get_selected_branch(), undefined); });
            }
            ExplorerScreen.fadeInAndFadeOutSuccess();
        }

        function invokeActionErrorCallback(response: any) {
            $timeout(() => { $scope.actionResponse = response.data ? StringUtils.syntaxHighlight(response.data) : StringUtils.syntaxHighlight(response.message)});
            ExplorerScreen.fadeInAndFadeOutError();
        }

        function invokeActionFinallyCallback() {
            $timeout(() => { $scope.loading = false; $scope.invoking = false; });
        }

        async function doInvokeAction(selectedResource: ISelectedResource, action: Action, event: Event, confirmed?: boolean) {
            setStateForInvokeAction();
            if ($scope.readOnlyMode) {
                if (!action.isGetAction()) {
                    ExplorerScreen.showReadOnlyConfirmation(event);
                    // no finally in es6 promise. use a resolved promise with then instead
                    return Promise.resolve("Write attempted in read only mode").then(invokeActionFinallyCallback);
                }
            }
            else if (action.isDeleteAction() && !confirmed) {
                ExplorerScreen.showDeleteConfirmation(event, (deleteConfirmationHandler) => {
                    deleteConfirmationHandler.stopPropagation();
                    deleteConfirmationHandler.preventDefault();
                    $scope.hideConfirm();
                    doInvokeAction(selectedResource, action, deleteConfirmationHandler, true /*confirmed*/);
                });
                return Promise.resolve("Delete attempted pre-confirmation").then(invokeActionFinallyCallback);
            } else {
                const repository = new ArmClientRepository($http);
                try {
                    const invokeResponse = await repository.invokeAction(selectedResource, action, $scope.actionsModel);
                    finalizeDelete(action, invokeResponse);
                } catch (error) {
                    invokeActionErrorCallback(error);
                } finally {
                    invokeActionFinallyCallback();
                }
            }
            return Promise.resolve("doInvokeAction Complete").then(invokeActionFinallyCallback);
        }

        function getCsmNameFromIdAndName(id: string, name: string) {
            const splited = (id ? decodeURIComponent(id) : name).split("/");
            return splited[splited.length - 1];
        }

        function scrollToTop(delay: number) {
            $timeout(() => { $("html, body").scrollTop(0); }, delay);
        }

        async function initTenants() {
            try {
                const repository = new ArmClientRepository($http);
                const tenantCollection = new TenantCollection(repository);
                await tenantCollection.buildTenants();
                $timeout(() => { $scope.tenants = tenantCollection.getTenants(); $scope.selectedTenant = tenantCollection.getSelectedTenant();});
            }
            catch(error) {
                console.log(error);
            }
        }

        async function initResourcesDefinitions() {
            try {
                const repository = new ArmClientRepository($http);
                $scope.resourceDefinitionsCollection = new ResourceDefinitionCollection(repository);
                await $scope.resourceDefinitionsCollection.buildResourceDefinitions();

                // Initializes the root nodes for the tree
                // Since resources are updated async let angular known new update should be $digest-ed whenever we get around to updating resources
                $timeout(() => { $scope.resources = $scope.resourceDefinitionsCollection.getTreeNodes(); });
            } catch (error) {
                console.log(error);
            } finally {
                $timeout(() => { handlePath($location.path().substring(1)) });
            }
        }

        function isItemOf(branch: TreeBranch, elementType: string): boolean {
            const parent = $scope.treeControl.get_parent_branch(branch);
            return (parent && parent.resourceDefinition.resourceName === elementType);
        }

        function showExpandingTreeItemIcon(row: any, branch: TreeBranch): string {
            const originalTreeIcon = row ? row.tree_icon : "icon-plus  glyphicon glyphicon-plus fa fa-plus";
            $(document.getElementById(`expand-icon-${branch.uid}`)).removeClass(originalTreeIcon).addClass("fa fa-refresh fa-spin");
            return originalTreeIcon;
        }

        function endExpandingTreeItem(branch: TreeBranch, originalTreeIcon: string) {
            $(document.getElementById(`expand-icon-${branch.uid}`)).removeClass("fa fa-spinner fa-spin").addClass(originalTreeIcon);
        }

        function getTreeBranchProjection(childDefinition: ResourceDefinition): ITreeBranchDataOverrides {
            // look up to see whether the current node in the tree has any overrides for the
            // display label or sort key/order
            const override = ClientConfig.getOverrideFor(childDefinition);

            // Apply default behaviors
            //  - label uses displayname with a fallback to csmName
            //  - sort is by label
            if (override.getLabel == null) {
                override.getLabel = (d: any, csmName: string) => (d.displayName ? d.displayName : csmName);
            }
            if (override.getSortKey == null) {
                override.getSortKey = (d: any, label: string) => label;
            }
            if (override.getIconNameOverride == null) {
                override.getIconNameOverride = (d: any) => null;
            }
            return override;
        }

    }])
    .config(($locationProvider: ng.ILocationProvider) => {
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
}