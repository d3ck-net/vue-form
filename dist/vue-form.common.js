/*!
 * vue-form v0.3.12
 * Released under the MIT License.
 */

'use strict';

require('lodash');

/**
 * Utility functions.
 */

var debug = false;
var util = {};

var isArray = Array.isArray;

var Util = function (Vue) {
    util = Vue.util;
    debug = Vue.config.debug || !Vue.config.silent;
};

function warn(msg) {
    if (typeof console !== 'undefined' && debug) {
        console.warn(("[VueForm warn]: " + msg));
    }
}

function isString(val) {
    return typeof val === 'string';
}

function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

function isUndefined(val) {
    return typeof val === 'undefined';
}

function on(el, event, cb, useCapture) {
    el.addEventListener(event, cb, useCapture);
}

function off(el, event, cb, useCapture) {
    el.removeEventListener(event, cb, useCapture);
}

function attr(el, attr) {
    return el ? el.getAttribute(attr) : null;
}

function trigger(el, event) {

    var e = document.createEvent('HTMLEvents');

    e.initEvent(event, true, false);
    el.dispatchEvent(e);
}

function camelize(str) {
    return util.camelize(str);
}

function pull(arr, value) {
    arr.splice(arr.indexOf(value), 1);
}



function each(obj, iterator) {

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

var assign = Object.assign || function (target) {
    var arguments$1 = arguments;


    for (var i = 1; i < arguments.length; i++) {

        var source = arguments$1[i];

        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }

    return target;
};

var Field = {

    name: 'field',

    props:['field','class'],
    data: function data() {
        return assign({
            name: '',
            type: 'text',
            label: '',
            attrs: {},
            options: [],
            default: undefined
        }, this.field);
    },

    computed: {

        filteredOptions: function filteredOptions() {
            return this.filterOptions(this.$data.options);
        },
        attributes: {

            get: function get$$1() {

                if (this.enable && !this.$parent.evaluate(this.enable)) {
                    return assign({disabled: 'true'}, this.attrs);
                }

                return this.attrs;
            },


        },

        value: {

            get: function get$$1() {

                var value = this.$parent.getField(this);

                if (isUndefined(value) && !isUndefined(this.default)) {

                    value = this.default;

                    if (value) {
                        this.$parent.setField(this, value);
                    }
                }

                return value;
            },

            set: function set(value) {

                if (!isUndefined(this.value) || value) {
                    this.$parent.setField(this, value, this.value);
                }

            },

        }

    },

    methods: {

        filterOptions: function filterOptions(options) {
            var this$1 = this;

            var opts = [];

            if (!options) {
                warn(("Invalid options provided for " + (this.name)));
                return opts;
            }

            each(options, function (value, name) {
                if (isObject(value)) {
                    opts.push({label: name, options: this$1.filterOptions(value)});
                } else {
                    opts.push({text: name, value: value});
                }
            });

            return opts;
        }

    }


};

var template = "<div>\n\n    <div v-for=\"field in fields\">\n        <label v-if=\"field.type != 'checkbox'\">{{ field.label }}</label>\n        <component :is=\"prefix + field.type\" :field=\"field\"></component>\n    </div>\n\n</div>\n";

var shims = {
    methods:
        {


            getFromPath: function getFromPath(path, currentScope) {

                var keys = path.split('.');

                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];

                    if (typeof currentScope === 'undefined') {
                        break;
                    }
                    currentScope = currentScope[key];
                }

                return currentScope;

            },

            setFromPath: function setFromPath(path, value, currentScope) {

                var keys = path.split('.');

                while (keys.length > 1) {

                    var key = keys.shift();

                    if (typeof currentScope[key] === 'undefined') { //force ? typeof currentScope[key] !== 'object')
                        Vue.set(currentScope, key, {});
                    }
                    currentScope = currentScope[key];
                }

                Vue.set(currentScope, keys[0], value);


            }
        }
};

var evaluator = function (expression) {
    try {
        var res = eval("with(this){ " + expression + " } ");
        return res;
    }
    catch (e) {
        if (!Vue.config.silent)
        {
            console.warn(e);
        }
        return;
    }
};

