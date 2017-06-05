module armExplorer {

    export function keyCount(arg: any) {
        let count: number = 0;
        for (let key in arg) {
            if (arg.hasOwnProperty(key)) {
                count++;
            }
        }
        return count;
    }

    export function throwIfObjectNotEqual<T>(expected: T, actual: T) {
        throwIfNotEqual(keyCount(expected), keyCount(actual));
        for (let key in expected) {
            if (expected.hasOwnProperty(key)) {
                if (typeof expected[key] === 'object') {
                    throwIfObjectNotEqual(expected[key], actual[key]);
                } else {
                    throwIfNotEqual(expected[key], actual[key]);
                }
            }
        }
    }

    export function throwIfArrayNotEqual<T>(expectedStrings: Array<T>, actualStrings: Array<T>) {
        if (expectedStrings.length != actualStrings.length) {
            throw new Error("Expected: " + expectedStrings.length + "\nActual: " + actualStrings.length + "\n");
        }
        for (let i in expectedStrings) {
            if (expectedStrings.hasOwnProperty(i)) {
                throwIfNotEqual(expectedStrings[i], actualStrings[i]);
            }
        }
    }

    export function throwIfNotEqual<T>(expected: T, actual: T) {
        if (typeof expected === 'object') {
            throwIfObjectNotEqual(expected, actual);
        }
        else {
            if (expected !== actual) {
                throw new Error("Expected: " + expected + "\nActual: " + actual + "\n");
            }
        }
    }

    export function throwIfDefined(arg: any) {
        if (typeof arg === 'undefined')
            return;
        throw new Error("Expected: undefined Actual: " + arg);
    }

    export function logSuccess(callerArg: IArguments) {
        let currentFunction = callerArg.callee.toString();
        console.log(currentFunction.substr(0, currentFunction.indexOf('(')).replace("function", "TEST") + " :PASSED");
    }

}
