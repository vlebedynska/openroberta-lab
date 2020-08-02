define(["require", "exports", "models"], function (require, exports, models_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TimerImpl extends EventTarget {
        constructor(speed, time) {
            super();
            this._runningState = models_1.RunningState.STOP;
            this._speed = speed;
            this._time = time;
            this.isRunning = false;
        }
        callTick(force) {
            let that = this;
            if (this.isRunning && !force) {
                return;
            }
            this.isRunning = true;
            this.tick();
            this.interval = setTimeout(function () {
                if (that._runningState == models_1.RunningState.PLAY) {
                    that.callTick(true);
                }
                else {
                    that.isRunning = false;
                }
            }, 1000 / that._speed);
        }
        tick() {
            if (this._time > 0) {
                this._time--;
                console.log("tick " + this._time);
                this.createAndDispatchEvent("tick");
            }
            else {
                this.stop();
            }
        }
        stop() {
            if (this.updateRunningState(models_1.RunningState.STOP)) {
                this._time = 0;
                this.createAndDispatchEvent("stop");
            }
        }
        pause() {
            if (this._runningState == models_1.RunningState.STOP) {
                console.log("Pause not called because the current running state is already stop.");
                return;
            }
            if (this.updateRunningState(models_1.RunningState.PAUSE)) {
                this.createAndDispatchEvent("pause");
            }
        }
        playOneTick(speed) {
            this.play(speed);
            this.pause();
        }
        play(speed) {
            let previousSpeed = this._speed;
            if (previousSpeed != speed) {
                this._speed = speed;
                console.log("Update speed " + previousSpeed + " > " + speed);
            }
            if (this.updateRunningState(models_1.RunningState.PLAY)) {
                this.callTick();
                this.createAndDispatchEvent("play");
            }
        }
        updateRunningState(runningState) {
            let previousState = this._runningState;
            if (this._runningState == runningState) {
                console.log(this._runningState + " is already active.");
                return false;
            }
            this._runningState = runningState;
            console.log("Updated state " + models_1.RunningState[previousState] + " > " + models_1.RunningState[runningState] + ".");
            return true;
        }
        createAndDispatchEvent(typeArg) {
            this.dispatchEvent(new CustomEvent(typeArg, {
                detail: {
                    'time': this.time,
                    'executionDuration': 1000 / this._speed
                }
            }));
        }
        get runningState() {
            return this._runningState;
        }
        set speed(value) {
            this._speed = value;
        }
        get speed() {
            return this._speed;
        }
        get time() {
            return this._time;
        }
    }
    exports.TimerImpl = TimerImpl;
});
//# sourceMappingURL=timerImpl.js.map