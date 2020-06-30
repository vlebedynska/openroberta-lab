import {Clock, RunningState} from "./models";

export class TimerImpl extends EventTarget implements Clock {


    private _runningState: RunningState;
    private _speed: number;
    private _time: number;
    private interval: NodeJS.Timeout;

    constructor(speed: number, time: number) {
        super();
        this._runningState = RunningState.STOP;
        this._speed = speed;
        this._time = time;
    }


    private callTick() {
        this.interval = setInterval(this.tick, 1000 / this._speed)
    }

    private tick() {
        if (this._time > 0) {
            this._time--;
            this.createAndDispatchEvent("tick");
        } else {
            this.stop();
        }
    }

    public stop() {
        this._time = 0;
        this.createAndDispatchEvent("stop");
        clearInterval(this.interval);
    }

    public pause() {
        this.createAndDispatchEvent("pause");
        clearInterval(this.interval);
    }

    public play() {
        this.callTick();
        this.createAndDispatchEvent("play");
    }


    private createAndDispatchEvent(typeArg: string) {
        this.dispatchEvent(new CustomEvent<number>(typeArg, {
            detail: this.time
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