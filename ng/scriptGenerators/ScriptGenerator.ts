import {ScriptParametersResolver} from "./ScriptParametersResolver";
import {ARMUrlParser} from "./ARMUrlParser";
import {ISelectHandlerReturn} from "../models/ISelectHandlerReturn";
import {PowerShellScriptGenerator} from "./powershell/PowerShellScriptGenerator";
import {CliScriptGenerator} from "./cli/CliScriptGenerator";
import {ResourceHandlerResolver} from "./cli/ResourceHandlerResolver";
import {Action} from "../models/Action";

export class ScriptGenerator {
    static getPowerShellScriptsForResource(value: ISelectHandlerReturn, actions: Action[]): string {
        let script = "# PowerShell equivalent script\n\n";
        const urlParser = new ARMUrlParser(value, actions);
        const parameterResolver = new ScriptParametersResolver(urlParser);
        const scriptGenerator = new PowerShellScriptGenerator(parameterResolver);
        for (let cmd of parameterResolver.getSupportedCommands()) {
            script += scriptGenerator.getScript(cmd);
        }
        return script;
    }

    static getAzureCliScriptsForResource(value: ISelectHandlerReturn) {
        const parser: ARMUrlParser = new ARMUrlParser(value, []);
        const resolver: ScriptParametersResolver = new ScriptParametersResolver(parser);
        const resourceHandlerResolver: ResourceHandlerResolver = new ResourceHandlerResolver(resolver);
        const scriptGenerator: CliScriptGenerator = new CliScriptGenerator(resolver, resourceHandlerResolver);
        return scriptGenerator.getScript();
    }
}