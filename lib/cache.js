const nodeCache = require('node-cache')

const stdTTL = 100
const cache = new nodeCache({stdTTL})

module.exports = cache