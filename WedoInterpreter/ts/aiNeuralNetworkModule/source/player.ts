import {Visualizer} from "interpreter.svgPlayground/ts/visualizer";
import {AiNeuralNetworkUI} from "interpreter.aiNeuralNetworkModule/source/aiNeuralNetworkUI";

export class Player extends EventTarget {


    private _isPlaying: boolean;
    private readonly _aiNeuralNetworkUI: AiNeuralNetworkUI;

    constructor(aiNeuralNetworkUI: AiNeuralNetworkUI) {
        super();
        this._aiNeuralNetworkUI = aiNeuralNetworkUI;
        this._isPlaying = false;
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


    get isPlaying(): boolean {
        return this._isPlaying;
    }

    set isPlaying(value: boolean) {
        this._isPlaying = value;
    }

}