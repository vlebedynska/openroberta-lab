import {Clock, RunningState} from "./models";

export class ClockImpl implements Clock{
    runningState: RunningState;
    speed: number;

}