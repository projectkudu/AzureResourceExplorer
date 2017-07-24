const path = require("path");
const webpack = require("webpack");
//module.exports = {
//    entry: ".\\tsout\\manage.js",
//    output: {
//        path: path.resolve(__dirname, "dist"),
//        filename: "bundle.js"
//    }
//};

module.exports = {
    entry: ".\\ng\\manage.ts", 
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
//                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ]
};