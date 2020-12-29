const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/main.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'eval-source-map',
    devServer: {
        publicPath: '/dist/',
        watchContentBase: true,
    },
    module: {
        rules: [
            { test: /.ts$/, use: 'ts-loader', exclude: /node_modules/ },
        ]
    },
    resolve: {
        extensions: ['.js', '.ts'],
    },
}
