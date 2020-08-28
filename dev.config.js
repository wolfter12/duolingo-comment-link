const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const plugins = () => {
  const base = [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/icons"),
          to: path.resolve(__dirname, "duolingo-comment-link/icons"),
        },
        {
          from: path.resolve(__dirname, "src/html/popup.html"),
          to: path.resolve(__dirname, "duolingo-comment-link/"),
        },
        {
          from: path.resolve(__dirname, "src/css/style.css"),
          to: path.resolve(__dirname, "duolingo-comment-link/"),
        },
        {
          from: path.resolve(__dirname, "src/manifest.json"),
          to: path.resolve(__dirname, "duolingo-comment-link/"),
        },
      ],
    }),
    new MiniCssExtractPlugin(),
    new CleanWebpackPlugin(),
  ];
  return base;
};

const conf = {
  context: path.resolve(__dirname, "src/js"),
  mode: "development",
  devtool: "source-map",
  entry: {
    content: path.resolve(__dirname, "src/js/content.js"),
    background: path.resolve(__dirname, "src/js/background.js"),
    popup: [
      path.resolve(__dirname, "src/js/popup.js"),
      path.resolve(__dirname, "src/css/popup.css"),
    ],
  },
  output: {
    path: path.resolve(__dirname, "./duolingo-comment-link/"),
    filename: "[name].js",
    publicPath: "duolingo-comment-link/",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
        ],
      },
    ],
  },
  plugins: plugins(),

};

module.exports = conf;
