'use strict';

const http = require('http');
const server = http.createServer();
const WebSocketServer = require('websocket').server;
const wsServer = new WebSocketServer({
    httpServer: server
});

let doorStatus = [false, false];
let queueOfPeople = [];
let automaticChanges = true;

function maybeChangeDoorValue() {
	let random = Math.random();
	let doorToChange;

	if (random < 0.5) {
		// We change one of the doors status
		random = Math.random();

		doorToChange = random < 0.5 ? 0 : 1;
		doorStatus[doorToChange] = !doorStatus[doorToChange];
	}
	// else We keep everything as it is now
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

function getDoorStatus(connection) {
    connection.send(JSON.stringify(getReturningData()));
}

function addToQueue(connection, message) {
	const currentTurn = queueOfPeople.length + 1;
	
	queueOfPeople.push(currentTurn);
	connection.send(JSON.stringify(queueOfPeople));
}

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

wsServer.on('request', (r) => {
    const connection = r.accept();
    const randomChanges = setInterval(() => {
    	if (automaticChanges) {
	    	maybeChangeDoorValue();
	    	connection.send(JSON.stringify(getReturningData()));
	    }
    }, 10000);
   
    connection.on('message', (message) => {
    	getMessageHandler(message)(connection, message);
	});
});

server.listen(3000, () => {
    console.log((new Date()) + ' Server is listening on port 3000');
});