
const path = require('path')
const Worker = require('../../').Worker

module.exports = {
  entry: {
    index: './index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    libraryTarget: 'assign',
    libraryExport: 'default',
    library: ['__WORKERS__', 'worker2']
  },
  devServer: {},
  plugins: [
    new Worker({
      masterId: 'demo',
      workerId: 'worker2',
      entry: 'index'
    })
  ]
}
