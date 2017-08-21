var path = require('path');
 var webpack = require('webpack');
 module.exports = {
   // use the following for redux saga.
   // entry: './js/mainWithSaga.js',
   entry: './js/main.js',
     output: {
         path: path.resolve(__dirname, 'build'),
         filename: 'app.bundle.js'
     },
     module: {
         loaders: [
             {
                 test: /\.js$/,
                 loader: 'babel-loader',
                 query: {
                     presets: ['react']
                 }
             }
         ]
     },
     stats: {
         colors: true
     },
     devtool: 'source-map'
 };
