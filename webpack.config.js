
var $path = require("path");

module.exports = {
    mode: "production",

    devtool: "source-map",

    entry: {
        index: ["core-js/stable", "regenerator-runtime/runtime", "./index.js"]
    },

    output: {
        path: $path.join(__dirname, "dist"),
        publicPath: "dist/",
        filename: "[name].js",
        chunkFilename: "[name].js"
    },

    externals: function (context, request, callback) {
        if (/xlsx|canvg|pdfmake/.test(request)) {
            return callback(null, "commonjs " + request);
        }
        callback();
    },

    module: {
        rules: [{
            test: /.js$/,
            include: /node_modules/,
            use: {
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env"],
                    plugins: ["@babel/plugin-syntax-dynamic-import"]
                }
            }
        }, {
            test: /.js$/,
            use: ["source-map-loader"],
            enforce: "pre"
        }]
    }
};