import {AiNeuralNetwork, Link, Node} from "interpreter.aiNeuralNetworkModule/source/models";
import {LinkImpl} from "interpreter.aiNeuralNetworkModule/source/link";

export class AiNeuralNetworkImpl implements AiNeuralNetwork{

    private readonly _layers: Array<Array<Node>>
    private readonly _links: Array<Link>

    private constructor(layers: Array<Array<Node>>, links: Array<Link>) {
        this._layers = layers;
        this._links = links;

    }



    private static createLinks(layers: Array<Array<Node>>, weight = 0): Array<Link> {
        let links = [];
        for (let i = 0; i < layers.length - 1; i++) {
            let nodesFirstLayer = layers[i];
            let nodesSecondLayer = layers[i + 1];
            for (let node1Index in nodesFirstLayer) {
                let node1: Node = nodesFirstLayer[node1Index];
                for (let node2Index in nodesSecondLayer) {
                    let node2: Node = nodesSecondLayer[node2Index];
                    let link: Link = new LinkImpl(node1, node2, weight);
                    links.push(link);
                }
            }
        }
        return links;
    }

    public static addNodesPositionXY(layerID: number, layer: Array<Node>) {
        let i = 0;
        for (let node of layer) {
            node.positionY = i;
            node.positionX = layerID;
            i++;
        }
    }

    public static createNeuralNetwork(layers: Array<Array<Node>>, initialWeight?: number): AiNeuralNetwork {
        let links: Array<Link> = AiNeuralNetworkImpl.createLinks(layers, initialWeight);
        for (let layerID in layers) {
            let layer = layers[layerID];
            AiNeuralNetworkImpl.addNodesPositionXY(parseInt(layerID), layer);
            AiNeuralNetworkImpl.addNodesName(layer);
        }
        return new AiNeuralNetworkImpl(layers, links);
    }

    public calculateNeuralNetworkOutput() {
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

    public static addNodesName(layer: Array<Node>) {
        for ( let node of layer) {
            node.name = node.name + " Port " + node.port;
        }
    }




    public getInputLayer(): Array<Node> {
        return this._layers[0];
    }

    public getOutputLayer(): Array<Node> {
        return this._layers[this._layers.length-1];
    }


    get layers(): Array<Array<Node>> {
        return this._layers;
    }

    get links(): Array<Link> {
        return this._links;
    }

}

