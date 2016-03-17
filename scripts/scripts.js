(function() {
	var revieversDashBoard = function() {
		var vm =  this;
		//initialize flow
		vm.initialize = function (argument) {
			vm.openWebSocketConnection();
			vm.defineBookClickEvent();
		};

		vm.openWebSocketConnection = function () {
			var ws = new WebSocket('ws://localhost:3000');

			ws.onmessage = (function (event) {
				var self = this;
				self.roomsJson = JSON.parse(event.data);
				self.updateUiRoomStatus();
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
		        ws.send(true);
		        if (typeof callback !== 'undefined') {
		          callback();
		        }
		    }, 1000);

		};

		vm.updateUiRoomStatus = function() {
			vm.roomsJson.forEach(function (room){
				var currentRoom = document.getElementById(room.id);
				currentRoom.className = room.available ? "room available" : "room";
				currentRoom.getElementsByClassName("status")[0].innerHTML = room.available ? "available" : "busy";
			});
		};

		vm.defineBookClickEvent = function (argument) {
			document.getElementById("book").addEventListener("click", function(e) {
				debugger;
			});
		};

		vm.initialize();
		
	};

	return revieversDashBoard(); 
})();