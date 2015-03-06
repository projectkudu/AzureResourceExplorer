interface String {
    startsWith(str: string): boolean;
    endsWith(str: string): boolean;
}

interface Array<T> {
    includes(obj: T): boolean;
    remove(from: number, to: number): Array<T>;
    getUnique(getValue: (val: T) => any): Array<T>;
    indexOfDelegate(predicate: (val: T) => boolean, fromIndex?: number): number;
    last(): T;
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (str) {
        return this.indexOf(str, this.length - str.length) !== -1;
    };
}

if (!Array.prototype.includes) {
    Array.prototype.includes = (searchElement) => {
        if (this === undefined || this === null) {
            throw new TypeError('Cannot convert this value to object');
        }
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var k = 0;
        while (k < len) {
            var currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
            k++;
        }
        return false;
    }
}

Array.prototype.remove = (from, to) =>  {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

Array.prototype.getUnique = (getValue) => {
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
};

//http://devdocs.io/javascript/global_objects/array/indexof
Array.prototype.indexOfDelegate = function (predicate, fromIndex) {

    var k;

    // 1. Let O be the result of calling ToObject passing
    //    the this value as the argument.
    if (this == null) {
        throw new TypeError('"this" is null or not defined');
    }

    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
        return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
        n = 0;
    }

    // 6. If n >= len, return -1.
    if (n >= len) {
        return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
        var kValue;
        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the
        //    HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        //    i.  Let elementK be the result of calling the Get
        //        internal method of O with the argument ToString(k).
        //   ii.  Let same be the result of applying the
        //        Strict Equality Comparison Algorithm to
        //        searchElement and elementK.
        //  iii.  If same is true, return k.
        if (k in O && predicate(O[k])) {
            return k;
        }
        k++;
    }
    return -1;
};

if (!Array.prototype.some) {
    Array.prototype.some = (fun/*, thisArg*/) => {
        'use strict';

        if (this == null) {
            throw new TypeError('Array.prototype.some called on null or undefined');
        }

        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(thisArg, t[i], i, t)) {
                return true;
            }
        }

        return false;
    };
}

if (!Array.prototype.last) {
    Array.prototype.last = () => {
        return this[this.length - 1];
    };
};