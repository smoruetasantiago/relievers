'use strict';

const Room = require('./room');
const WaitingQueue = require('./waiting-queue');
const RoomSensor = require('./sensor');

const http = require('http');
const server = http.createServer(handleWebRequest);
const WebSocketServer = require('websocket').server;
const wsServer = new WebSocketServer({
    httpServer: server
});
const PythonShell = require('python-shell');
let pyShell;

let roomSensor;
let rooms;
let queueOfPeople = new WaitingQueue();

(function initializeEverything() {
    pyShell = new PythonShell('server/poller.py');
    pyShell.on('message', (message) => {
        const isSensorOpen = message === '0';

        roomSensor = new RoomSensor(isSensorOpen);
        rooms = [
            new Room('room1', 'Left room', isSensorOpen),
            new Room('room2', 'Right room', true)
        ];
    });
    pyShell.end((err) => {
        if (err) throw err;
    });
})();

function handleWebRequest(request, response) {
    if (request.url.indexOf('doors/status') !== -1 ) {
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(getDoorsStatus()));
    } else if (request.url.indexOf('book') !== -1 ) {
        queueOfPeople.addWaiter();
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(queueOfPeople.getQueue()));
    } else if (request.url.indexOf('ban') !== -1 ) {
        const roomId = request.url.match('ban?room=(\w+)')[1];

        setAvoidRoom(roomId);
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(true));
    }
    response.end();
}

function getMessageHandler(message) {
    switch (message.utf8Data) {
        case 'get-doors-status':
            return getDoorStatusHandler;
            break;
        case 'add-to-queue':
            return addToQueueHandler;
            break;
        case 'get-waiting-queue':
            return getQueueHandler;
            break;
        default:
            return function () {}
            break;
    }
}

function getDoorsStatus() {
    let result = rooms.map((room) => {
        return room.getJson()
    });

    return result;
}

function setAvoidRoom(idRoom) {
    const room = idRoom === 'room1' ? 0 : 1;

    rooms[room].setAvoidAtAnyCost();
}

/** Handlers **/

function getDoorStatusHandler(connection) {
    connection.send(JSON.stringify({
        message: 'get-doors-status',
        doors_status: getDoorsStatus()
    }));
}

function addToQueueHandler(connection) {
    queueOfPeople.addWaiter();
    connection.send(JSON.stringify({
        message: 'add-to-queue',
        queue: queueOfPeople.getQueue()
    }));
}

function getQueueHandler(connection) {
    connection.send(JSON.stringify({
        message: 'get-waiting-queue',
        queue: queueOfPeople.getQueue()
    }));
}

/** End Handlers **/

wsServer.on('request', (r) => {
    const connection = r.accept();

    setInterval(() => {
        pyShell = new PythonShell('server/poller.py');
        pyShell.on('message', (message) => {
            let shouldSendMessage = true;
            const isSensorOpen = message === '0';
            const sensorChanged = roomSensor.updateOpenStatus(isSensorOpen);
            let result = {
                message: 'get-doors-status'
            };

            if (sensorChanged) {
                rooms[0].toggleOccupationStatus();

                if (rooms[0].isFree()) {
                    result.current_turn = queueOfPeople.next();
                }
            } else shouldSendMessage = false;

            if (shouldSendMessage) {
                result.doors_status = getDoorsStatus();

                connection.send(JSON.stringify(result));
            }
        });
        pyShell.end((err) => {
            if (err) throw err;
        });
    }, 1000);
   
    connection.on('message', (message) => {
        getMessageHandler(message)(connection);
    });
});

server.listen(3000, () => {
    console.log((new Date()) + ' Server is listening on port 3000');
});
