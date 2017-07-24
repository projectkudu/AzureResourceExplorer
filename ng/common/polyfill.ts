interface String {
    startsWith(str: string): boolean;
    endsWith(str: string): boolean;
}

interface Array<T> {
    includes(obj: T): boolean;
    last(): T;
    find(predicate: (val: T) => boolean): T;
    some(predicate: (val: T) => boolean): boolean;
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) === str;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (str) {
        return this.indexOf(str, this.length - str.length) !== -1;
    };
}

if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement) {
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

if (!Array.prototype.some) {
    Array.prototype.some = function (fun/*, thisArg*/) {
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
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
};

if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}



