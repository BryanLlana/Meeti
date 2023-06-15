import path from 'path'
import webpack from 'webpack'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export default {
  entry: './public/js/app.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, './public/dist')
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
