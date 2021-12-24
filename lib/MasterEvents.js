
const EventEmitter = require('events')
const ipc = require('node-ipc')

module.exports = class MasterEvents extends EventEmitter {
  constructor(id) {
    super()
    ipc.config.id = id
    ipc.config.retry = 1000
    ipc.config.silent = true

    ipc.serve(() => {
      ipc.server.on('message', data => this.emit('message', data))
    })

    ipc.server.start()
  }
}
