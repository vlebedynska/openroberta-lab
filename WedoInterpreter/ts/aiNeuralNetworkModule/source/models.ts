import * as SVG from "svgdotjs";

export interface Link extends EventTarget{
    readonly node1: Node;
    readonly node2: Node;
    weight: number;
}


export interface Node extends EventTarget{
    readonly port: string;
    readonly type: string;
    readonly threshold: number;
    readonly data: Object;
    positionX: number;
    positionY: number;
    name: string;
    value: number;
    color?: string;
}

export interface AiNeuralNetwork {
    readonly layers: Array<Array<Node>>;
    readonly links: Array<Link>;
    calculateNeuralNetworkOutput();
    getInputLayer(): Array<Node>;
    getOutputLayer(): Array<Node>;
}


export interface SVGSlider extends EventTarget{
    readonly path: SVG.Path;
    readonly rangeMin: number;
    readonly rangeMax: number;
    readonly sliderShape: SVG.Shape;
    readonly startPoint: number;
    readonly endPoint: number;
    sliderValueText: SVG.Text;
    sliderValue: number;
}
