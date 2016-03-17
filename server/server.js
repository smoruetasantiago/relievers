'use strict';

const http = require('http');
const server = http.createServer(handleWebRequest);
const WebSocketServer = require('websocket').server;
const wsServer = new WebSocketServer({
    httpServer: server
});

let doorStatus = [false, false]; // false = free / true = busy
let queueOfPeople = [];
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

function getDoorStatusHandler(connection) {
    connection.send(JSON.stringify(getDoorStatus()));
}

function addToQueueHandler(connection, message) {
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
                connection.send(JSON.stringify(getDoorStatus()));
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