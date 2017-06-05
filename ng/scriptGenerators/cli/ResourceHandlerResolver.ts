namespace armExplorer {
    export class ResourceHandlerResolver implements IResourceHandlerResolver{
        constructor(private resolver: ScriptParametersResolver) {
            ScriptInternals.init();
        }

        public getResourceHandler(resType: CliResourceType) : ICliResource{
            const resourceClassName = ScriptInternals.getClassName(resType);
            return new window["armExplorer"][resourceClassName](this.resolver);
        }
    }
}