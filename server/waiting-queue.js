'use strict';

class WaitingQueue {
	constructor() {
		this.queue = [];
	}

	getQueue() {
		return this.queue;
	}

	addWaiter() {
		let lastWaiter;

		if (!this.queue.length) {
			lastWaiter = 0;
		} else lastWaiter = this.queue[this.queue.length - 1];

		this.queue.push(lastWaiter + 1);
	}

	next() {
		return this.queue.shift();
	}
}

module.exports = WaitingQueue;
