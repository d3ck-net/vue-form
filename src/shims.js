import {forEach} from 'lodash';

export default {
    methods:
        {


            getFromPath(path, currentScope) {

                let keys = path.split('.');

                forEach(keys, (key) => {
                    if (typeof currentScope === 'undefined') {
                        return false;
                    }
                    currentScope = currentScope[key];
                });

                return currentScope;

            },

            setFromPath(path, value, currentScope) {

                let keys = path.split('.');

                let lastKey = keys.splice(keys.length - 1, 1)[0];

                forEach(keys, (key) => {

                    if (typeof currentScope[key] === 'undefined') {
                        this.$set(currentScope,key,{});
                    }
                    currentScope = currentScope[key];
                });

                this.$set(currentScope,lastKey,value);

                // currentScope[lastKey] = value;

            }
        }
}

