
console.log('worker-node-2', Math.random())

export default function(log) {
  log('worker-node-2', Math.random() * 1000000)
}
