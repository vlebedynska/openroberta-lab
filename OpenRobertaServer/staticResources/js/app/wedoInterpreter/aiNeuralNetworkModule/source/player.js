define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Player extends EventTarget {
        constructor(aiNeuralNetworkUI) {
            super();
            this._aiNeuralNetworkUI = aiNeuralNetworkUI;
            this._isPlaying = false;
            this.initialize();
        }
        initialize() {
            let that = this;
            this.aiNeuralNetworkUI.addEventListener("playerStarted", function () {
                that.play();
            });
            this.aiNeuralNetworkUI.addEventListener("playerPaused", function () {
                that.pause();
            });
        }
        pause() {
            this.dispatchEvent(new CustomEvent("pause"));
            console.log("Pause function is been called");
        }
        play() {
            this.dispatchEvent(new CustomEvent("play"));
            console.log("Play function is been called");
        }
        get aiNeuralNetworkUI() {
            return this._aiNeuralNetworkUI;
        }
        get isPlaying() {
            return this._isPlaying;
        }
        set isPlaying(value) {
            this._isPlaying = value;
        }
    }
    exports.Player = Player;
});
