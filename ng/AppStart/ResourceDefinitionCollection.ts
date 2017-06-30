class ResourceDefinitionCollection {

    private resourcesDefinitionsTable: ResourceDefinition[];
    static supportedRootNodes = ['providers', 'subscriptions'];

    constructor(private repository: ArmClientRepository) {
        this.resourcesDefinitionsTable = [];
    }

    private isSupportedTreeNode(url: string) {
        const splits = url.split("/");
        return (splits.length === 4) && ResourceDefinitionCollection.supportedRootNodes.includes(splits[3].toLowerCase());
    }

    getTable(): ResourceDefinition[] {
        return this.resourcesDefinitionsTable;
    }

    // sets the branch that is returned by observables
    // but only root nodes are created here. child nodes under 'providers' and 'subscriptions' are created in the tree itself
    getTreeNodes(): TreeBranch[] {
        return this.resourcesDefinitionsTable.filter((rd) => { return this.isSupportedTreeNode(rd.url); })
            .getUnique((rd) => { return rd.url.split("/")[3]; }).map((urd) => {
                const treeBranch = new TreeBranch(urd.url.split("/")[3]);
                treeBranch.resourceDefinition = urd;
                treeBranch.data = undefined;
                treeBranch.resource_icon = "fa fa-cube fa-fw";
                treeBranch.children = [];
                treeBranch.elementUrl = urd.url;
                treeBranch.sortValue = null;
                treeBranch.iconNameOverride = null;
                return treeBranch;
            });
    }

    getResourceDefinitionByNameAndUrl(name: string, url: string): ResourceDefinition {
        const resourceDefinitions = this.getMatchingDefinitions(r => (r.resourceName === name) &&
            ((r.url.toLowerCase() === url.toLowerCase()) ||
                r.url.toLowerCase() === (url.toLowerCase() + "/" + name.toLowerCase())));

        if (resourceDefinitions.length > 1) {
            console.log("ASSERT! duplicate ids in resourceDefinitionsTable");
            console.log(resourceDefinitions);
        }
        return resourceDefinitions[0];
    }



    getMatchingDefinitions(predicate: (value: ResourceDefinition, index: number, array: ResourceDefinition[]) => boolean): ResourceDefinition[] {
        return this.resourcesDefinitionsTable.filter(predicate);
    }

    private fixOperationUrl(operation: IMetadataObject) {
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

    private removeActionLessDefinitions() {
        for (let index = this.resourcesDefinitionsTable.length - 1; index >= 0; index--) {
            const resourceDefinition = this.resourcesDefinitionsTable[index];
            if (resourceDefinition.hideFromExplorerView()) {
                this.resourcesDefinitionsTable.splice(index, 1);
            }
        }
    }

    async buildResourceDefinitions() {
        const applicableProviders = await this.repository.getApplicableProvidersAsync();
        const applicableOperationsResponse = await this.repository.getApplicableOperations(applicableProviders);
        const applicableOperations: any[] = applicableOperationsResponse.data;
        applicableOperations.sort((a, b) => { return a.Url.localeCompare(b.Url); });

        applicableOperations.map((operation) => {
            //TODO: remove this
            operation = this.fixOperationUrl(operation);
            this.addOperation(operation);
        });
        this.sortChildren();
        this.removeActionLessDefinitions();
    }

    private sortChildren() {
        this.resourcesDefinitionsTable.map((resourceDefinition) => {
            var children = resourceDefinition.children;
            if (typeof children !== "string" && Array.isArray(children)) {
                children.sort();
            }
        });
    }

    private setParent(url: string, action?: string, requestBody?: any, requestBodyDoc?: any, apiVersion?: string) {
        var segments = url.split("/").filter(a => a.length !== 0);
        var resourceName = segments.pop();
        var parentName = url.substring(0, url.lastIndexOf("/"));
        if (parentName === undefined || parentName === "" || resourceName === undefined) return;
        var parents = this.resourcesDefinitionsTable.filter(rd => rd.url.toLowerCase() === parentName.toLowerCase());
        var parent: ResourceDefinition;
        if (parents.length === 1) {
            parent = parents[0];
            if (resourceName.match(/\{.*\}/g)) {
                // this means the parent.children should either be an undefined, or a string.
                // if it's anything else assert! because that means we have a mistake in our assumptions
                if (parent.children === undefined || typeof parent.children === "string") {
                    parent.children = resourceName;
                } else {
                    console.log("ASSERT1, typeof parent.children: " + typeof parent.children);
                }
            } else if (resourceName !== "list") {
                // this means that the resource is a pre-defined one. the parent.children should be undefined or array
                // if it's anything else assert! because that means we have a mistake in out assumptions
                if (parent.children === undefined) {
                    parent.children = [resourceName];
                } else if (Array.isArray(parent.children)) {
                    if ((<string[]>parent.children).filter(c => c === resourceName).length === 0) {
                        (<string[]>parent.children).push(resourceName);
                    }
                } else {
                    parent.children = [resourceName];
                    console.log("ASSERT2, typeof parent.children: " + typeof parent.children);
                }
            }
        } else {
            //this means the parent is not in the array. Add it
            parent = this.addOperation(undefined, url.substring(0, url.lastIndexOf("/")));
            this.setParent(url);
        }

        if (action && parent && parent.actions.filter(c => c === action).length === 0) {
            parent.actions.push(action);
        }

        if (requestBody && parent && !parent.requestBody) {
            parent.requestBody = requestBody;
        }

        if (requestBodyDoc && parent && !parent.requestBodyDoc) {
            parent.requestBodyDoc = requestBodyDoc;
        }

        if (apiVersion && parent && !parent.apiVersion) {
            parent.apiVersion = apiVersion;
        }
    }


    private addOperation(operation: IMetadataObject, url?: string): ResourceDefinition {
        url = (operation ? operation.Url : url);
        url = url.replace(/{.*?}/g, "{name}");
        var segments = url.split("/").filter(a => a.length !== 0);
        var resourceName = segments.pop();
        var addedElement :ResourceDefinition = undefined;

        if (resourceName === "list" && operation && operation.HttpMethod === "POST") {
            // handle resources that has a "secure GET"
            this.setParent(url, "GETPOST", operation.RequestBody, operation.RequestBodyDoc, operation.ApiVersion);
            return addedElement;
        } else if (operation && (operation.MethodName.startsWith("Create") || operation.MethodName.startsWith("BeginCreate") || operation.MethodName.startsWith("Put")) && operation.HttpMethod === "PUT") {
            // handle resources that has a CreateOrUpdate
            this.setParent(url, "CREATE", operation.RequestBody, operation.RequestBodyDoc);
            if (operation.MethodName.indexOf("Updat") === -1) {
                return addedElement;
            }
        }
        //set the element itself
        var elements = this.resourcesDefinitionsTable.filter(r => r.url.toLowerCase() === url.toLowerCase());
        if (elements.length === 1) {

            //it's there, update it's actions
            if (operation) {
                elements[0].requestBody = (elements[0].requestBody ? elements[0].requestBody : operation.RequestBody);
                elements[0].apiVersion = operation.ApiVersion;
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
            addedElement = new ResourceDefinition();
            addedElement.resourceName = resourceName;
            addedElement.children = undefined;
            addedElement.actions = (operation ? [operation.HttpMethod] : []);
            addedElement.url= url;
            addedElement.requestBody = operation ? operation.RequestBody : {},
            addedElement.requestBodyDoc = operation ? operation.RequestBodyDoc : {},
            addedElement.responseBodyDoc = operation ? operation.ResponseBodyDoc : {},
            addedElement.query = operation ? operation.Query : [],
            addedElement.apiVersion = operation && operation.ApiVersion ? operation.ApiVersion : undefined;
            this.resourcesDefinitionsTable.push(addedElement);
        }

        // set the parent recursively
        this.setParent(url);

        return addedElement;
    }

    getActionsAndVerbs(treeBranch: TreeBranch): Action[] {
        const actions: Action[] = [];
        if (treeBranch.resourceDefinition.actions.includes("DELETE")) {
            actions.push(new Action("DELETE", "Delete", treeBranch.getGetActionUrl()));
        }

        const children = treeBranch.resourceDefinition.children;

        if (typeof children !== "string" && Array.isArray(children)) {
            children.filter(childString => {
                var matchingDefinition = this.getMatchingDefinitions(r => (r.resourceName === childString) &&
                    ((r.url === treeBranch.resourceDefinition.url) || r.url === (treeBranch.resourceDefinition.url + "/" + childString)));
                return matchingDefinition.length === 1;
            }).map(childString => {
                var resourceDefinition = this.getResourceDefinitionByNameAndUrl(childString, treeBranch.resourceDefinition.url + "/" + childString);
                if (resourceDefinition.children === undefined && Array.isArray(resourceDefinition.actions) && resourceDefinition.actions.filter(actionName => actionName === "POST").length > 0) {
                    const newAction = new Action("POST", resourceDefinition.resourceName, treeBranch.getGetActionUrl() + "/" + resourceDefinition.resourceName);
                    newAction.requestBody = (resourceDefinition.requestBody ? StringUtils.stringify(resourceDefinition.requestBody) : undefined);
                    newAction.query = resourceDefinition.query;
                    actions.push(newAction);
                }
            });
        }

        return actions;
    }
}