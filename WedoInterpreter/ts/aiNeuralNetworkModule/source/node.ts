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
    private _color: string;
    private readonly _duration: number;
    private readonly _frequency: number;

    constructor(value: number, threshold: number, port: string, type: string, color: string = "default", duration: number = 0, frequency: number = 0) {
        super();
        this._value = value;
        this._threshold = threshold;
        this._port = port;
        this._type = type;
        this._color = color;
        this._duration = duration;
        this._frequency = frequency;
    }




    set positionX(value: number) {
        this._positionX = value;
    }

    set positionY(value: number) {
        this._positionY = value;
    }

    set value(value: number) {
        if (value !== this._value) {
            this._value = value;
            this.dispatchEvent(new CustomEvent<number>("valueChanged", {detail: value}));
        }
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

    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
    }

    get duration(): number {
        return this._duration;
    }

    get frequency(): number {
        return this._frequency;
    }


}

