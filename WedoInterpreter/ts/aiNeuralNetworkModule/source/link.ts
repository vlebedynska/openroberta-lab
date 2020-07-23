import {Link, Node} from "interpreter.aiNeuralNetworkModule/source/models";

export class LinkImpl extends EventTarget implements Link {

    private readonly _node1: Node;
    private readonly _node2: Node
    private _weight: number;

    constructor(node1: Node, node2: Node, weight: number) {
        super();
        this._node1 = node1;
        this._node2 = node2;
        this._weight = weight;
    }


    get weight(): number {
        return this._weight;
    }


    set weight(value: number) {
        this._weight = value;
        let event: CustomEvent = new CustomEvent<number>('weightChanged', {detail: value});
        this.dispatchEvent(event);
    }


    get node1(): Node {
        return this._node1;
    }

    get node2(): Node {
        return this._node2;
    }

}
