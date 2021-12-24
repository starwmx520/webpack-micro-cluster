module.exports = function isDevServerRunning() {
  return process.env.NODE_ENV !== 'production'
}
