define(["require", "exports", "svgdotjs", "jquery", "interpreter.aiNeuralNetworkModule/source/aiNeuralNetworkUI", "interpreter.aiNeuralNetworkModule/source/aiNeuralNetwork", "interpreter.aiNeuralNetworkModule/source/node"], function (require, exports, SVG, $, aiNeuralNetworkUI_1, aiNeuralNetwork_1, node_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AiNeuralNetworkModule {
        constructor(selector, size, ...layers) {
            this._aiNeuralNetwork = null;
            this._aiNeuralNetworkUI = null;
            $(selector).html('');
            this.svg = SVG.SVG().addTo(selector).size(size.width, size.height);
            let layersWithNormalizedNodes = this.normalizeNodes(...layers);
            this._aiNeuralNetwork = this.createNeuralNetwork(...layersWithNormalizedNodes);
            this._aiNeuralNetworkUI = new aiNeuralNetworkUI_1.AiNeuralNetworkUI(this.aiNeuralNetwork, this.svg);
        }
        createNeuralNetwork(...layers) {
            if (this._aiNeuralNetwork != null) {
                return;
            }
            return aiNeuralNetwork_1.AiNeuralNetworkImpl.createNeuralNetwork(layers);
        }
        calculateNeuralNetworkOutput() {
            this.aiNeuralNetwork.calculateNeuralNetworkOutput();
        }
        normalizeNodes(...layers) {
            let layersWithNormalizedNodes = new Array();
            for (let layer of layers) {
                let normalizedNodes = new Array();
                for (let nodeOld of layer) {
                    let node = new node_1.NodeImpl(nodeOld.value, nodeOld.threshold, nodeOld.port, nodeOld.type);
                    node.name = nodeOld.name;
                    normalizedNodes.push(node);
                }
                layersWithNormalizedNodes.push(normalizedNodes);
            }
            return layersWithNormalizedNodes;
        }
        get aiNeuralNetwork() {
            if (this._aiNeuralNetwork != null) {
                return this._aiNeuralNetwork;
            }
            else {
                return null;
            }
        }
        get aiNeuralNetworkUI() {
            return this._aiNeuralNetworkUI;
        }
    }
    exports.AiNeuralNetworkModule = AiNeuralNetworkModule;
});
