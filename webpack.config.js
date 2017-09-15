const path = require('path');

let browser = {
    entry: './src/index.js',
    module: {
        rules: [
            {
                test: /\.html$/,
                use: 'vue-html-loader'
            }
        ]
    },
    output:
        {
            path: path.resolve(__dirname, 'dist'),
            filename: 'vue-form.js'
        },
    devtool: "source-map"
};

let es6 = {
    entry: './src/index.js',
    module: {
        rules: [
            {
                test: /\.html$/,
                use: 'vue-html-loader'
            }
        ]
    },
    output:
        {
            path: path.resolve(__dirname, 'dist'),
            filename: 'vue-form.common.js',
            libraryTarget:"umd"
        }
};


module.exports = [browser,es6];