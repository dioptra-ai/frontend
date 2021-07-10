const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    devServer: {
        historyApiFallback: true
    },
    target: 'web',
    devtool: 'source-map',
    entry: './src/client/src/index.js',
    output: {
        path: path.resolve(__dirname, 'src/client/build'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    resolve: {
        modules: [path.join(__dirname, 'src', 'client', 'src'), 'node_modules'],
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
                        }]]
                    }
                }
            },
            {
                test: /\.s[ac]ss$/i,
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
        })
    ]
};
