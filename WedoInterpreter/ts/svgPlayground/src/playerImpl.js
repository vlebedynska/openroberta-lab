define(["require", "exports", "timerImpl", "qLearnerView"], function (require, exports, timerImpl_1, qLearnerView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlayerImpl extends EventTarget {
        constructor(qLearningSteps, totalTime, totalNumberOfEpisodes, startFinishStates) {
            super();
            this.qLearningSteps = qLearningSteps;
            this.totalTime = totalTime;
            this.totalNumberOfEpisodes = totalNumberOfEpisodes;
            this.startState = startFinishStates.startState;
            this.finishState = startFinishStates.finishState;
            this.timer = new timerImpl_1.TimerImpl(10, totalTime); //FIXME speed anpassen
            this.timer.addEventListener("tick", (e) => this.onTimerTick(e.detail));
        }
        play() {
            this.timer.play();
        }
        onTimerTick(currentTime) {
            console.log("Tick " + currentTime);
            this.currentEpisodeNumber++;
            let newQlearnerStep = this.qLearningSteps[this.currentEpisodeNumber];
            let eventData = {
                newQlearnerStep: this.qLearningSteps[this.currentEpisodeNumber],
                currentTime: currentTime
            };
            this.dispatchEvent(new CustomEvent("newQlearnerStep", {
                detail: eventData
            }));
        }
        initialize() {
            this.currentEpisodeNumber = -1;
            this.view = new qLearnerView_1.QLearningView({ ich: "bin" });
            this.view.eventDispatcher.addEventListener("playerStarted", this.play);
            this.addEventListener("newQlearnerStep", (e) => this.view.onQLearningStep(e.detail));
        }
    }
    exports.PlayerImpl = PlayerImpl;
});
//# sourceMappingURL=playerImpl.js.map