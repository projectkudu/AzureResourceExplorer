/// <reference path="../references.ts" />

module managePortalUi {
    "use strict";

    export class managePortalApi {

        constructor() {
            $('label.tree-toggler').click(function () {
                $(this).parent().children('ul.tree').toggle(300);
            });
            if (typeof String.prototype.startsWith != 'function') {
                String.prototype.startsWith = function (str) {
                    return this.slice(0, str.length) == str;
                };
            }
            if (typeof String.prototype.endsWith != 'function') {
                String.prototype.endsWith = function (str) {
                    return this.indexOf(str, this.length - str.length) !== -1;
                };
            }

            Array.prototype.remove = function (from, to) {
                var rest = this.slice((to || from) + 1 || this.length);
                this.length = from < 0 ? this.length + from : from;
                return this.push.apply(this, rest);
            };

            Array.prototype.getUnique = function (getValue) {
                var u = {}, a = [];
                for (var i = 0, l = this.length; i < l; ++i) {
                    var value = getValue(this[i]);
                    if (u.hasOwnProperty(value)) {
                        continue;
                    }
                    a.push(this[i]);
                    u[value] = 1;
                }
                return a;
            }
        }
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

        getRerouceGroupNameFromWebSpaceName(webSpaceName: string): string {
            webSpaceName = webSpaceName.toLowerCase();
            if (!webSpaceName.endsWith("webspace")) {
                return undefined;
            }

            // strip ending webspace
            var ws = webSpaceName.substring(0, webSpaceName.length - 8);
            var index = ws.lastIndexOf('-');
            if (index < 0) {
                return "Default-Web-" + ws;
            }
            else {
                return ws.substring(0, index);
            }
        }

        isEmptyObjectorArray(obj) {
            if (typeof obj === "number" || typeof obj === "boolean") return false;
            if (jQuery.isEmptyObject(obj)) return true;
            if (obj === null || obj === "" || obj.length === 0) return true;
            return false;
        }

        cleanObject(obj) {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (typeof obj[property] === "string" && (/\(.*\)/.test(obj[property]))) {
                        delete obj[property];
                    } else if (Array.isArray(obj[property])) {
                        var toRemove = [];
                        for (var i = 0; i < obj[property].length; i++) {
                            if (typeof obj[property][i] === "string" && (/\(.*\)/.test(obj[property][i]))) {
                                toRemove.push(i);
                            } else if (typeof obj[property][i] === "object" && !jQuery.isEmptyObject(obj[property])) {
                                this.cleanObject(obj[property][i]);
                            } else if (typeof obj[property][i] === "object" && jQuery.isEmptyObject(obj[property])) {
                                toRemove.push(i);
                            }
                            if (jQuery.isEmptyObject(obj[property][i])) toRemove.push(i);
                        }

                        for (var i = 0; i < toRemove.length; i++) obj[property].remove(i);
                        if (obj[property].length === 0) delete obj[property];

                    } else if (typeof obj[property] === "object" && !jQuery.isEmptyObject(obj[property])) {
                        this.cleanObject(obj[property]);
                        if (jQuery.isEmptyObject(obj[property])) delete obj[property];
                    } else if (typeof obj[property] === "object" && jQuery.isEmptyObject(obj[property])) {
                        delete obj[property];
                    }
                }
            }
        }

        mergeObject(source: any, target: any) {
            for (var sourceProperty in source) {
                if (source.hasOwnProperty(sourceProperty) && target.hasOwnProperty(sourceProperty)) {
                    if (!this.isEmptyObjectorArray(source[sourceProperty]) && (typeof source[sourceProperty] === "object") && !Array.isArray(source[sourceProperty])) {
                        this.mergeObject(source[sourceProperty], target[sourceProperty]);
                    } else if (!this.isEmptyObjectorArray(source[sourceProperty])) {
                        target[sourceProperty] = source[sourceProperty];
                    }
                }
            }
        }


    }
}