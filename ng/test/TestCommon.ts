export class TestCommon {

    static keyCount(arg: any) {
        let count: number = 0;
        for (let key in arg) {
            if (arg.hasOwnProperty(key)) {
                count++;
            }
        }
        return count;
    }

    static throwIfObjectNotEqual<T>(expected: T, actual: T) {
        TestCommon.throwIfNotEqual(TestCommon.keyCount(expected), TestCommon.keyCount(actual));
        for (let key in expected) {
            if (expected.hasOwnProperty(key)) {
                if (typeof expected[key] === 'object') {
                    TestCommon.throwIfObjectNotEqual(expected[key], actual[key]);
                } else {
                    TestCommon.throwIfNotEqual(expected[key], actual[key]);
                }
            }
        }
    }

    static throwIfArrayNotEqual<T>(expectedStrings: Array<T>, actualStrings: Array<T>) {
        if (expectedStrings.length != actualStrings.length) {
            throw new Error("Expected: " + expectedStrings.length + "\nActual: " + actualStrings.length + "\n");
        }
        for (let i in expectedStrings) {
            if (expectedStrings.hasOwnProperty(i)) {
                TestCommon.throwIfNotEqual(expectedStrings[i], actualStrings[i]);
            }
        }
    }

    static throwIfNotEqual<T>(expected: T, actual: T) {
        if (typeof expected === 'object') {
            TestCommon.throwIfObjectNotEqual(expected, actual);
        }
        else {
            if (expected !== actual) {
                throw new Error("Expected: " + expected + "\nActual: " + actual + "\n");
            }
        }
    }

    static throwIfDefined(arg: any) {
        if (typeof arg === 'undefined')
            return;
        throw new Error("Expected: undefined Actual: " + arg);
    }

    static logSuccess(callerArg: IArguments) {
        let currentFunction = callerArg.callee.toString();
        console.log(currentFunction.substr(0, currentFunction.indexOf('(')).replace("function", "TEST") + " :PASSED");
    }

}

