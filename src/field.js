import {each, warn, assign, isObject, isUndefined} from './util';

export default {

    name: 'field',

    props: ['field'],//, 'class'],

    data() {
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

        filteredOptions() {
            return this.filterOptions(this.$data.options);
        },
        attributes: {

            get() {

                if (this.enable && !this.$parent.evaluate(this.enable)) {
                    return assign({disabled: 'true'}, this.attrs);
                }

                return this.attrs;
            },


        },

        value: {

            get() {

                var value = this.$parent.getField(this);

                if (isUndefined(value) && !isUndefined(this.default)) {

                    value = this.default;

                    if (value) {
                        this.$parent.setField(this, value);
                    }
                }

                return value;
            },

            set(value) {

                if (!isUndefined(this.value) || value) {
                    this.$parent.setField(this, value, this.value);
                }

            },

        }

    },

    methods: {

        filterOptions(options) {
            var opts = [];

            if (!options) {
                warn(`Invalid options provided for ${this.name}`);
                return opts;
            }

            each(options, (value, name) => {
                if (isObject(value)) {
                    opts.push({label: name, options: this.filterOptions(value)});
                } else {
                    opts.push({text: name, value: value});
                }
            });

            return opts;
        }

    }


};
