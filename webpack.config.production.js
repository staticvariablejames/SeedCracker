const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        'main': './src/main.ts',
        'seed-cracker.worker': './src/seed-cracker.worker.ts',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
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
