
console.log('worker-node-1', Math.random())

export default function(log) {
  log('worker-node-1', Math.random() * 10000)
}