var Fields = function (Vue) {

    return {

        name: 'fields',

        mixins: [shims],
        props: {

            config: {
                type: [Array, Object],
                default: function default$1() {
                    return [];
                }
            },

            values: {
                type: Object
            },
            prefix:
                {
                    type: String,
                    default: ""
                }

        },

        created: function created() {
            var this$1 = this;


            var ref = this.$options;
            var fields = ref.fields;
            var components = ref.components;

            if (!this.fields || !this.values) {
                warn('Invalid config or model provided');
                return;
            }

            each(assign({}, Vue.fields, fields), function (type, name) {

                if (isString(type)) {
                    type = {template: type};
                }

                if (isObject(type)) {
                    type.name = type.name || ("field-" + name);
                    type = Vue.extend(Field).extend(type);
                }

                if (!Vue.vueForm.useLegacyCode && !this$1.prefix && Vue.config.isReservedTag(name)) {
                    throw ('field type: "' + name + '" is a reserved HTML tag name in Vue 2.x');
                }
                components[this$1.prefix + name] = type;
            });

        },

        computed: {

            fields: function fields() {
                return this.filterFields(this.config);
            }

        },

        methods: {

            getField: function getField(field) {

                if (this.values instanceof Vue && 'getField' in this.values) {
                    return this.values.getField(field);
                }


                return this.getFromPath(field.name, this.values);//


            },

            setField: function setField(field, value, prev) {

                if (this.values instanceof Vue && 'setField' in this.values) {
                    this.values.setField(field, value, prev);
                } else {


                    this.setFromPath(field.name, value, this.values);


                }

            },

            filterFields: function filterFields(config) {
                var this$1 = this;


                var arr = isArray(config), fields = [];

                each(config, function (field, name) {

                    if (!isString(field.name) && !arr) {
                        field.name = name;
                    }

                    if (!isString(field.type)) {
                        field.type = 'text';
                    }

                    if (isString(field.name)) {

                        if (!field.show || this$1.evaluate(field.show)) {
                            fields.push(field);
                        }

                    } else {
                        warn(("Field name missing " + (JSON.stringify(field))));
                    }

                });

                return fields;
            },

            evaluator: function evaluator() {

            },

            evaluate: function evaluate(expr, data) {

                data = data || this.values;

                if (isString(expr)) {

                    var comp = new Vue({data: data});

                    var result = evaluator.call(comp, expr);

                    comp.$destroy();

                    return result;

                }

                return expr.call(this, data, this);
            }

        },

        fields: {},

        components: {},

        template: template

    };

};

var fields = {
    text: '<input type="text" v-bind="attributes" v-model="value">',
    textarea: '<textarea v-bind="attributes" v-model="value"></textarea>',
    radio: "<template v-for=\"option in filteredOptions\">\n                    <input type=\"radio\" v-bind=\"attributes\" :name=\"name\" :value=\"option.value\" v-model=\"value\"> <label>{{ option.text }}</label>\n                 </template>",
    checkbox: '<input type="checkbox" v-bind="attributes" v-model="value">',
    select: "<select v-bind=\"attributes\" v-model=\"value\">\n                     <template v-for=\"option in filteredOptions\">\n                         <optgroup :label=\"option.label\" v-if=\"option.label\">\n                             <option v-for=\"opt in option.options\" :value=\"opt.value\">{{ opt.text }}</option>\n                         </optgroup>\n                         <option :value=\"option.value\" v-else>{{ option.text }}</option>\n                     </template>\n                 </select>",
    range: '<input type="range" v-bind="attributes" v-model="value">',
    number: '<input type="number" v-bind="attributes" v-model="value">'
};

/**
 * Validator functions.
 */

function required(value, arg) {

    if (!(typeof arg == 'boolean')) {
        arg = true;
    }

    if (typeof value == 'boolean') {
        return !arg || value;
    }

    return !arg || !((value === null) || (value.length === 0));
}

function numeric(value) {
    return /^[-+]?[0-9]+$/.test(value);
}

function integer(value) {
    return /^(?:[-+]?(?:0|[1-9][0-9]*))$/.test(value);
}

