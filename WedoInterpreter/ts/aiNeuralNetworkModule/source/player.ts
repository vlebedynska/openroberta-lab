import {Visualizer} from "interpreter.svgPlayground/ts/visualizer";
import {AiNeuralNetworkUI} from "interpreter.aiNeuralNetworkModule/source/aiNeuralNetworkUI";

export class Player extends EventTarget {


    private readonly _aiNeuralNetworkUI: AiNeuralNetworkUI;

    constructor(aiNeuralNetworkUI: AiNeuralNetworkUI) {
        super();
        this._aiNeuralNetworkUI = aiNeuralNetworkUI;
        this.initialize()
    }

    private initialize(): void {
        let that = this;
        this.aiNeuralNetworkUI.addEventListener("playerStarted", function () {
            that.play();
        });

        this.aiNeuralNetworkUI.addEventListener("playerPaused", function () {
            that.pause();
        });

    }

    private pause() {
        this.dispatchEvent(new CustomEvent<void>("pause"))
        console.log("Pause function is been called")
    }

    private play() {
        this.dispatchEvent(new CustomEvent<void>("play"))
        console.log("Play function is been called")
    }



    get aiNeuralNetworkUI(): AiNeuralNetworkUI {
        return this._aiNeuralNetworkUI;
    }

}