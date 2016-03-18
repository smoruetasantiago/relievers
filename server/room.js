'use strict';

class Room {
    constructor(id, name, isFree) {
        this.id = id;
        this.name = name;
        this.isAvailable = isFree;
        this.isInQuarantine = false;
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

    setAvoidAtAnyCost() {
        this.isInQuarantine = true;
    }

    getJson() {
        return {
            id: this.id,
            name: this.name,
            available: this.isAvailable,
            inQuarantine: this.inQuarantine
        }
    }
}

module.exports = Room;