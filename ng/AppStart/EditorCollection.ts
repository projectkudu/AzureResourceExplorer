enum Editor {
    ResponseEditor, RequestEditor, CreateEditor, PowershellEditor, AzureCliEditor
}

class EditorCollection {
    private editors: AceAjax.Editor[] = [null, null, null, null, null];

    constructor() {
        this.editors[Editor.ResponseEditor] = ace.edit("response-json-editor");
        this.editors[Editor.RequestEditor] = ace.edit("request-json-editor");
        this.editors[Editor.CreateEditor] = ace.edit("json-create-editor");
        this.editors[Editor.PowershellEditor] = ace.edit("powershell-editor");
        this.editors.length = 4;
//        this.editors[Editor.AzureCliEditor] = ace.edit("azurecli-editor");
    }

    private isHidden(editor: Editor) {
        return editor === Editor.AzureCliEditor;
    }

    getValue(editor: Editor, cleanObject: boolean): any {
        const currentEditor = this.editors[editor];
        let value = JSON.parse(currentEditor.getValue());
        if (cleanObject) ObjectUtils.cleanObject(value);
        return value;
    }

    setValue(editor: Editor, stringValue: string) {
        if (this.isHidden(editor)) {
            return;
        }

        const currentEditor = this.editors[editor];
        currentEditor.setValue(stringValue);
        currentEditor.session.selection.clearSelection();
        currentEditor.moveCursorTo(0,0);
    }

    setMode(editor: Editor, mode: string) {
        if (this.isHidden(editor)) {
            return;
        }

        const currentEditor = this.editors[editor];
        currentEditor.getSession().setMode(mode);
    }

    setTheme(editor: Editor, theme: string) {
        if (this.isHidden(editor)) {
            return;
        }

        const currentEditor = this.editors[editor];
        currentEditor.setTheme(theme);
    }

    setShowGutter(editor: Editor, showGutter: boolean) {
        if (this.isHidden(editor)) {
            return;
        }

        const currentEditor = this.editors[editor];
        currentEditor.renderer.setShowGutter(showGutter);
    }

    setReadOnly(editor: Editor, setBackground?: boolean) {
        if (this.isHidden(editor)) {
            return;
        }

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

    resize(editor: Editor) {
        if (this.isHidden(editor)) {
            return;
        }

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

        this.setReadOnly(Editor.ResponseEditor);
        this.setValue(Editor.ResponseEditor, StringUtils.stringify({ message: "Select a node to start" }));

        this.setReadOnly(Editor.PowershellEditor, false);
        this.setReadOnly(Editor.AzureCliEditor, false);
        this.setTheme(Editor.PowershellEditor, "ace/theme/tomorrow_night_blue");
        this.setTheme(Editor.AzureCliEditor, "ace/theme/tomorrow_night_blue");
        this.setShowGutter(Editor.PowershellEditor, false);
        this.setShowGutter(Editor.AzureCliEditor, false);

        this.setMode(Editor.PowershellEditor, "ace/mode/powershell");
        this.setValue(Editor.PowershellEditor, "# PowerShell equivalent script");

        this.setMode(Editor.AzureCliEditor, "ace/mode/sh");
        this.setValue(Editor.AzureCliEditor, "# Azure CLI 2.0 equivalent script");
    }

}