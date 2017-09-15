import {each, warn, assign, isObject, isUndefined} from './util';

export default {

    name: 'field',

    props: ['field'],//, 'class'],

    data() {
        return assign({
            name: '',
            type: 'text',
            label: '',
            attributes: {},
            options: [],
            default: undefined
        }, this.field);
    },

    created() {



        this.key = this.name;//`["${this.name.replace(/\./g, '"]["')}"]`;

    },

    computed: {

        filteredOptions() {
            return this.filterOptions(this.$data.options);
        },
        attrs: {

            get() {

                if (this.enable && !this.$parent.evaluate(this.enable)) {
                    return assign({disabled: 'true'}, this.attributes);
                }

                return this.attributes;
            },
            set(attributes) {
                this.attributes = attributes;
            }

            // cache: false
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

            // cache: false
        }

    },

    methods: {

        filterOptions(options) {
            // debugger;
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

    // filters: {
    //
    //     options(options) {
    //         debugger;
    //         return this.filterOptions(options);
    //     }
    //
    // }

};
