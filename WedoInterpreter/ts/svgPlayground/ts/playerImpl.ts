import {Action, Player, ProblemState, QLearningStep} from "./models";
import {TimerImpl} from "timerImpl";
import {QLearningView} from "qLearnerView"

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
    view: QLearningView;


    constructor(qLearningSteps: Array<QLearningStep>, totalTime: number, totalNumberOfEpisodes: number, startFinishStates: Action) {
        super();
        this.qLearningSteps = qLearningSteps;
        this.totalTime = totalTime;
        this.totalNumberOfEpisodes = totalNumberOfEpisodes;
        this.startState = startFinishStates.startState;
        this.finishState = startFinishStates.finishState;
        this.timer = new TimerImpl(10, totalTime); //FIXME speed anpassen
        this.timer.addEventListener("tick", (e) => this.onTimerTick((<CustomEvent<number>>e).detail) )
    }

    play() {
        this.timer.play();
    }

    onTimerTick(currentTime: number) {
        console.log("Tick " + currentTime);
        this.currentEpisodeNumber++;
        let newQlearnerStep = this.qLearningSteps[this.currentEpisodeNumber]
        let eventData = {
            newQlearnerStep: this.qLearningSteps[this.currentEpisodeNumber],
            currentTime: currentTime
        }
        this.dispatchEvent(new CustomEvent("newQlearnerStep", {
            detail: eventData
        }));
    }
    initialize(): void {
        this.currentEpisodeNumber = -1;
        this.view = new QLearningView({ich: "bin"});
        this.view.eventDispatcher.addEventListener("playerStarted", this.play);
        this.addEventListener("newQlearnerStep", (e) => this.view.onQLearningStep((<CustomEvent<{QLearningStep, number}>>e).detail))
    }





}