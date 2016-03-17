'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Send a POST request to /sensor-status');
    }
});

server.route({
    method: 'POST',
    path: '/sensor-status',
    handler: function (request, reply) {
        reply(true);
    }
});

