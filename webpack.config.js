const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.svg$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'assets',
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/assets', to: 'assets' }
            ]
        }),
        new webpack.DefinePlugin({
            'process.env.WS_HOST': JSON.stringify(process.env.WS_HOST || ''),
            'process.env.WS_PORT': JSON.stringify(process.env.WS_PORT || ''),
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        host: '0.0.0.0',
        port: 8094,
    }
};
