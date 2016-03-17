'use strict';

class Room {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.isAvailable = true;
    }

    isFree() {
        return this.isAvailable;
    }

    free() {
        this.isAvailable = true;
    }

    occupy() {
        this.isAvailable = false;
    }

    toggleOccupationStatus() {
        if (this.isFree()) this.occupy();
        else this.free();
    }
}

module.exports = Room;