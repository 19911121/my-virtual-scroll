const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const buildPagePaths = './src';
const globPattern = `${buildPagePaths}/**/*.ts`;
const entries = {};
const htmls = [];

const init = function() {
  const pageRegex = new RegExp(`${buildPagePaths}/?`, 'g');
  let filesPath = glob.sync(globPattern, {});

  filesPath.forEach((filePath) => {
    const filePathInfo = path.parse(filePath);
    const pageParentPath = `${filePathInfo.dir.replace(pageRegex, '')}`;
    const pagePath = `${pageParentPath}${'' === pageParentPath ? '' : '/'}${filePathInfo.name}`;

    entries[pagePath] = {
      import: filePath,
    };

    htmls.push(new HtmlWebpackPlugin({
      hash : true,
      filename : `${pagePath}.html`,
      chunks : [pagePath],
      template: `./src/${pagePath}.html`
    }),);
  });
};

init();

module.exports = {
  entry: entries,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    ...htmls
  ],
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};
