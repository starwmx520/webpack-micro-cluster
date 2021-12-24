const InjectPlugin = require('webpack-inject-plugin').default
const exitHook = require('async-exit-hook')
const WorkerEvents = require('./WorkerEvents')
const isDevServerRunning = require('./helpers/is-webpack-dev-server-running')
const path = require('path')
const PLUGIN_NAME = 'WebpackMicroClusterWorkerPlugin'

module.exports = class WorkerPlugin {
  constructor(options) {
    this.options = Object.assign({ entry: 'index' }, options)
  }

  apply(compiler) {

    let injectedContent
    if (isDevServerRunning()) {

      const { workerId, entry, masterId } = this.options
      const devServer = compiler.options.devServer
      const { port, host } = devServer
      const __WPP__ = `http://${host}:${port}${devServer.publicPath || '/'}`
      const url = `${__WPP__}MyLibrary.${entry}.js`
      // injectedContent = `window.__webpack_public_path__='${__WPP__}';console.log("fda");`

      const workerEvents = new WorkerEvents(workerId, masterId)
      let __MESSAGE = null

      workerEvents.on('online', () => {
        if (__MESSAGE) workerEvents.send({ command: 'UPDATE', data: __MESSAGE })
      })

      // at `Ctrl + C` , send `CLOSE` event to Master node
      exitHook(() => {
        console.log('----__MESSAGEexitHook', __MESSAGE)
        if (__MESSAGE) workerEvents.send({ command: 'CLOSE', data: __MESSAGE })
      })
      //https://webpack.docschina.org/api/compilation-object/
      compiler.hooks.done.tap(PLUGIN_NAME, (context) => {

        const stats = context.compilation.getStats().toJson()
        if (!stats.entrypoints[entry]) {
          throw new Error('No entry was found:' + entry)
        }
        const assets = stats.entrypoints[entry].assets
        const _p = assets.find((d) => path.extname(d.name) === '.js').name
        __MESSAGE = { url: __WPP__ + _p, workerId }
        console.log('----__MESSAGE', __MESSAGE)
        workerEvents.send({ command: 'UPDATE', data: __MESSAGE })
      })
    }

    // new InjectPlugin(() => injectedContent).apply(compiler)
  }
}
