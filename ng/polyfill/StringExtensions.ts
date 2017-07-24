export class StringExtensions {

    static contains(baseStr: string, str: string, ignoreCase?: boolean): boolean {
        let searchValue: string = str || "";

        if (ignoreCase) {
            baseStr = baseStr.toLowerCase();
            searchValue = searchValue.toLowerCase();
        }

        return baseStr.indexOf(searchValue) !== -1;
    }

    static compare(stringA: string, stringB: string, ignoreCase?: boolean): number {

        if (ignoreCase) {
            stringA = stringA.toLowerCase();
            stringB = stringB.toLowerCase();
        }

        if (stringA > stringB) {
            return 1;
        } else if (stringA < stringB) {
            return -1;
        } else {
            return 0;
        }
    }
}