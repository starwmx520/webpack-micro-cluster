
module.exports = function isDevServerRunning() {
  return process.env.WEBPACK_DEV_SERVER === 'true'
}
