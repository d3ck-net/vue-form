const path = require('path');

module.exports = {
    entry: './src/index.js',
    module:{rules:[
        {
            test: /\.html$/,
            use: 'vue-html-loader'
        }
    ]},
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'built.js'
    }
};