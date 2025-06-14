const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
    const isProd = argv.mode === 'production';

    return {
        entry: './src/app.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.[contenthash].js'
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
                    test: /\.(png|jpe?g|gif|svg)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[contenthash].[ext]',
                            outputPath: 'assets'
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
                    { from: 'src/assets', to: 'assets' },
                    { from: 'src/manifest.json', to: 'manifest.json' },
                    { from: 'src/service-worker.js', to: 'service-worker.js' }
                ]
            }),
            new webpack.DefinePlugin({
                'process.env.WS_HOST': JSON.stringify(process.env.WS_HOST || ''),
                'process.env.WS_PORT': JSON.stringify(process.env.WS_PORT || ''),
                'process.env.RESET_TIME': JSON.stringify(process.env.RESET_TIME || '0'),
                'process.env.LOGO_PRESS_TIME': JSON.stringify(process.env.LOGO_PRESS_TIME || '2000'),
                'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development')
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
};
