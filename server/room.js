class Room {
	constructor(id, name) {
		this.id = id;
		this.name = name;
		this.isAvailable = true;
	}

	get isFree() {
		return isAvailable;
	}

	occupy() {
		this.isAvailable = false;
	}
}

export Room;