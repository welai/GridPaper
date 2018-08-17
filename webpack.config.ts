import path from 'path';
import webpack from 'webpack';

const config: webpack.Configuration = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    }
};

export default config;