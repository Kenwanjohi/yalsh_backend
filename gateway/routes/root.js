'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/health', async function (request, reply) {
    return { up: true }
  })
}
