const webpack = require('webpack');
const {merge} = require('webpack-merge');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/client/public/index.html'
        }),
        new webpack.DefinePlugin({
            _WEBPACK_DEF_FLAG_DISABLE_REGISTER_: true,
            _WEBPACK_DEF_TIMESERIES_ORG_ID_: JSON.stringify('foobar')
        })
    ]
});