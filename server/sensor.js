'use strict';

class Sensor {
    constructor(initialStatus) {
        this.open = initialStatus;
    }

    updateOpenStatus(status) {
        let returnValue = false;

        if (this.open !== status) returnValue = true; // something changed!

        this.open = status;

        return returnValue;
    }
}

module.exports = Sensor;