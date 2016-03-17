'use strict';

const http = require('http');
const server = http.createServer(handleWebRequest);
const WebSocketServer = require('websocket').server;
const Room = require('./room');
const WaitingQueue = require('./waiting-queue');
const wsServer = new WebSocketServer({
    httpServer: server
});

let rooms = [new Room('room1', 'Left room'), new Room('room2', 'Right room')];
let queueOfPeople = new WaitingQueue();
let automaticChanges = true;

function handleWebRequest(request, response) {
    if (request.url.indexOf('doors/status') !== -1 ) {
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(getDoorStatus()));
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

function getDoorStatus() {
    return [{
        id: 'room1',
        name: 'Left room',
        available: rooms[0].isFree()
    },
    {
        id: 'room2',
        name: 'Right room',
        available: rooms[1].isFree()
    }];
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
        door_status: getDoorStatus()
    }));
}

function addToQueueHandler(connection, message) {
    queueOfPeople.addWaiter();
    connection.send(JSON.stringify(queueOfPeople.getQueue()));
}

/** End Handlers **/

wsServer.on('request', (r) => {
    const connection = r.accept();
    const randomChanges = setInterval(() => {
        if (automaticChanges) {
            let changedRoom = getChangedRoom();

            if (typeof changedRoom === 'number') {
                let response = {
                    door_status: getDoorStatus()
                };

                if (rooms[changedRoom].isFree()) {
                    response.current_turn = queueOfPeople.next();
                    response.queue = queueOfPeople.getQueue();
                }

                connection.send(JSON.stringify(response));
            }
        }
    }, 5000);
   
    connection.on('message', (message) => {
        getMessageHandler(message)(connection, message);
    });
});

server.listen(3000, () => {
    console.log((new Date()) + ' Server is listening on port 3000');
});