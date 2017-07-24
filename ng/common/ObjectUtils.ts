export class ObjectUtils {

    static isEmptyObjectOrArray(obj: any): boolean {
        if (typeof obj === "number" || typeof obj === "boolean") return false;
        if ($.isEmptyObject(obj)) return true;
        if (obj === null || obj === "" || obj.length === 0) return true;
        return false;
    }

    static flattenArray(array: any[]): any[] {
        for (var i = 0; i < array.length; i++) {
            if (typeof array[i].doc !== "string") {
                var flat = ObjectUtils.flattenObject(array[i].name, array[i].doc);
                var first = array.slice(0, i);
                var end = array.slice(i + 1);
                array = first.concat(flat).concat(end);
                i += flat.length - 1;
            }
        }
        return array;
    }

    static flattenObject(prefix: string, object: any): any[] {
        var flat: any[] = [];
        if (typeof object === "string") {
            flat.push({
                name: prefix,
                doc: object
            });
        } else if (Array.isArray(object)) {
            flat = flat.concat(ObjectUtils.flattenObject(prefix, object[0]));
        } else if (ObjectUtils.isEmptyObjectOrArray(object)) {
            flat.push({
                name: prefix,
                doc: ""
            });
        } else {
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    if (typeof object[prop] === "string") {
                        flat.push({
                            name: prefix + "." + prop,
                            doc: object[prop]
                        });
                    } else if (Array.isArray(object[prop]) && object[prop].length > 0) {
                        flat = flat.concat(ObjectUtils.flattenObject(prefix + "." + prop, object[prop][0]));
                    } else if (typeof object[prop] === "object") {
                        flat = flat.concat(ObjectUtils.flattenObject(prefix + "." + prop, object[prop]));
                    } else {
                        flat.push({
                            name: prefix,
                            doc: object
                        });
                    }
                }
            }
        }
        return flat;
    }

    static sortByObject(toBeSorted: any, toSortBy: any): any {
        if (toBeSorted === toSortBy) return toBeSorted;
        const sorted: any = {};
        for (var key in toSortBy) {
            if (toSortBy.hasOwnProperty(key)) {
                var obj: any;
                if (typeof toSortBy[key] === "object" && !Array.isArray(toSortBy[key]) && toSortBy[key] != null) {
                    obj = ObjectUtils.sortByObject(toBeSorted[key], toSortBy[key]);
                } else {
                    obj = toBeSorted[key];
                }
                sorted[key] = obj;
            }
        }
        for (var key in toBeSorted) {
            if (toBeSorted.hasOwnProperty(key) && sorted[key] === undefined) {
                sorted[key] = toBeSorted[key]
            }
        }
        return sorted;
    }

    static cleanObject(obj: any) {
        const hadProperties = (obj.properties !== undefined);
        ObjectUtils.recursiveCleanObject(obj);
        if (hadProperties && !obj.properties) {
            obj.properties = {};
        }
    }

    static recursiveCleanObject(obj: any) {
        for (let property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] === "string" && (/^\(.*\)$/.test(obj[property]))) {
                    delete obj[property];
                } else if (Array.isArray(obj[property])) {
                    const hadElements = obj[property].length > 0;
                    obj[property] = obj[property].filter((element: any) => {
                        if (typeof element === "string" && (/^\(.*\)$/.test(element))) {
                            return false
                        } else if (typeof element === "object" && !$.isEmptyObject(element)) {
                            this.recursiveCleanObject(element);
                        } else if (typeof element === "object" && $.isEmptyObject(element)) {
                            return false;
                        }
                        if ($.isPlainObject(element) && $.isEmptyObject(element)) return false;
                        return true;
                    });
                    if (hadElements && obj[property].length === 0) delete obj[property];
                } else if (typeof obj[property] === "object" && !$.isEmptyObject(obj[property])) {
                    this.recursiveCleanObject(obj[property]);
                    if ($.isEmptyObject(obj[property])) delete obj[property];
                } else if (typeof obj[property] === "object" && $.isEmptyObject(obj[property])) {
                    delete obj[property];
                }
            }
        }
    }

    static mergeObject(source: any, target: any): any {
        for (let sourceProperty in source) {
            if (source.hasOwnProperty(sourceProperty) && target.hasOwnProperty(sourceProperty)) {
                if (!ObjectUtils.isEmptyObjectOrArray(source[sourceProperty]) && (typeof source[sourceProperty] === "object") && !Array.isArray(source[sourceProperty])) {
                    ObjectUtils.mergeObject(source[sourceProperty], target[sourceProperty]);
                } else if (Array.isArray(source[sourceProperty]) && Array.isArray(target[sourceProperty])) {
                    var targetModel = target[sourceProperty][0];
                    target[sourceProperty] = source[sourceProperty];
                    target[sourceProperty].push(targetModel);
                } else {
                    target[sourceProperty] = source[sourceProperty];
                }
            } else if (source.hasOwnProperty(sourceProperty)) {
                target[sourceProperty] = source[sourceProperty];
            }
        }
        return target;
    }

    static getPsObjectFromJson(json: string, nestingLevel: number): string {
        var tabs = "";
        for (var i = 0; i < nestingLevel; i++) {
            tabs += "\t";
        }
        var jsonObj = JSON.parse(json);
        if (typeof jsonObj === "string") {
            return "\"" + jsonObj + "\"";
        }
        else if (typeof jsonObj === "boolean") {
            return jsonObj.toString();
        }
        else if (typeof jsonObj === "number") {
            return jsonObj.toString();
        }
        else if (Array.isArray(jsonObj)) {
            var result = "(\n";
            for (var i = 0; i < jsonObj.length; i++) {
                result += tabs + "\t" + ObjectUtils.getPsObjectFromJson(JSON.stringify(jsonObj[i]), nestingLevel + 1) + "\n";
            }
            return result + tabs + ")";
        }
        else if (typeof jsonObj === "object") {
            var result = "@{\n";
            for (var prop in jsonObj) {
                if (jsonObj.hasOwnProperty(prop)) {
                    result += tabs + "\t" + prop + " = " + ObjectUtils.getPsObjectFromJson(JSON.stringify(jsonObj[prop]), nestingLevel + 1) + "\n";
                }
            }
            return result + tabs + "}\n";
        }
        return json;
    }

}