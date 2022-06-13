const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    devServer: {
        proxy: {
            '/api': 'http://localhost:4004'
        },
        historyApiFallback: true
    },
    target: 'web',
    devtool: 'source-map',
    entry: './src/client/index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    resolve: {
        modules: [
            path.join(__dirname, 'src', 'client'),
            path.join(__dirname, 'src', 'server'),
            'node_modules'
        ],
        alias: {
            react: path.join(__dirname, 'node_modules', 'react')
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', ['@babel/preset-react', {
                            runtime: 'automatic'
                        }]],
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }
            },
            {
                test: /\.(sass|css|scss)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            // Prefer `dart-sass`
                            implementation: require('sass'),
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/client/public/index.html'
        }),
        new webpack.DefinePlugin({
            _WEBPACK_DEF_FLAG_DISABLE_REGISTER_: false,
            _WEBPACK_DEF_ENV_: JSON.stringify(process.env.NODE_ENV)
        })
    ]
};
