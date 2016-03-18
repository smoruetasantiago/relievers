(function() {
    // var WEBSOCKET_URL = 'ws://localhost:3000';
    var WEBSOCKET_URL = 'ws://192.168.181.232:3000';

	var revieversDashBoard = function() {
        var vm = {
            ws: null,
            queue: [],
            yourTurn: null,
            queueList: null,
            
            initialize: function () {
                vm.defineBookClickEvent();
                ws = new WebSocket(WEBSOCKET_URL);

                ws.onmessage = function (event) {
                    vm.handleMessage(JSON.parse(event.data));
                };

                var getInitialData = setInterval(function () {
                    if (ws.readyState === 1) {
                        clearInterval(getInitialData);
                        ws.send('get-doors-status');
                    }
                }, 500);
            },

            defineBookClickEvent: function () {
                document.getElementById("book").addEventListener("click", function() {
                    ws.send('add-to-queue');
                });
            },

            handleMessage: function (event) {
                debugger;
                switch (event.message) {
                    case 'get-doors-status':
                        vm.updateUiRoomStatus(event.doors_status);
                        break;
                    case 'add-to-queue':
                        break;
                }
            },

            updateUiRoomStatus: function (rooms) {
                rooms.forEach(function (room) {
                    var currentRoom = document.getElementById(room.id);
                    currentRoom.className = room.available ? "room available" : "room";
                    currentRoom.getElementsByClassName("status")[0].innerHTML = room.available ? "available" : "busy";
                });
            },

            updateQueue: function () {
                vm.yourTurn = vm.queue[vm.queue.length - 1];
                vm.queueList = "";
                
                vm.queue.forEach(function(queueNumber) {
                    var self = vm;

                    vm.queueList += "<li>" + queueNumber + "</li>";
                });

                document.getElementsByClassName("queue")[0].innerHTML = this.queueList;
            }
        };

		// vm.openWebSocketConnection = function (action) {

		// 	vm.ws.onmessage = (function (event) {
		// 		var self = this;
		// 		if (action === "get-doors-status") {
		// 			self.roomsJson = JSON.parse(event.data)["door_status"];
		// 			//self.queue = self.roomsJson.queue;
		// 			self.updateUiRoomStatus();
		// 		} else {
		// 			self.queue = JSON.parse(event.data);				
		// 			self.updateQueue();
		// 			action = "get-doors-status"; 
		// 		}
		// 	}).bind(vm);

		//     this.waitForConnection = function (callback, interval) {
		// 	    if (ws.readyState === 1) {
		// 	        callback();
		// 	    } else {
		// 	        var that = this;
		// 	        // optional: implement backoff for interval here
		// 	        setTimeout(function () {
		// 	            that.waitForConnection(callback, interval);
		// 	        }, interval);
		// 	    }
		// 	};

		// 	this.waitForConnection(function () {
		//         vm.ws.send(action);
		//         if (typeof callback !== 'undefined') {
		//           callback();
		//         }
		//     }, 1000);

		// };

		vm.initialize();
	};
	return revieversDashBoard(); 
})();