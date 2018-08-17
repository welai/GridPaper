import path from 'path';
import webpack from 'webpack';

const config: webpack.Configuration = {
    mode: 'production',
    entry: './src/index.ts',
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        path: path.resolve(__dirname, 'doc/js'),
        filename: 'index.js'
    }
};

export default config;
