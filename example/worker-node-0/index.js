
console.log('worker-node-0', Math.random())

export default function(log) {
  log('worker-node-0', Math.random() * 100)
}
