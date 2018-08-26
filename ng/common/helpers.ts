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
}