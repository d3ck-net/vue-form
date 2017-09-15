import Field from './field';
import template from './templates/default.html';
import {each, warn, assign, isArray, isObject, isString} from './util';
import shims from './shims';

export default function (Vue) {

    return {

        name: 'fields',

        mixins:[shims],
        props: {

            config: {
                type: [Array, Object],
                default() {
                    return [];
                }
            },

            values: {
                type: Object
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

                components[name] = type;
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

                return this.getFromPath(field.key,this.values);//this.values[field.key];//this.$get(`values${field.key}`);
            },

            setField(field, value, prev) {

                if (this.values instanceof Vue && 'setField' in this.values) {
                    this.values.setField(field, value, prev);
                } else {

                    this.setFromPath(field.key,value,this.values);

                    // this.$set(this.values, field.key, value)//`values${field.key}`, value);
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
    text: '<input type="text" v-bind="attrs" v-model="value">',
    textarea: '<textarea v-bind="attrs" v-model="value"></textarea>',
    radio: `<template v-for="option in filteredOptions">
                    <input type="radio" v-bind="attrs" :name="name" :value="option.value" v-model="value"> <label>{{ option.text }}</label>
                 </template>`,
    checkbox: '<input type="checkbox" v-bind="attrs" v-model="value">',
    selectah: `<select v-bind="attrs" v-model="value">
                     <template v-for="option in filteredOptions">
                         <optgroup :label="option.label" v-if="option.label">
                             <option v-for="opt in option.options" :value="opt.value">{{ opt.text }}</option>
                         </optgroup>
                         <option :value="option.value" v-else>{{ option.text }}</option>
                     </template>
                 </select>`,
    range: '<input type="range" v-bind="attrs" v-model="value">',
    number: '<input type="number" v-bind="attrs" v-model="value">'
};
