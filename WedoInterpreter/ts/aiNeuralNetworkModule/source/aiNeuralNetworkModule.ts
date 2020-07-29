import * as SVG from "svgdotjs";
import * as $ from "jquery";
import {AiNeuralNetworkUI} from "interpreter.aiNeuralNetworkModule/source/aiNeuralNetworkUI";
import {AiNeuralNetwork} from "interpreter.aiNeuralNetworkModule/source/models";
import {AiNeuralNetworkImpl} from "interpreter.aiNeuralNetworkModule/source/aiNeuralNetwork";
import {Node} from "interpreter.aiNeuralNetworkModule/source/models";
import {NodeImpl} from "interpreter.aiNeuralNetworkModule/source/node";
import {Player} from "interpreter.aiNeuralNetworkModule/source/player";


export class AiNeuralNetworkModule {

    private svg: SVG.Svg;
    private readonly _aiNeuralNetwork: AiNeuralNetwork = null;
    private readonly _aiNeuralNetworkUI: AiNeuralNetworkUI = null;
    private readonly _player: Player = null;

    public constructor(selector: string, ...layers: Array<Array<Node>> ) {
        $(selector).html('');
        this.svg = SVG.SVG().addTo(selector);
        let layersWithNormalizedNodes = this.normalizeNodes(...layers);
        this._aiNeuralNetwork = this.createNeuralNetwork(...layersWithNormalizedNodes);
        this._aiNeuralNetworkUI = new AiNeuralNetworkUI(this.aiNeuralNetwork, this.svg);
        this.svg.addClass("svgViewBoxNNModule").viewbox(this.svg.bbox());
        this._player = new Player(this.aiNeuralNetworkUI);
    }



    private createNeuralNetwork(... layers: Array<Array<Node>>): AiNeuralNetwork {
        if (this._aiNeuralNetwork != null) {
            return;
        }
        return AiNeuralNetworkImpl.createNeuralNetwork(layers);
    }

    public calculateNeuralNetworkOutput() {
        this.aiNeuralNetwork.calculateNeuralNetworkOutput();
    }

    public normalizeNodes(...layers: Array<Array<Node>>): Array<Array<Node>> {
        let layersWithNormalizedNodes: Array<Array<Node>> = new Array<Array<Node>>();
        for (let layer of layers) {
            let normalizedNodes: Array<Node> = new Array<Node>();
            for (let nodeOld of layer) {
                let node: Node = new NodeImpl(nodeOld.value, nodeOld.threshold, nodeOld.port, nodeOld.type, nodeOld.color, nodeOld.duration, nodeOld.frequency);
                node.name = nodeOld.name;
                normalizedNodes.push(node);
            }
            layersWithNormalizedNodes.push(normalizedNodes);
        }
        return layersWithNormalizedNodes;
    }


    get aiNeuralNetwork(): AiNeuralNetwork {
        if (this._aiNeuralNetwork != null) {
            return this._aiNeuralNetwork;
        } else {
            return null;
        }
    }

    get aiNeuralNetworkUI(): AiNeuralNetworkUI {
        return this._aiNeuralNetworkUI;
    }


    get player(): Player {
        return this._player;
    }



}




















