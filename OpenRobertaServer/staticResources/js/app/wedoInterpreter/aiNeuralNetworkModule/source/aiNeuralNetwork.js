define(["require", "exports", "interpreter.aiNeuralNetworkModule/source/link"], function (require, exports, link_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AiNeuralNetworkImpl {
        constructor(layers, links) {
            this._layers = layers;
            this._links = links;
        }
        static createLinks(layers, weight = 0) {
            let links = [];
            for (let i = 0; i < layers.length - 1; i++) {
                let nodesFirstLayer = layers[i];
                let nodesSecondLayer = layers[i + 1];
                for (let node1Index in nodesFirstLayer) {
                    let node1 = nodesFirstLayer[node1Index];
                    for (let node2Index in nodesSecondLayer) {
                        let node2 = nodesSecondLayer[node2Index];
                        let link = new link_1.LinkImpl(node1, node2, weight);
                        links.push(link);
                    }
                }
            }
            return links;
        }
        static addNodesPositionXY(layerID, layer) {
            let i = 0;
            for (let node of layer) {
                node.positionY = i;
                node.positionX = layerID;
                i++;
            }
        }
        static createNeuralNetwork(layers, initialWeight) {
            let links = AiNeuralNetworkImpl.createLinks(layers, initialWeight);
            for (let layerID in layers) {
                let layer = layers[layerID];
                AiNeuralNetworkImpl.addNodesPositionXY(parseInt(layerID), layer);
                AiNeuralNetworkImpl.addNodesName(layer);
            }
            return new AiNeuralNetworkImpl(layers, links);
        }
        calculateNeuralNetworkOutput() {
            for (let i = 0; i < this._layers.length - 1; i++) {
                let nodesSecondLayer = this._layers[i + 1];
                for (let node2 of nodesSecondLayer) {
                    node2.value = 0;
                    for (let link of this._links) {
                        if (node2 == link.node2) {
                            node2.value = node2.value + (link.node1.value * link.weight);
                        }
                    }
                }
            }
        }
        static addNodesName(layer) {
            for (let node of layer) {
                if (node.port != undefined && node.port != "NO_PORT") {
                    node.name = node.name + " Port " + node.port;
                }
            }
        }
        getInputLayer() {
            return this._layers[0];
        }
        getOutputLayer() {
            return this._layers[this._layers.length - 1];
        }
        get layers() {
            return this._layers;
        }
        get links() {
            return this._links;
        }
    }
    exports.AiNeuralNetworkImpl = AiNeuralNetworkImpl;
});
