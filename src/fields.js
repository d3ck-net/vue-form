import Field from './field';
import template from './templates/default.html';
import {each, warn, assign, isArray, isObject, isString} from './util';
import shims from './shims';

export default function (Vue) {

    return {

        name: 'fields',

        mixins: [shims],
        props: {

            config: {
                type: [Array, Object],
                default() {
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

        created() {

            var {fields, components} = this.$options;

            if (!this.fields || !this.values) {
                warn('Invalid config or model provided');
                return;
            }

            each(assign({}, Vue.fields, fields), (type, name) => {

                if (isString(type)) {
                    type = {template: type};
                }

                if (isObject(type)) {
                    type.name = type.name || `field-${name}`;
                    type = Vue.extend(Field).extend(type);
                }

                if (!Vue.vueForm.useLegacyCode && !this.prefix && Vue.config.isReservedTag(name)) {
                    throw ('field type: "' + name + '" is a reserved HTML tag name in Vue 2.x');
                }
                components[this.prefix + name] = type;
            });

        },

        computed: {

            fields() {
                return this.filterFields(this.config);
            }

        },

        methods: {

            getField(field) {

                if (this.values instanceof Vue && 'getField' in this.values) {
                    return this.values.getField(field);
                }


                return this.getFromPath(field.name, this.values);//


            },

            setField(field, value, prev) {

                if (this.values instanceof Vue && 'setField' in this.values) {
                    this.values.setField(field, value, prev);
                } else {


                    this.setFromPath(field.name, value, this.values);


                }

            },

            filterFields(config) {

                var arr = isArray(config), fields = [];

                each(config, (field, name) => {

                    if (!isString(field.name) && !arr) {
                        field.name = name;
                    }

                    if (!isString(field.type)) {
                        field.type = 'text';
                    }

                    if (isString(field.name)) {

                        if (!field.show || this.evaluate(field.show)) {
                            fields.push(field);
                        }

                    } else {
                        warn(`Field name missing ${JSON.stringify(field)}`);
                    }

                });

                return fields;
            },

            evaluate(expr, data) {

                data = data || this.values;

                if (isString(expr)) {

                    var comp = new Vue({data});
                    var result = comp.$eval(expr);

                    comp.$destroy();

                    return result;
                }

                return expr.call(this, data, this);
            }

        },

        fields: {},

        components: {},

        template

    };

};

export var fields = {
    text: '<input type="text" v-bind="attributes" v-model="value">',
    textarea: '<textarea v-bind="attributes" v-model="value"></textarea>',
    radio: `<template v-for="option in filteredOptions">
                    <input type="radio" v-bind="attributes" :name="name" :value="option.value" v-model="value"> <label>{{ option.text }}</label>
                 </template>`,
    checkbox: '<input type="checkbox" v-bind="attributes" v-model="value">',
    select: `<select v-bind="attributes" v-model="value">
                     <template v-for="option in filteredOptions">
                         <optgroup :label="option.label" v-if="option.label">
                             <option v-for="opt in option.options" :value="opt.value">{{ opt.text }}</option>
                         </optgroup>
                         <option :value="option.value" v-else>{{ option.text }}</option>
                     </template>
                 </select>`,
    range: '<input type="range" v-bind="attributes" v-model="value">',
    number: '<input type="number" v-bind="attributes" v-model="value">'
};
