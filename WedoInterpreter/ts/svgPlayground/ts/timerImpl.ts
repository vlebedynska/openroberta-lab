import {Clock, RunningState} from "./models";

export class TimerImpl extends EventTarget implements Clock {


    private _runningState: RunningState;
    private _speed: number;
    private _time: number;
    private interval: NodeJS.Timeout;
    private isRunning: boolean;

    constructor(speed: number, time: number) {
        super();
        this._runningState = RunningState.STOP;
        this._speed = speed;
        this._time = time;
        this.isRunning = false;
    }


    private callTick(force?: boolean) {
        let that = this;
        if (this.isRunning && !force) {
            return;
        }
        this.isRunning = true;
        this.tick();
        this.interval = setTimeout(function () {
            if (that._runningState == RunningState.PLAY) {
                that.callTick(true);
            } else {
                that.isRunning = false;
            }
        }, 1000 / that._speed);
    }


    private tick() {
        if (this._time > 0) {
            this._time--;
            console.log("tick " + this._time);
            this.createAndDispatchEvent("tick");
        } else {
            this.stop();
        }
    }


    public stop() {
        if (this.updateRunningState(RunningState.STOP)) {
            this._time = 0;
            this.createAndDispatchEvent("stop");
        }
    }

    public pause() {
        if (this.updateRunningState(RunningState.PAUSE)) {
            this.createAndDispatchEvent("pause");
        }
    }

    public playOneTick(speed: number) {
        this.play(speed);
        this.pause();
    }

    public play(speed: number) {
        let previousSpeed = this._speed;
        if (previousSpeed != speed) {
            this._speed = speed;
            console.log("Update speed " + previousSpeed + " > " + speed);
        }
        if (this.updateRunningState(RunningState.PLAY)) {
            this.callTick();
            this.createAndDispatchEvent("play");
        }

    }


    private updateRunningState(runningState: RunningState): boolean {
        let previousState = this._runningState;
        if (this._runningState == runningState) {
            console.log(this._runningState + " is already active.");
            return false;
        }
        this._runningState = runningState;
        console.log("Updated state " + RunningState[previousState] + " > " + RunningState[runningState] + ".");
        return true;
    }


    private createAndDispatchEvent(typeArg: string) {
        this.dispatchEvent(new CustomEvent<{ time: number, executionDuration: number }>(typeArg, {
            detail: {
                'time': this.time,
                'executionDuration': 1000 / this._speed
            }
        }))
    }

    public get runningState(): RunningState {
        return this._runningState;
    }


    public set speed(value: number) {
        this._speed = value;
    }


    public get speed(): number {
        return this._speed;
    }

    get time(): number {
        return this._time;
    }

}