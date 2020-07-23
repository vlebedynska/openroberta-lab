import * as SVG from "svgdotjs";
import * as $ from "jquery";
import {AiNeuralNetworkUI} from "interpreter.aiNeuralNetworkModule/source/aiNeuralNetworkUI";
import {AiNeuralNetwork} from "interpreter.aiNeuralNetworkModule/source/models";
import {AiNeuralNetworkImpl} from "interpreter.aiNeuralNetworkModule/source/aiNeuralNetwork";
import {Node} from "interpreter.aiNeuralNetworkModule/source/models";
import {NodeImpl} from "interpreter.aiNeuralNetworkModule/source/node";


export class AiNeuralNetworkModule {

    private svg: SVG.Svg;
    private readonly _aiNeuralNetwork: AiNeuralNetwork = null;
    private readonly _aiNeuralNetworkUI: AiNeuralNetworkUI = null;

    public constructor(selector: string, size: {width: number, height: number}, ...layers: Array<Array<Node>> ) {
        $(selector).html('');
        this.svg = SVG.SVG().addTo(selector).size(size.width, size.height);
        let layersWithNormalizedNodes = this.normalizeNodes(...layers);
        this._aiNeuralNetwork = this.createNeuralNetwork(...layersWithNormalizedNodes);
        this._aiNeuralNetworkUI = new AiNeuralNetworkUI(this.aiNeuralNetwork, this.svg);
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
                let node: Node = new NodeImpl(nodeOld.value, nodeOld.threshold, nodeOld.port, nodeOld.type);
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


}




















