 /// <reference path="../references.ts" />

module managePortalUi {
    "use strict";

    export class managePortalApi {
        syntaxHighlight(json: any): string {
            var str = JSON.stringify(json, undefined, 4);
            str = this.escapeHtmlEntities(str);
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

        escapeHtmlEntities(str) {
            return jQuery('<div/>').text(str).html();
        }
    }
}