import {EditorType} from "./EditorType";
import {StringUtils} from "../common/StringUtils";
import {ObjectUtils} from "../common/ObjectUtils";

export class EditorCollection {
    private editors: AceAjax.Editor[] = [null, null, null, null, null];

    constructor() {
        this.editors[EditorType.ResponseEditor] = ace.edit("response-json-editor");
        this.editors[EditorType.RequestEditor] = ace.edit("request-json-editor");
        this.editors[EditorType.CreateEditor] = ace.edit("json-create-editor");
        this.editors[EditorType.PowershellEditor] = ace.edit("powershell-editor");
        this.editors[EditorType.AzureCliEditor] = ace.edit("azurecli-editor");
    }

    getValue(editor: EditorType, cleanObject: boolean): any {
        const currentEditor = this.editors[editor];
        let value = JSON.parse(currentEditor.getValue());
        if (cleanObject) ObjectUtils.cleanObject(value);
        return value;
    }

    setValue(editor: EditorType, stringValue: string) {
        const currentEditor = this.editors[editor];
        currentEditor.setValue(stringValue);
        currentEditor.session.selection.clearSelection();
        currentEditor.moveCursorTo(0,0);
    }

    setMode(editor: EditorType, mode: string) {
        const currentEditor = this.editors[editor];
        currentEditor.getSession().setMode(mode);
    }

    setTheme(editor: EditorType, theme: string) {
        const currentEditor = this.editors[editor];
        currentEditor.setTheme(theme);
    }

    setShowGutter(editor: EditorType, showGutter: boolean) {
        const currentEditor = this.editors[editor];
        currentEditor.renderer.setShowGutter(showGutter);
    }

    setReadOnly(editor: EditorType, setBackground?: boolean) {
        const currentEditor = this.editors[editor];
        setBackground = typeof setBackground !== 'undefined' ? setBackground : true;
        currentEditor.setOptions({
            readOnly: true,
            highlightActiveLine: false,
            highlightGutterLine: false
        });
        const virtualRenderer: any = currentEditor.renderer;
        virtualRenderer.$cursorLayer.element.style.opacity = 0;
        virtualRenderer.setStyle("disabled", true);

        if (setBackground) currentEditor.container.style.background = "#f5f5f5";
        currentEditor.blur();
    }

    apply(callbackFn: any) {
        this.editors.map(callbackFn);
    }

    resize(editor: EditorType) {
        const currentEditor = this.editors[editor];
        currentEditor.resize();
    }

    configureEditors() {
        this.editors.map((editor) => {
            editor.setOptions({
                maxLines: Infinity,
                fontSize: 15,
                wrap: "free",
                showPrintMargin: false
            });
            editor.setTheme("ace/theme/tomorrow");
            editor.getSession().setMode("ace/mode/json");
            editor.getSession().setNewLineMode("windows");
            const commandManager : any = editor.commands;
            commandManager.removeCommand("find");
        });

        this.setReadOnly(EditorType.ResponseEditor);
        this.setValue(EditorType.ResponseEditor, StringUtils.stringify({ message: "Select a node to start" }));

        this.setReadOnly(EditorType.PowershellEditor, false);
        this.setReadOnly(EditorType.AzureCliEditor, false);
        this.setTheme(EditorType.PowershellEditor, "ace/theme/tomorrow_night_blue");
        this.setTheme(EditorType.AzureCliEditor, "ace/theme/tomorrow_night_blue");
        this.setShowGutter(EditorType.PowershellEditor, false);
        this.setShowGutter(EditorType.AzureCliEditor, false);

        this.setMode(EditorType.PowershellEditor, "ace/mode/powershell");
        this.setValue(EditorType.PowershellEditor, "# PowerShell equivalent script");

        this.setMode(EditorType.AzureCliEditor, "ace/mode/sh");
        this.setValue(EditorType.AzureCliEditor, "# Azure CLI 2.0 equivalent script");
    }

}