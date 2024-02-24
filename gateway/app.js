"use strict";

const path = require("node:path");
const AutoLoad = require("@fastify/autoload");
const proxy = require("@fastify/http-proxy");

// Pass --options via CLI arguments in command to enable these options.
const options = {};

module.exports = async function (fastify, opts) {
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });

  fastify.register(proxy, {
    upstream: "http://127.0.0.1:3002",
    prefix: "/api/accounts",
    rewritePrefix: "/accounts",
    preHandler: async function (request, reply) {
      await fastify.authenticate(request, reply);
      request.headers["x-user-id"] = String(request.user.id);
    },
  });
  fastify.register(proxy, {
    upstream: "http://127.0.0.1:3000",
    prefix: "/links",
    rewritePrefix: "/links",
    preHandler: async function (request, reply) {
      await fastify.authenticate(request, reply);
      request.headers["x-user-id"] = String(request.user.id);
    },
  });
  fastify.register(proxy, {
    upstream: "http://127.0.0.1:3000",
    prefix: "/",
  });
};

module.exports.options = options;
