import * as SVG from "svgdotjs";

export class AiNeuralNetworkModule {


    private svg: SVG.Svg;
    private readonly _aiNeuralNetwork: AiNeuralNetwork = null;
    private readonly _aiNeuralNetworkUI: AiNeuralNetworkUI = null;

    public constructor(selector: string, size: {width: number, height: number}, ...layers: Array<Array<Node>> ) {
        $(selector).html('');
        this.svg = SVG.SVG().addTo(selector).size(size.width, size.height);
        this._aiNeuralNetwork = this.createNeuralNetwork(...layers);
        this._aiNeuralNetworkUI = new AiNeuralNetworkUI(this.aiNeuralNetwork, this.svg);
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


    private createNeuralNetwork(... layers: Array<Array<Node>>): AiNeuralNetwork {
        if (this._aiNeuralNetwork != null) {
            return;
        }
        return AiNeuralNetwork.createNeuralNetwork(layers);
    }

    public calculateNeuralNetworkOutput() {
        this.aiNeuralNetwork.calculateNeuralNetworkOutput();
    }


}


export class AiNeuralNetwork {

    private readonly _layers: Array<Array<Node>>
    private readonly _links: Array<Link>

    private constructor(layers: Array<Array<Node>>, links: Array<Link>) {
        this._layers = layers;
        this._links = links;

    }

    get layers(): Array<Array<Node>> {
        return this._layers;
    }

    get links(): Array<Link> {
        return this._links;
    }

