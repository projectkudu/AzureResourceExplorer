module armExplorer {
    angular.module('armExplorer').factory('utilities', function () {
        return {

            escapeHtmlEntities: function escapeHtmlEntities(str: string) {
                return $('<div/>').text(str).html();
            },

            syntaxHighlight: function syntaxHighlight(json: any) {
                if (typeof json === "string") return this.escapeHtmlEntities(json);
                var str = this.stringify(json);
                str = this.escapeHtmlEntities(str);
                return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
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
            },

            stringify: function stringify(object: any): string {
                return JSON.stringify(object, undefined, 2)
            }

        }
    });
}