// Stolen from: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        const list = Object(this);
        const length = list.length >>> 0;
        const thisArg = arguments[1];
        let value;

        for (let i = 0; i < length; i += 1) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}
