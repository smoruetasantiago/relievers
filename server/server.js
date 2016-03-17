'use strict';

const http = require('http');
const server = http.createServer();
const WebSocketServer = require('websocket').server;
const wsServer = new WebSocketServer({
    httpServer: server
});

let doorStatus = [false, false]; // false = free / true = busy
let queueOfPeople = [];
let automaticChanges = true;

function getMessageHandler(message) {
    switch (message.utf8Data) {
        case 'get-doors-status':
            return getDoorStatus;
            break;
        case 'add-to-queue':
            return addToQueue;
            break;
        default:
            return function () {}
            break;
    }
}

function getReturningData() {
    return [{
        id: 'room1',
        name: 'Left room',
        available: doorStatus[0]
    },
    {
        id: 'room2',
        name: 'Right room',
        available: doorStatus[1]
    }];
}

function hasSomethingChanged() {
    let somethingChanged = false;
    let random = Math.random();
    let doorToChange;

    if (random < 0.5) {
        somethingChanged = true;
        // We change one of the doors status
        random = Math.random();

        doorToChange = random < 0.5 ? 0 : 1;
        doorStatus[doorToChange] = !doorStatus[doorToChange];
    }
    // else We keep everything as it is now
    
    return somethingChanged;
}

/** Handlers **/

function getDoorStatus(connection) {
    connection.send(JSON.stringify(getReturningData()));
}

function addToQueue(connection, message) {
    const currentTurn = queueOfPeople.length + 1;
    
    queueOfPeople.push(currentTurn);
    connection.send(JSON.stringify(queueOfPeople));
}

/** End Handlers **/

wsServer.on('request', (r) => {
    const connection = r.accept();
    const randomChanges = setInterval(() => {
        if (automaticChanges) {
            if(hasSomethingChanged()) {
                connection.send(JSON.stringify(getReturningData()));
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