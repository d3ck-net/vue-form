const path = require('path');
const webpack = require('webpack');

function NoStrict(){}

//removes the "use strict"; calls from generated source
NoStrict.prototype.apply = function (compiler) {
    compiler.plugin('emit', function(compilation /* Manipulates webpack internal instance specific data. */, callback) {

        let source = compilation.assets['vue-form.js'].children[0].source();

        let noStrict = source.replace(new RegExp('"use strict";','g'),"");

        compilation.assets['vue-form.no-strict.js'] = {
            source:function(){
                return noStrict;
            },
            size:function () {
                return noStrict.length
            }
        }
        callback();
    });
}

let rules = [
    {
        test: /\.html$/,
        use: 'vue-html-loader'
    }
];

let browser = {
    entry: './src/index.js',
    module: {
        rules: rules
    },
    output:
        {
            path: path.resolve(__dirname, 'dist'),
            filename: 'vue-form.js'
        },
    devtool: "source-map",
    plugins: [new NoStrict()]
};

let es6 = {
    entry: './src/index.js',
    module: {
        rules: rules
    },
    output:
        {
            path: path.resolve(__dirname, 'dist'),
            filename: 'vue-form.common.js',
            libraryTarget: "umd"
        }
};

module.exports = [browser, es6];