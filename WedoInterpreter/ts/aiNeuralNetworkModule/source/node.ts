import {Node} from "interpreter.aiNeuralNetworkModule/source/models";

export class NodeImpl extends EventTarget implements Node {

    private _positionX: number;
    private _positionY: number;
    private _name: string;
    private readonly _port: string;
    private readonly _type: string;
    private _value: number;
    private readonly _threshold: number;
    private readonly _data: Object;

    constructor(value: number, threshold: number, port: string, type: string) {
        super();
        this._value = value;
        this._threshold = threshold;
        this._port = port;
        this._type = type;
    }




    set positionX(value: number) {
        this._positionX = value;
    }

    set positionY(value: number) {
        this._positionY = value;
    }

    set value(value: number) {
        this._value = value;
        this.dispatchEvent(new CustomEvent<number>("valueChanged", {detail: value}))
    }

    get positionX(): number {
        return this._positionX;
    }

    get positionY(): number {
        return this._positionY;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get port(): string {
        return this._port;
    }

    get type(): string {
        return this._type;
    }

    get value(): number {
        return this._value;
    }

    get threshold(): number {
        return this._threshold;
    }

    get data(): Object {
        return this._data;
    }


}

