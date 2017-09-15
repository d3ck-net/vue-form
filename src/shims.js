import {forEach} from 'lodash';

export default {
    methods:
        {


            getFromPath(path, currentScope) {

                let keys = path.split('.');

                for (var i = 0; i < keys.length; i++) {
                    let key = keys[i];

                    if (typeof currentScope === 'undefined') {
                        break;
                    }
                    currentScope = currentScope[key];
                }

                return currentScope;

            },

            setFromPath(path, value, currentScope) {

                let keys = path.split('.');

                while (keys.length > 1) {

                    let key = keys.shift();

                    if (typeof currentScope[key] === 'undefined') {
                        Vue.set(currentScope, key, {});
                    }
                    currentScope = currentScope[key];
                }

                Vue.set(currentScope, keys[0], value);


            }
        }
}

