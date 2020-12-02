const { override } = require("customize-cra");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const disableChunksAndHash = () => (config) => {
    // JS Overrides
    config.output.filename = "static/js/[name].js";
    config.output.chunkFilename = "static/js/[name].chunk.js";
    //change MiniCssExtractPlugin
    config.plugins = config.plugins.filter((p) => p.constructor.name !== "MiniCssExtractPlugin" && p.constructor.name !== "SplitChunksPlugin");
    config.plugins.push(
        new MiniCssExtractPlugin({
            filename: "static/css/[name].css",
            chunkFilename: "static/css/[name].chunk.css"
        })
    );
    config.optimization.splitChunks = false;
    config.optimization.runtimeChunk = false;

    return config;
};

module.exports = override(disableChunksAndHash());
