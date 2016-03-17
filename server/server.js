'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();

server.connection({ port: 3000 });

const io = require('socket.io')(server.listener);

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Send a POST request to /sensor-status');
    }
});

server.route({
    method: 'GET',
    path: '/sensor-status',
    handler: function (request, reply) {
        reply(true);
    }
});

io.on('connection', (socket) => {
    socket.emit('Oh hii!');

    socket.on('burp', function () {
        socket.emit('Excuse you!');
    });
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});