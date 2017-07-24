export class StringUtils {
    static selectiveUrlencode(url: string) : string{
        return url.replace(/\#/g, '%23').replace(/\s/g, '%20');
    }

    static stringify(object: any): string {
        return JSON.stringify(object, undefined, 2);
    }

    static escapeHtmlEntities(str: string) {
        return $('<div/>').text(str).html();
    }

    static syntaxHighlight(json: any) {
        if (typeof json === "string") return StringUtils.escapeHtmlEntities(json);
        let str = this.stringify(json);
        str = StringUtils.escapeHtmlEntities(str);
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
    }
}