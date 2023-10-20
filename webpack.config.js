var path = require('path');
var webpack = require('webpack');
var NgAnnotatePlugin = require('ng-annotate-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

function getOutputFileName(env) {
    var addHash = env.production || env.staging;
    return `js/[name]${addHash ? '.[chunkhash]' : ''}.js`;
}

function getServerApiUrl(env) {
    if (env.production) {
        return '"https://searchlightdata.org/"';
    } else if (env.staging) {
        return '"https://staging.searchlightdata.org/"';
    } else {
        return '"http://localhost/"';
    }
}

var nodeModulesPath = path.resolve(__dirname, "node_modules/");
var srcPath = path.resolve(__dirname, "src/");
var appPath = path.resolve(srcPath, "app/");

module.exports = function (env) {
    return {
        context: srcPath,
        entry: {
            app: './app/index.module.js'
        },
        resolve: {
          extensions: ['.ts', '.tsx', '.js', '.json']
        },
        module: {
            rules: [
            // Plain typescript for react helper functions, etc
            {
                test: /\.ts$/,
                include: srcPath,
                loader: 'ts-loader'
            },
            // Typescript with XML for React components
            {
                test: /\.tsx$/,
                include: srcPath,
                loader: 'ts-loader'
            },
            {
                test: /\.js$/,
                include: srcPath,
                enforce: 'pre',
                loader: 'jshint-loader'
            },
            {
                test: /\.js$/,
                // Run babel on all of our stuff and also some problematic ES6-only modules
                include: [srcPath, nodeModulesPath],
                exclude: function(modulePath) {
                  return (
                    /node_modules/.test(modulePath) &&
                    !/node_modules\\@floating-ui/.test(modulePath)
                  );
                },
                loader: 'babel-loader'
            },
            // Needed for react date picker
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.html$/,
                include: appPath,
                use: [{
                    loader: 'ngtemplate-loader?relativeTo=/src/app/'
                },
                {
                    loader: 'html-loader'
                }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    'less-loader'
                ]
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=100000&minetype=application/font-woff&publicPath=assets/&outputPath=/assets/'
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?/,
                loader: 'url-loader?limit=100000&minetype=application/font-woff&publicPath=assets/&outputPath=/assets/'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=100000&minetype=application/octet-stream&publicPath=assets/&outputPath=/assets/'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader?publicPath=assets/&outputPath=/assets/'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=100000&minetype=image/svg+xml&publicPath=assets/&outputPath=/assets/'
            }
            ]
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
                API_URL: getServerApiUrl(env)
            }),
            new NgAnnotatePlugin(),
            new CopyWebpackPlugin([{
                from: 'assets/images/',
                to: 'assets/images/'
            },
            {
                from: 'favicon.ico'
            }
            ]),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: (module) => {
                    return module.context && module.context.indexOf('node_modules') !== -1;
                }
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
                minChunks: Infinity
            }),
            new HtmlWebpackPlugin({
                template: 'index.html'
            })
        ],

        devServer: {
            port: 3000
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            publicPath: "/",
            filename: getOutputFileName(env)
        }
    };
};