define(["require", "exports", "timerImpl"], function (require, exports, timerImpl_1) {
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
            this.timer = new timerImpl_1.TimerImpl(0, totalTime);
            this.timer.addEventListener("tick", (e) => this.onTimerTick(e.detail.time, e.detail.executionDuration));
        }
        onTimerTick(currentTime, executionDuration) {
            console.log("Tick " + currentTime);
            this.currentEpisodeNumber++;
            let newQlearnerStep = this.qLearningSteps[this.currentEpisodeNumber];
            this.visualizer.onQLearningStep(newQlearnerStep, currentTime, executionDuration);
        }
        initialize(visualizer) {
            this.currentEpisodeNumber = -1;
            this.visualizer = visualizer;
            let that = this;
            this.visualizer.setInitialValuesOnMap(this.startState.id, this.finishState.id, this.totalTime, this.qLearningSteps.length);
            this.visualizer.addEventListener("playerStarted", function (e) {
                that.play(e.detail);
            });
            this.visualizer.addEventListener("playerStopped", function () {
                that.stop();
            });
            this.visualizer.addEventListener("playerPaused", function () {
                that.pause();
            });
            this.visualizer.addEventListener("playerStartedForOneStep", function (e) {
                that.startForOneStep(e.detail);
            });
        }
        play(speed) {
            this.timer.play(speed);
        }
        stop() {
            this.timer.stop();
        }
        pause() {
            this.timer.pause();
        }
        startForOneStep(speed) {
            this.timer.playOneTick(speed);
        }
    }
    exports.PlayerImpl = PlayerImpl;
});
//# sourceMappingURL=playerImpl.js.map