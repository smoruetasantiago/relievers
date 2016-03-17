(function() {
	var revieversDashBoard = function() {
		var vm =  this,
			roomsJson = [];

		vm.ws = new WebSocket('ws://localhost:3000');

		//initialize flow
		vm.initialize = function (argument) {
			vm.openWebSocketConnection("get-doors-status");
			vm.defineBookClickEvent();
		};

		vm.openWebSocketConnection = function (action) {

			vm.ws.onmessage = (function (event) {
				var self = this;
				if (action === "get-doors-status") {
					self.roomsJson = JSON.parse(event.data)["door_status"];
					//self.queue = self.roomsJson.queue;
					self.updateUiRoomStatus();
				} else {
					self.queue = JSON.parse(event.data);				
					self.updateQueue();
					action = "get-doors-status"; 
				}
			}).bind(vm);

		    this.waitForConnection = function (callback, interval) {
			    if (ws.readyState === 1) {
			        callback();
			    } else {
			        var that = this;
			        // optional: implement backoff for interval here
			        setTimeout(function () {
			            that.waitForConnection(callback, interval);
			        }, interval);
			    }
			};

			this.waitForConnection(function () {
		        vm.ws.send(action);
		        if (typeof callback !== 'undefined') {
		          callback();
		        }
		    }, 1000);

		};
		vm.openWebSocketConnection("get-doors-status");

		vm.updateUiRoomStatus = function() {
			
			vm.roomsJson.forEach(function (room){
				var currentRoom = document.getElementById(room.id);
				currentRoom.className = room.available ? "room available" : "room";
				currentRoom.getElementsByClassName("status")[0].innerHTML = room.available ? "available" : "busy";
			});
		};

		vm.updateQueue = function() {
			vm.yourTurn = vm.queue[vm.queue.length - 1];
			vm.queueList = "";
			
			vm.queue.forEach(function(queueNumber) {
				var self = this;

				this.queueList += "<li>" + queueNumber + "</li>";
			}.bind(vm));

			document.getElementsByClassName("queue")[0].innerHTML = vm.queueList;
		};

		vm.defineBookClickEvent = function (argument) {
			document.getElementById("book").addEventListener("click", function(e) {
				vm.openWebSocketConnection("add-to-queue");
			});
		};

		vm.initialize();
		
	};
	return revieversDashBoard(); 
})();