    private static createLinks(layers: Array<Array<Node>>, weight = 0): Array<Link> {
        let links = [];
        for (let i = 0; i < layers.length - 1; i++) {
            let nodesFirstLayer = layers[i];
            let nodesSecondLayer = layers[i + 1];
            for (let node1Index in nodesFirstLayer) {
                let node1: Node = nodesFirstLayer[node1Index];
                for (let node2Index in nodesSecondLayer) {
                    let node2: Node = nodesFirstLayer[node2Index];
                    let link: Link = new Link(node1, node2, weight);
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
        let links: Array<Link> = AiNeuralNetwork.createLinks(layers, initialWeight);
        for (let layerID in layers) {
            let layer = layers[layerID];
            AiNeuralNetwork.addNodesPositionXY(parseInt(layerID), layer);
        }
        return new AiNeuralNetwork(layers, links);
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

    public getInputLayer(): Array<Node> {
        return this._layers[0];
    }

    public getOutputLayer(): Array<Node> {
        return this._layers[this._layers.length-1];
    }
}

export class Node {
    private _positionX: number;
    private _positionY: number;

    constructor(public value: number,
                public threshold: number) {
    }


    get positionX(): number {
        return this._positionX;
    }

    set positionX(value: number) {
        this._positionX = value;
    }

    get positionY(): number {
        return this._positionY;
    }

    set positionY(value: number) {
        this._positionY = value;
    }
}

export class Ev3MotorOutputNode extends Node {

    private readonly _port: string;
    private readonly _type: string;

    get port(): string {
        return this._port;
    }

    get type(): string {
        return this._type;
    }

    constructor (value: number, threshold: number, port: string, type: string ) {
        super(value, threshold);
        this._port = port;
        this._type = type;
    }
}


export class Link extends EventTarget {
    constructor(public node1: Node, public node2: Node, public _weight: number) {
        super();
    }


    get weight(): number {
        return this._weight;
    }


    set weight(value: number) {
        this._weight = value;
        let event: CustomEvent = new CustomEvent<number>('weightChanged', {detail: value});
        this.dispatchEvent(event);
    }

}

export class LinkUI extends EventTarget {
    private static readonly COLOR_ACTIVE = 'black';
    private static readonly COLOR_INACTIVE = '#b5cb5f';
    private static readonly RANGE_MIN = 0;
    private static readonly RANGE_MAX = 1;
    private static readonly STARTPOINT = 0;
    private slider: SVGSlider;
    private isActivated: boolean = false;

    constructor(private readonly link: Link, private svg: SVG.Svg, private draggable: Draggable) {
        super();
        this.drawSlider();
        this.addLinkListener();
    };

    private drawSlider() {
        let that = this;
        let path: SVG.Path = LinkUI.createPathForLink(this.link, this.svg);
        let circle: SVG.Shape = this.svg.circle()
            .radius(8)
            .fill('red')
            .click(function () {
                that.activateLink();
            })

        this.slider = SVGSlider.createSlider(path, LinkUI.RANGE_MIN, LinkUI.RANGE_MAX, circle, LinkUI.STARTPOINT, path.length);
        this.slider.addEventListener('sliderValueChanged', function (sliderValueData: CustomEvent) {
            that.link.weight = sliderValueData.detail.sliderValue;
        });
        this.draggable.registerDraggableElement(circle);
    }

    private static createPathForLink(link: Link, svg: SVG.Svg): SVG.Path {
        let node1PositionXY = AiNeuralNetworkUI.getNodeXY(link.node1.positionX, link.node1.positionY);
        let node2PositionXY = AiNeuralNetworkUI.getNodeXY(link.node2.positionX, link.node2.positionY);
        return SVGUtils.createPath(svg, node1PositionXY.x, node1PositionXY.y, node2PositionXY.x, node2PositionXY.y);
    }

    private addLinkListener() {
        let that = this;
        this.link.addEventListener('weightChanged', function (value: CustomEvent) {
            let width = value.detail.value * 4 + 2;
            that.slider.path.stroke({width: width});
        });

        this.slider.path.stroke({color: LinkUI.COLOR_INACTIVE, width: this.link.weight})
            .mouseover(function () {
                this.stroke(LinkUI.COLOR_ACTIVE);
            })
            .mouseout(function () {
                if (!that.isActivated) {
                    this.stroke(LinkUI.COLOR_INACTIVE);
                }
            })
            .click(function () {
                console.log(that.link);
                that.activateLink();
            });
    }


    private activateLink() {
        this.isActivated = true;
        this.slider.path.stroke(LinkUI.COLOR_ACTIVE).front();
        this.slider.sliderShape.front();
        let event: CustomEvent = new CustomEvent('linkActivated');
        this.dispatchEvent(event);
    }

    public deactivateLink() {
        this.isActivated = false;
        this.slider.path.stroke(LinkUI.COLOR_INACTIVE);
    }
}


export class Draggable {

    private draggingElement: SVG.Element = null;

    private constructor(public area: SVG.Element) {

    }

    public static create(area: SVG.Element): Draggable {
        let draggable = new Draggable(area);
        draggable.draggableEventHandling();
        return draggable;
    }

    public draggableEventHandling() {
        let that = this;
        this.area.mousemove(function (e) {
            e.stopPropagation();
            if (that.draggingElement != null) {
                that.draggingElement.fire('dragmove');
            }
        });
        $(document).mouseup(function (e) {
            if (that.draggingElement != null) {
                that.draggingElement.fire('dragend');
                that.draggingElement = null;
            }
        });
    }

    public registerDraggableElement(element: SVG.Element) {
        let that = this;
        element.mousedown(function () {
            that.draggingElement = this;
            that.draggingElement.fire('dragstart');
        });


    }
}

export class AiNeuralNetworkUI {
    private draggable: Draggable;
    private activeLinkUI: LinkUI;
    public static readonly LAYER_OFFSET_TOP = 20;
    public static readonly LAYER_OFFSET_LEFT = 20;
    public static HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES = 170;
    public static VERTICAL_DISTANCE_BETWEEN_TWO_NODES = 70;

    public constructor(public neuralNetwork: AiNeuralNetwork, private svg: SVG.Svg) {
        this.draggable = Draggable.create(svg);
        this.drawNeuralNetwork();
    }


    public drawNeuralNetwork() {
        this.drawLinks(this.neuralNetwork.links);
        this.drawLayer(this.neuralNetwork.layers[0]);
        this.drawLayer(this.neuralNetwork.layers[1]);
    }

    private drawLayer(layer) {
        for (let node of layer) {
            let nodePositionXY = AiNeuralNetworkUI.getNodeXY(node.positionX, node.positionY);
            let circle = this.svg.circle()
                .radius(20)
                .cx(nodePositionXY.x)
                .cy(nodePositionXY.y)
                .fill('black');
        }
    }

    private drawLinks(links) {
        let that = this;
        for (let link of links) {
            let linkUI = new LinkUI(link, this.svg, this.draggable);
            linkUI.addEventListener('linkActivated', function (event: CustomEvent) {
                that.activeLinkUI.deactivateLink();
                that.activeLinkUI = this;
            });
        }
    }

    public static getNodeXY(nodePositionX: number, nodePositionY: number): { x, y } {
        let x = AiNeuralNetworkUI.LAYER_OFFSET_LEFT + AiNeuralNetworkUI.HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES + nodePositionX;
        let y = AiNeuralNetworkUI.LAYER_OFFSET_TOP + AiNeuralNetworkUI.VERTICAL_DISTANCE_BETWEEN_TWO_NODES * nodePositionY;
        return {x: x, y: y};
    }
}


export class SVGSlider extends EventTarget {


    private static readonly ACCURACY = 100;
    private _sliderValue: number;

    private constructor(
        private readonly _path: SVG.Path,
        private readonly rangeMin: number,
        private readonly rangeMax: number,
        private readonly _sliderShape: SVG.Shape,
        private readonly startPoint = 0,
        private readonly endPoint = _path.length()) {
        super();
    }

    get path(): SVG.Path {
        return this._path;
    }

    get sliderShape(): SVG.Shape {
        return this._sliderShape;
    }

    get sliderValue(): number {
        return this._sliderValue;
    }

    set sliderValue(value: number) {
        this.sliderValue = value;
        let pointOnPath = this.path.node.getPointAtLength(this.path.node.getTotalLength() * value);
        this.sliderShape.cx(pointOnPath.x + 20).cy(pointOnPath.y);
        let event: CustomEvent = new CustomEvent<number>('sliderValueChanged', {detail: value});
        this.dispatchEvent(event);
    }

    public static createSlider(path: SVG.Path, rangeMin: number, rangeMax: number, sliderShape: SVG.Shape, startPoint: number, endPoint = path.length): SVGSlider {
        let slider = new SVGSlider(path, rangeMin, rangeMax, sliderShape, startPoint, endPoint());
        slider.sliderShape.on('dragmove', function (e) {
            var m = path.root().point(e.pageX, e.pageY),
                p = SVGUtils.closestPoint(path.node, m);
            sliderShape.cx(p.x).cy(p.y);

            let sliderShapeCenter = {x: sliderShape.cx(), y: sliderShape.cy()};
            slider.sliderValue = SVGUtils.getPositionOnPath(path, sliderShapeCenter, SVGSlider.ACCURACY, rangeMax);
        });
        return slider;
    }
}


export class SVGUtils {

    public static createPath(svg, node1PositionX, node1PositionY, node2PositionX, node2PositionY): SVG.Path {
        return svg.path([
            ['M', node1PositionX, node1PositionY],
            ['L', node2PositionX, node2PositionY],
            ['z']
        ])
    }


    public static closestPoint(pathNode, point): {x, y, distance} {
        var pathLength = pathNode.getTotalLength(),
            precision = 8,
            best,
            bestLength,
            bestDistance = Infinity;

        // linear scan for coarse approximation
        for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
            if ((scanDistance = SVGUtils.distance2(point,scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
                best = scan, bestLength = scanLength, bestDistance = scanDistance;
            }
        }
        // binary search for precise estimate
        precision /= 2;
        while (precision > 0.5) {
            var before,
                after,
                beforeLength,
                afterLength,
                beforeDistance,
                afterDistance;
            if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = SVGUtils.distance2(point, before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
                best = before, bestLength = beforeLength, bestDistance = beforeDistance;
            } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = SVGUtils.distance2(point, after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
                best = after, bestLength = afterLength, bestDistance = afterDistance;
            } else {
                precision /= 2;
            }
        }
        return {x: best.x, y: best.y, distance: Math.sqrt(bestDistance)};

    }

    public static distance2(point, p) {
        var dx = p.x - point.x,
            dy = p.y - point.y;
        return dx * dx + dy * dy;
    }


    public static getPositionOnPath(path: SVG.Path, point, accuracy, fullWeight): number {
        let totalLength = path.length();
        let step = totalLength / accuracy;
        let t = 0;
        let currentDistance;
        let minDistanceData = {"t": t, "distance": Number.MAX_VALUE};


        /**
         * <--        totalLength         -->
         * <step> <step> <step> <step> <step>
         * ------|------|------|---*--|------
         *       t-->         cirlceCenter
         *       <--  distance  -->
         *
         */
        for (t = 0; t <= totalLength; t += step) {
            t = SVGUtils.round(t, 4);
            currentDistance = SVGUtils.calcDistance(path.node.getPointAtLength(t), point)
            if (currentDistance < minDistanceData.distance) {
                minDistanceData = {"t": t, "distance": currentDistance}; //p2 - distance from point at length to circle center
            }
        }
        let sliderValue = minDistanceData.t / step * fullWeight / accuracy;
        return sliderValue;
    }


    private static round(num, places) {
        var multiplier = Math.pow(10, places);
        return (Math.round(num * multiplier) / multiplier);
    }

    private static calcDistance(p1, p2) {
        return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
    }
}