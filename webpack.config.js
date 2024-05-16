const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html' // исходный файл HTML
        })
    ],
    devServer: {
        contentBase: './dist', // путь к разрабатываемому контенту
        host: '0.0.0.0',
        port: 8094,
    }
};