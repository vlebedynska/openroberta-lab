import {SVG} from "svgdotjs";

export class AiNeuralNetwork {
    private layers: Array<Array<Node>>;
    private links: Array<Link>;


    private constructor(layers: Array<Array<Node>>, links: Array<Link>) {
        this.layers = layers;
        this.links = links;
    }


    private static createLinks(layers: Array<Array<Node>>, weight = 0): Array<Link> {
        let links = [];
        for (let i = 0; i < layers.length - 1; i++) {
            let nodesFirstLayer = layers[i];
            let nodesSecondLayer = layers[i + 1];
            for (let node1Index in nodesFirstLayer) {
                let node1: Node= nodesFirstLayer[node1Index];
                for (let node2Index in nodesSecondLayer) {
                let node2: Node = nodesFirstLayer[node2Index];
                    var link: Link = new Link(node1, node2, weight);
                    links.push(link);
                }
            }
        }
        return links;
    }

    public static creteNeuralNetwork(layers: Array<Array<Node>>, weight?: number): AiNeuralNetwork {
        let links: Array<Link>  = AiNeuralNetwork.createLinks(layers, weight);
        return new AiNeuralNetwork(layers, links);
    }

}

export class Node {
    private _value: number;
    private _threshold: number;


    constructor(value: number, threshold: number) {
        this._value = value;
        this._threshold = threshold;
    }

    get value(): number {
        return this._value;
    }

    set value(value: number) {
        this._value = value;
    }

    get threshold(): number {
        return this._threshold;
    }

    set threshold(value: number) {
        this._threshold = value;
    }
}


export class Link {
    private _node1: Node;
    private _node2: Node;
    private _weight: number;


    constructor(node1: Node, node2: Node, weight: number) {
        this._node1 = node1;
        this._node2 = node2;
        this._weight = weight;
    }

    get node1(): Node {
        return this._node1;
    }

    get node2(): Node {
        return this._node2;
    }

    get weight(): number {
        return this._weight;
    }


    set weight(value: number) {
        this._weight = value;
    }
}

export class AiNeuralNetworkUI {
    private neuralNetwork: AiNeuralNetwork;
    private svg: any;


}
