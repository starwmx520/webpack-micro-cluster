
 module.exports = class WorkerEntriesGenerator {
  constructor() {
    this.cache = []
    this.content = ''
  }

  has(name) {
    return this.cache.indexOf(name) > -1
  }

  add(name) {
    if (!this.has(name)) {
      this.cache.push(name)
      return this.toString()
    }
    return undefined
  }

  remove(name) {
    if (this.has(name)) {
      this.cache = this.cache.filter(a => a !== name)
      return this.toString()
    }
    return undefined
  }

  getVFName(name) {
    return `./_${name}.http`
  }
  getName(name){
    return `./_${name}.http`
  }

  toString() {
    this.content = this.cache.map(name => `require("${this.getName(name)}")`).join('\n')
    return this.content
  }

  get() {
    return this.content
  }
}
