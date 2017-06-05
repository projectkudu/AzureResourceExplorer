module armExplorer {

    interface IStringDictionary<T> {
        put(key: string, value: T);
        contains(key: string): boolean;
        get(key: string): T;
    }

	export class StringDictionary<T> implements IStringDictionary<T> {
		private items: {[index : string] : T} = {};

		public contains(key: string) : boolean {
			return this.items.hasOwnProperty(key);
		}

		public put(key: string, value: T) {
			this.items[key] = value;
		}

		public get(key: string) : T {
			return this.items[key];
        }
    }

    export function GetPSObjectFromJSON(json: string, nestingLevel: number): string {
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
                result += tabs + "\t" + GetPSObjectFromJSON(JSON.stringify(jsonObj[i]), nestingLevel + 1) + "\n";
            }
            return result + tabs + ")";
        }
        else if (typeof jsonObj === "object") {
            var result = "@{\n";
            for (var prop in jsonObj) {
                if (jsonObj.hasOwnProperty(prop)) {
                    result += tabs + "\t" + prop + " = " + GetPSObjectFromJSON(JSON.stringify(jsonObj[prop]), nestingLevel + 1) + "\n";
                }
            }
            return result + tabs + "}\n";
        }
        return json;
    }

}