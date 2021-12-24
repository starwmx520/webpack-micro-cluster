const EventEmitter = require('events')
const path = require('path')
const fs = require('fs')
const ansicolors = require('ansi-colors')
const VirtualModulesPlugin = require('webpack-virtual-modules5')
const InjectPlugin = require('webpack-inject-plugin').default
const MasterEvents = require('./MasterEvents')
const WorkerEntriesGenerator = require('./WorkerEntriesGenerator')
const isDevServerRunning = require('./helpers/is-webpack-dev-server-running')
const PLUGIN_NAME = 'WebpackMicroClusterMasterPlugin'

module.exports = class MasterPlugin extends EventEmitter {
  constructor(options) {
    super()
    this.options = options
  }

  watch(compiler, virtualModules) {

    const workerEntries = new WorkerEntriesGenerator()
    compiler.hooks.compilation.tap(PLUGIN_NAME, () => {
      this.removeAllListeners('UPDATE').on('UPDATE', data => {
        const { workerId, url } = data
        workerEntries.add(workerId)
        virtualModules.writeModule(`${workerEntries.getVFName(workerId)}`, url)
        virtualModules.writeModule(this.getPathName(),
          workerEntries.get()
        )

      })
      this.removeAllListeners('CLOSE').on('CLOSE', data => {
        console.info(ansicolors.green('[WORKER::CLOSE]'), ansicolors.blue(data.url))
        const { workerId } = data
        workerEntries.remove(workerId)
        virtualModules.writeModule(`${workerEntries.getVFName(workerId)}`, '')
        virtualModules.writeModule(this.getPathName(), workerEntries.get())
      })
    })
  }


  getDevServerInjected() {
    return () => `require('${this.getPathName()}');`
  }
  getPathName() {
    return './_plugin.js'
  }
  apply(compiler) {
    const virtualModules = new VirtualModulesPlugin(
      { [this.getPathName()]: '' }
    )
    virtualModules.apply(compiler)
    if (this.options.injected && this.options.injected.length) {
      this.options.injected.forEach(injected =>
        new InjectPlugin(function () { return injected[0] }, injected[1] || {}).apply(compiler)
      )
    }
    if (isDevServerRunning()) {
      new InjectPlugin(this.getDevServerInjected(), { entryOrder: 3 }).apply(compiler)
      // new InjectPlugin(function () {
      //   return "let bb=require('./plugin.js');console.log(bb.foo);bb.init();"
      // }, {}).apply(compiler)
      this.watch(compiler, virtualModules)
      compiler.hooks.afterEmit.tap(PLUGIN_NAME, () => {
        const masterEvents = new MasterEvents(this.options.masterId)
        masterEvents.on('message', value => {
          console.log('----message', value)
          this.emit(value.command, value.data)
        })
      })
    }
  }
}
