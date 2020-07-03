define(["require", "exports", "./models"], function (require, exports, models_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TimerImpl extends EventTarget {
        constructor(speed, time) {
            super();
            this._runningState = models_1.RunningState.STOP;
            this._speed = speed;
            this._time = time;
        }
        callTick() {
            this.interval = setInterval(this.tick, 1000 / this._speed);
        }
        tick() {
            if (this._time > 0) {
                this._time--;
                this.createAndDispatchEvent("tick");
            }
            else {
                this.stop();
            }
        }
        stop() {
            this._time = 0;
            this.createAndDispatchEvent("stop");
            clearInterval(this.interval);
        }
        pause() {
            this.createAndDispatchEvent("pause");
            clearInterval(this.interval);
        }
        play() {
            this.callTick();
            this.createAndDispatchEvent("play");
        }
        createAndDispatchEvent(typeArg) {
            this.dispatchEvent(new CustomEvent(typeArg, {
                detail: this.time
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