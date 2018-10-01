import path from 'path';
import webpack from 'webpack';

const config: webpack.Configuration = {
    mode: 'development',
    entry: './src/index.ts',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        path: path.resolve(__dirname, 'doc/js'),
        filename: 'index.js'
    }
};

export default config;
