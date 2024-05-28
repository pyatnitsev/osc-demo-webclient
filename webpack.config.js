const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/app.js', // точка входа вашего приложения
    output: {
        path: path.resolve(__dirname, 'dist'), // путь к каталогу выходных файлов
        filename: 'bundle.js' // название создаваемого файла
    },
    module: {
        rules: [
            {
                test: /\.js$/, // регулярное выражение для файлов .js
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'] // используйте пресеты babel
                    }
                }
            },
            {
                test: /\.css$/, // регулярное выражение для файлов .css
                use: ['style-loader', 'css-loader'] // добавление style-loader и css-loader
            },
            {
                test: /\.(png|jpe?g|gif)$/, // регулярное выражение для файлов изображений
                use: ['file-loader'] // использование file-loader
            },
            {
                test: /\.svg$/, // регулярное выражение для файлов .svg
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]', // сохраняет оригинальное имя файла и расширение
                        outputPath: 'assets', // путь для копирования файлов
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html' // исходный файл HTML
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/assets', to: 'assets' } // копирование папки assets в dist/assets
            ]
        })
    ],
    devServer: {
        contentBase: './dist', // путь к разрабатываемому контенту
        host: '0.0.0.0',
        port: 8094,
    }
};