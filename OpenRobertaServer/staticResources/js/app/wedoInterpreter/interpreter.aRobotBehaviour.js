define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ARobotBehaviour {
        constructor() {
            this.hardwareState = {};
            this.hardwareState.timers = {};
            this.hardwareState.timers['start'] = Date.now();
            this.hardwareState.actions = {};
            this.hardwareState.sensors = {};
            this.neuralNetwork = {};
            this.blocking = false;
        }
        getActionState(actionType, resetState = false) {
            let v = this.hardwareState.actions[actionType];
            if (resetState) {
                delete this.hardwareState.actions[actionType];
            }
            return v;
        }
        setBlocking(value) {
            this.blocking = value;
        }
        getBlocking() {
            return this.blocking;
        }
    }
    exports.ARobotBehaviour = ARobotBehaviour;
});