function float(value) {
    return /^(?:[-+]?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/.test(value);
}

function alpha(value) {
    return /^([A-Z]+)?$/i.test(value);
}

function alphanum(value) {
    return /^([0-9A-Z]+)?$/i.test(value);
}

function email(value) {
    return /^([a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*)?$/i.test(value || 'a@a.aa');
}

function url(value) {
    return /^((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)?$/.test(value);
}

function minlength(value, arg) {
    return value && value.length && value.length >= +arg;
}

function maxlength(value, arg) {
    return value && value.length && value.length <= +arg;
}

function length(value) {
    return value && value.length == +arg;
}

function min(value, arg) {
    return value >= +arg;
}

function max(value, arg) {
    return value <= +arg;
}

function pattern(value, arg) {
    var match = arg.match(new RegExp('^/(.*?)/([gimy]*)$'));
    var regex = new RegExp(match[1], match[2]);
    return regex.test(value);
}


var types = Object.freeze({
	required: required,
	numeric: numeric,
	integer: integer,
	float: float,
	alpha: alpha,
	alphanum: alphanum,
	email: email,
	url: url,
	minlength: minlength,
	maxlength: maxlength,
	length: length,
	min: min,
	max: max,
	pattern: pattern
});

/**
 * Validator for input validation.
 */

var Validator = {

    dirs: [],

    types: types,

    add: function add(dir) {
        this.dirs.push(dir);
    },

    remove: function remove(dir) {
        pull(this.dirs, dir);
    },

    instance: function instance(el) {

        do {

            if (el._validator) {
                return el._validator;
            }

            el = el.parentElement;

        } while (el);

    },

    validate: function validate(el, submit) {
        var this$1 = this;


        var validator = this.instance(el), results = {valid: true};

        if (!validator) {
            return;
        }

        this.dirs.forEach(function (dir) {

            var valid = dir.validate(), el = dir.el, name = dir.name;

            if (this$1.instance(el) !== validator) {
                return;
            }

            if (!el._touched && submit) {
                el._touched = true;
            }

            if (!el._touched && !valid) {
                valid = true;
                results.valid = false;
            }

            if (!results[name]) {
                results[name] = {
                    valid: true,
                    invalid: false,
                    dirty: el._dirty,
                    touched: el._touched
                };
            }

            results[name][dir.type] = !valid;

            if (submit && results.valid && !valid) {
                el.focus();
            }

            if (results[name].valid && !valid) {
                results[name].valid = false;
                results[name].invalid = true;
                results.valid = false;
            }

        });

        results.invalid = !results.valid;

        validator.results(results);

        if (submit && results.invalid) {
            trigger(validator.el, 'invalid');
        }

        return results.valid;
    }

};

function Filter(fn) {
    return function (e) {
        e.preventDefault();

        if (Validator.validate(e.target, true)) {
            fn(e);
        }
    };
}

var Directive = {

    bind: function bind() {

        var self = this, name = this.arg || this.expression;

        this.name = camelize(name);
        this.el._validator = this;

        this.vm.$set(this.name);
        this.vm.$on('hook:compiled', function () {
            Validator.validate(self.el);
        });
    },

    unbind: function unbind() {
        this.vm.$delete(this.name);
    },

    results: function results(results$1) {
        this.vm.$set(this.name, assign({
            validate: this.validate.bind(this)
        }, results$1));
    },

    validate: function validate() {
        return Validator.validate(this.el, true);
    }

};

/**
 * Validate directive.
 */

var Validate = {

    priority: 500,

    bind: function bind() {

        var name = attr(this.el, 'name');

        if (!name) {
            return;
        }

        this.name = camelize(name);
        this.type = this.arg;
        this.value = this.el.value;

        this.el._dirty = false;
        this.el._touched = false;

        on(this.el, 'blur', this.listener.bind(this));
        on(this.el, 'input', this.listener.bind(this));

        Validator.add(this);
    },

    unbind: function unbind() {

        off(this.el, 'blur', this.listener);
        off(this.el, 'input', this.listener);

        Validator.remove(this);
    },

    update: function update(value) {
        this.args = value;
    },

    listener: function listener(e) {

        if (related.target && (related.target.tagName === 'A' || related.target.tagName === 'BUTTON')) {
            return;
        }

        if (e.type == 'blur') {
            this.el._touched = true;
        }

        if (this.el.value != this.value) {
            this.el._dirty = true;
        }

        Validator.validate(this.el);
    },

    validate: function validate() {

        var validator = this.validator();

        if (validator) {
            return validator.call(this.vm, this.el.value, this.args);
        }
    },

    validator: function validator() {
        var this$1 = this;


        var vm = this.vm, validators;

        do {

            validators = vm.$options.validators || {};

            if (validators[this$1.type]) {
                return validators[this$1.type];
            }

            vm = vm.$parent;

        } while (vm);

        return Validator.types[this.type];
    }

};

//  RelatedTarget property dose not work in Safari, IE & Firefox
var related = {
    target: null,
    handler: function handler (ref) {
        var target = ref.target;

        related.target = target;
        setTimeout(function () { return related.target = null; }, 0);
    }
};

on(document, 'mousedown', related.handler);
on(document, 'pointerdown', related.handler);
on(document, 'touchstart', related.handler);

/**
 * Install plugin.
 */

function plugin(Vue) {

    if (plugin.installed) {
        return;
    }

    Util(Vue);

    Vue.fields = fields;
    Vue.component('fields', Fields(Vue));

    Vue.validator = Validator;
    Vue.filter('valid', Filter);
    Vue.directive('validator', Directive);
    Vue.directive('validate', Validate);
    Vue.vueForm = {
        useLegacyCode: parseInt(Vue.version) === 1
    };
    if(Vue.vueForm.useLegacyCode) {
        console.warn('vue-form runs in legacy Vue 1.x mode');
    }



    Vue.config.optionMergeStrategies.fields = Vue.config.optionMergeStrategies.props;

}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
}

module.exports = plugin;
