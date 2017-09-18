/**
 * Utility functions.
 */

var debug = false, util = {},set;


export const isArray = Array.isArray;

export default function (Vue) {
    set = Vue.set;
    util = Vue.util;
    debug = Vue.config.debug || !Vue.config.silent;
}

export function warn(msg) {
    if (typeof console !== 'undefined' && debug) {
        console.warn(`[VueForm warn]: ${msg}`);
    }
}

export function isString(val) {
    return typeof val === 'string';
}

export function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

export function isUndefined(val) {
    return typeof val === 'undefined';
}

export function on(el, event, cb, useCapture) {
    el.addEventListener(event, cb, useCapture);
}

export function off(el, event, cb, useCapture) {
    el.removeEventListener(event, cb, useCapture);
}

export function attr(el, attr) {
    return el ? el.getAttribute(attr) : null;
}

export function trigger(el, event) {

    var e = document.createEvent('HTMLEvents');

    e.initEvent(event, true, false);
    el.dispatchEvent(e);
}

export function getFromPath(path, currentScope) {

    let keys = path.split('.');

    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];

        if (typeof currentScope === 'undefined') {
            break;
        }
        currentScope = currentScope[key];
    }

    return currentScope;

}

export function setFromPath(path, value, currentScope) {

    let keys = path.split('.');

    while (keys.length > 1) {

        let key = keys.shift();

        if (typeof currentScope[key] !== 'object') { //force ? typeof currentScope[key] !== 'object')
            set(currentScope, key, {});
        }
        currentScope = currentScope[key];
    }

    set(currentScope, keys[0], value);


}

export function camelize(str) {
    return util.camelize(str);
}

export function pull(arr, value) {
    arr.splice(arr.indexOf(value), 1);
}

// export function get(obj, path, def) {
//
//     path = path.replace(/\[(\w+)\]/g, '.$1');
//     path = path.replace(/^\./, '').split('.');
//
//     for (var i = 0, len = path.length; i < len; i++) {
//
//         if (!isObject(obj)) {
//             return def;
//         }
//
//         obj = obj[path[i]];
//     }
//
//     return isUndefined(obj) ? def : obj;
// }

export function each(obj, iterator) {

    var i, key;

    if (typeof obj.length == 'number') {
        for (i = 0; i < obj.length; i++) {
            iterator.call(obj[i], obj[i], i);
        }
    } else if (isObject(obj)) {
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                iterator.call(obj[key], obj[key], key);
            }
        }
    }

    return obj;
}

export const assign = Object.assign || function (target) {

    for (var i = 1; i < arguments.length; i++) {

        var source = arguments[i];

        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }

    return target;
};
