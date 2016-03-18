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
                vm.defineGameClickEvent();
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
            
            defineGameClickEvent: function () {
                var gameList = [document.getElementsByClassName("game-button")[0], document.getElementsByClassName("closeBtn")[0]];
                gameList.forEach(function(elem){
                    
                    
                    return (function(ele) {
                        ele.addEventListener("click", function() {
                            var gamePanel = document.getElementById("game-panel");
                            gamePanel.classList.toggle('active');
                        });
                    })(elem)   
                });
            },
        
            handleMessage: function (event) {
                switch (event.message) {
                    case 'get-doors-status':
                        vm.updateUiRoomStatus(event.doors_status);
                        vm.updateQueueIfNecessary(event);
                        break;
                    case 'add-to-queue':
                        vm.updateQueue(event.queue);
                        break;
                    case 'get-waiting-queue':
                        vm.updateUIQueue(event.queue);
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

            updateQueueIfNecessary: function (event) {
                var luckyGuy = document.getElementById('lucky-guy');
                var queue = document.getElementsByClassName('queue')[0];
                var isAnyRoomFree = event.doors_status.reduce(function (isFree, room) {
                    return isFree || room.available;
                }, false);

                if (event.current_turn) {
                    luckyGuy.innerHTML = event.current_turn;
                    queue.removeChild(queue.firstChild);
                }
            },

            updateQueue: function (queue) {
                var currentTurn = document.getElementById('current-turn');
                var luckyGuy = document.getElementById('lucky-guy');

                vm.yourTurn = queue[queue.length - 1];
                vm.updateUIQueue(queue);
                currentTurn.classList.remove('hidden');
            },

            updateUIQueue: function (queue) {
                var queueList = '';

                if (queue.length) {
                    document.getElementById('current-turn').classList.remove('hidden');
                    // queue.shift();
                    queue.forEach(function(queueNumber) {
                        queueList += '<li>' + queueNumber + '</li>';
                    });

                    document.getElementsByClassName('queue')[0].innerHTML = queueList;
                }
            }
        };

		vm.initialize();
	};
	return revieversDashBoard(); 
})();