import {Action, Player, ProblemState, QLearningStep} from "./models";
import {TimerImpl} from "./timerImpl";
import {Visualizer} from "./visualizer";

export class PlayerImpl extends EventTarget implements Player{
    currentEpisodeNumber: number;
    currentTime: number;
    finishState: ProblemState;
    optimalPath: Array<ProblemState>;
    startState: ProblemState;
    totalNumberOfEpisodes: number;
    totalTime: number;
    qLearningSteps: Array<QLearningStep>;
    timer: TimerImpl;
    visualizer: Visualizer;


    constructor(qLearningSteps: Array<QLearningStep>, totalTime: number, totalNumberOfEpisodes: number, startFinishStates: Action) {
        super();
        this.qLearningSteps = qLearningSteps;
        this.totalTime = totalTime;
        this.totalNumberOfEpisodes = totalNumberOfEpisodes;
        this.startState = startFinishStates.startState;
        this.finishState = startFinishStates.finishState;
        this.timer = new TimerImpl(0, totalTime);
        this.timer.addEventListener("tick", (e) => this.onTimerTick((<CustomEvent<number>>e).detail) )
    }


    onTimerTick(currentTime: number) {
        console.log("Tick " + currentTime);
        this.currentEpisodeNumber++;
        let newQlearnerStep: QLearningStep = this.qLearningSteps[this.currentEpisodeNumber]
        this.visualizer.onQLearningStep(newQlearnerStep, currentTime, this.qLearningSteps.length);
    }

    initialize(visualizer: Visualizer): void {
        this.currentEpisodeNumber = -1;
        this.visualizer = visualizer;
        let that = this;
        this.visualizer.addEventListener("playerStarted", function (e: CustomEvent<number>) {
            that.play(e.detail)
        });
        this.visualizer.addEventListener("playerStopped", function () {
            that.stop();
        })
        this.visualizer.addEventListener("playerPaused", function () {
            that.pause();
        })
    }

    private play(speed: number) {
        this.timer.play(speed);
    }

    private stop() {
        this.timer.stop();
    }

    private pause() {
        this.timer.pause();
    }
}