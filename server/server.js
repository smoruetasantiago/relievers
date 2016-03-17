const http = require('http');
const server = http.createServer(function(request, response) {});
const WebSocketServer = require('websocket').server;
const wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', (r) => {
    const connection = r.accept();
   
    connection.on('message', (message) => {
    	const data = [{
    		id: 'room1',
            name: "Left room",
            status: false
        },
        {
            id: 'room2',
            name: "Right room",
            status: true        
        }];

    	connection.send(JSON.stringify(data));
	});
});

server.listen(3000, () => {
    console.log((new Date()) + ' Server is listening on port 3000');
});