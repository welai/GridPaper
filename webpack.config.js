const path = require('path');

function generateConfig(name) {
  var uglify = name.indexOf('min') > -1;
  var config = {
    mode:   'development',
    entry:  './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: name + '.js',
      sourceMapFilename: name + '.map',
      library: 'gridpaper',
      libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
      rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }]
    }
  };
  config.optimization = {};
  if(uglify) {
    config.optimization.minimize = true;
    config.mode = 'production';
  }
  return config;
}

module.exports = ['gridpaper', 'gridpaper.min'].map((name) => generateConfig(name));

