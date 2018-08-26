module armExplorer {

    export class CliScriptGenerator {

        constructor(private resolver: ScriptParametersResolver, private resourceHandlerResolver: IResourceHandlerResolver) {
            // Invoke the static constructor to do a one time init
            ScriptInternals.init();
        }

        public getCliResourceType(): CliResourceType {
            const resourceId = this.resolver.getCompleteResourceId().toLowerCase();

            if (resourceId.endsWith("/subscriptions")) {
                return CliResourceType.Subscriptions;
            }
            if (resourceId.endsWith("/locations")) {
                return CliResourceType.SubscriptionLocations;
            }
            if (resourceId.endsWith("/resourcegroups")) {
                return CliResourceType.ResourceGroups;
            }
            const resourceIdParts = resourceId.split("/");

            if (resourceIdParts.length === 3) {
                return CliResourceType.Subscription;
            }

            if (resourceIdParts[resourceIdParts.length - 2] === "resourcegroups") {
                return CliResourceType.ResourceGroup;
            }

            if (resourceId.endsWith("/microsoft.web/sites")) {
                return CliResourceType.WebApps;
            }
            const lastIndex = resourceId.lastIndexOf("/");
            if (resourceId.substring(0, lastIndex).endsWith("/microsoft.web/sites")) {
                return CliResourceType.WebApp;
            }

            return CliResourceType.GenericResource;
        }

        public getScript(): string {
            const resourceType = this.getCliResourceType();
            let resourceHandler: ICliResource = this.resourceHandlerResolver.getResourceHandler(resourceType);

            let script = "";

            for (let cmd of this.resolver.getSupportedCommands()) {
                script += resourceHandler.getScript(ScriptInternals.getCliResourceType(cmd.cmd));
            }

            return script;
        }
    }

}
