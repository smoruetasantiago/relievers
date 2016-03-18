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
let rooms = [new Room('room1', 'Left room'), new Room('room2', 'Right room')];
let queueOfPeople = new WaitingQueue();
let automaticChanges = false;

function handleWebRequest(request, response) {
    if (request.url.indexOf('doors/status') !== -1 ) {
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(getDoorsStatus()));
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
        default:
            return function () {}
            break;
    }
}

function getDoorsStatus() {
    var result = rooms.map((room) => {
        return room.getJson()
    });

    return result;
}

function getChangedRoom() {
    let random = Math.random();
    let roomToChange;

    if (random < 0.5) {
        // We change one of the doors status
        random = Math.random();

        roomToChange = random < 0.5 ? 0 : 1;
        rooms[roomToChange].toggleOccupationStatus();
    }
    // else We keep everything as it is now
    
    return roomToChange;
}

/** Handlers **/

function getDoorStatusHandler(connection) {
    connection.send(JSON.stringify({
        message: 'get-doors-status',
        door_status: getDoorsStatus()
    }));
}

function addToQueueHandler(connection, message) {
    queueOfPeople.addWaiter();
    connection.send(JSON.stringify({
        message: 'add-to-queue',
        queue: queueOfPeople.getQueue()
    }));
}

/** End Handlers **/

wsServer.on('request', (r) => {
    const connection = r.accept();
    const randomChanges = setInterval(() => {
        if (automaticChanges) {
            let changedRoom = getChangedRoom();

            if (typeof changedRoom === 'number') {
                let response = {
                    door_status: getDoorsStatus()
                };

                if (rooms[changedRoom].isFree()) {
                    response.current_turn = queueOfPeople.next();
                    response.queue = queueOfPeople.getQueue();
                }

                connection.send(JSON.stringify(response));
            }
        }
    }, 5000);

    setInterval(() => {
        pyShell = new PythonShell('server/poller.py');
        pyShell.on('message', (message) => {
            const isSensorOpen = message === '0';
            let shouldSendMessage = true;

            if (!roomSensor) {
                roomSensor = new RoomSensor(isSensorOpen);
            } else {
                const sensorChanged = roomSensor.updateOpenStatus();

                if (!sensorChanged) shouldSendMessage = false;
            }

            if (shouldSendMessage) {
                rooms[0].toggleOccupationStatus();
                connection.send(JSON.stringify({
                    message: 'get-doors-status',
                    doors_status: getDoorsStatus()
                }));
            }
        });
        pyShell.end((err) => {
            if (err) throw err;
        });
    }, 1000);
   
    connection.on('message', (message) => {
        getMessageHandler(message)(connection, message);
    });
});

server.listen(3000, () => {
    console.log((new Date()) + ' Server is listening on port 3000');
});
