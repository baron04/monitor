const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  context: process.cwd(),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'monitor.js',
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.get('/success', (req, res) => {
        res.json({ id: 1 });
      });
      devServer.app.post('/error', (req, res) => {
        res.sendStatus(500);
      });

      return middlewares;
    }
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './src/index.html',
      inject: 'head',
      scriptLoading: 'blocking',
    }),
  ],
};
