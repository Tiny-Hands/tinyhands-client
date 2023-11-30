'use strict';

var path = require('path');
var webpack = require('webpack');
var NgAnnotatePlugin = require('ng-annotate-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var nodeModulesPath = path.resolve(__dirname, "node_modules/");
var srcPath = path.resolve(__dirname, 'src/');
var appPath = path.resolve(srcPath, 'app/');

function generateWebpackConfig() {
    return {
        files: ['test.webpack.js'],

        singleRun: false,

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['PhantomJS'],

        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-webpack',
        ],
        preprocessors: {
            'test.webpack.js': ['webpack'],
        },
        webpack: {
            context: __dirname + '/src',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        // Run babel on all of our stuff and also some problematic ES6-only modules
                        include: [srcPath, nodeModulesPath],
                        exclude: function(modulePath) {
                            return (
                                /node_modules/.test(modulePath) &&
                                !/node_modules\\@auth0/.test(modulePath)
                            );
                        },
                        loader: 'babel-loader',
                    },
                    {
                        test: /\.html$/,
                        include: appPath,
                        use: [
                            { loader: 'ngtemplate-loader?relativeTo=/src/app/' },
                            { loader: 'html-loader' },
                        ],
                    },
                    {
                        test: /\.less$/,
                        loader: 'null-loader',
                    },
                ],
            },
            plugins: [
                new webpack.ProvidePlugin({
                    '_': 'lodash',
                    '$': 'jquery',
                    'jQuery': 'jquery',
                    'window.jQuery': 'jquery',
                    'moment': 'moment',
                    'window.moment': 'moment',
                }),
                new webpack.DefinePlugin({
                    API_URL: '"http://localhost/"',
                }),
                new NgAnnotatePlugin(),
                new HtmlWebpackPlugin({
                    template: 'index.html',
                }),
            ],
            output: {
                path: path.resolve(__dirname, './build'),
                publicPath: '/',
                filename: 'js/bundle.js',
            },
        },

        webpackMiddleware: {
            noInfo: true,
        },
    };
}

module.exports = function(config) {
    config.set(generateWebpackConfig());
};

