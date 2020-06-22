import * as SVG from "svgdotjs" ;

export class AiNeuralNetworkModule {
    private svg: SVG.Svg;

    constructor(selector: string) {
        this.init(selector);
    }

    private init(selector: string) {
        $(selector).html('');
        this.svg = SVG.SVG().addTo(selector);
    }
}



export class AiNeuralNetwork {


    private constructor(public layers: Array<Array<Node>>, public links: Array<Link>) {
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

    public static addNodesPosition(layer: Array<Node>) {
        let i = 0;
        for (let node of layer) {
            node.position = i;
            i++;
        }
    }

    public static creteNeuralNetwork(layers: Array<Array<Node>>, weight?: number): AiNeuralNetwork {
        let links: Array<Link>  = AiNeuralNetwork.createLinks(layers, weight);
        for ( let layer of layers ) {
            AiNeuralNetwork.addNodesPosition(layer);
        }
        return new AiNeuralNetwork(layers, links);
    }



}

export class Node {
    position: number;

    constructor(public value: number,
                public threshold: number) {
    }
    

}


export class Link extends EventTarget{
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


    public on() {

    }
}

export class LinkUI{
    private static readonly COLOR_ACTIVE = 'black';
    private static readonly COLOR_INACTIVE = '#b5cb5f';
    private static lineOld: SVG.Path = null;

    constructor(public line: SVG.Path, private readonly link: Link) {
        this.addLinkListener();
    };

    private addLinkListener() {
        let that = this;
        this.link.addEventListener('weightChanged', function (value: CustomEvent) {
            let width = value.detail.value * 4 + 2;
            that.line.stroke({width: width});
        });

        this.line.on('selected', function () {


        });

        this.line.stroke({color: LinkUI.COLOR_INACTIVE, width: this.link.weight})
                .mouseover(function () {
                    this.stroke(LinkUI.COLOR_ACTIVE);
                })
                .mouseout(function () {
                    if (LinkUI.lineOld != this) {
                        this.stroke(LinkUI.COLOR_INACTIVE);
                    }
                })
                .click(function () {
                    console.log(that.link);
                    that.activateLine(this);
                });
    }


    private lineSelected () {

    }

    private activateLine(line) {
        if (LinkUI.lineOld != null) {
            LinkUI.lineOld.stroke(LinkUI.COLOR_INACTIVE);
            LinkUI.lineOld.back();
        }
        this.line.stroke(LinkUI.COLOR_ACTIVE);
        LinkUI.lineOld = line;
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

    // public ondragend() {
    //     $(that.draggingElement).data('line').stroke('#b5cb5f');
    // }

}

export class AiNeuralNetworkUI {
    private draggable;
    private static readonly POSITIONX1 = 50;
    private static readonly POSITIONX2 = 220;
    private static readonly TOP_LAYER_OFFSET = 20;
    private static VERTICAL_DISTANCE_BETWEEN_TWO_NODES  = 70;

    private constructor(public neuralNetwork: AiNeuralNetwork, private svg: SVG.Svg ) {
        this.draggable = Draggable.create(svg);
    }


    public static drawNeuralNetwork(neuralNetwork, svg) {


        AiNeuralNetworkUI.drawLinks(neuralNetwork.links, AiNeuralNetworkUI.POSITIONX1, AiNeuralNetworkUI.POSITIONX2, svg);
        AiNeuralNetworkUI.drawLayer(neuralNetwork.inputLayer, AiNeuralNetworkUI.POSITIONX1, svg);
        AiNeuralNetworkUI.drawLayer(neuralNetwork.outputLayer, AiNeuralNetworkUI.POSITIONX2, svg);

    }

    private static drawLayer(layer, startXPosition, svg) {
        for (var nodeID in layer) {
            var node = layer[nodeID];
            var nodePosition = node.position;
            var y = AiNeuralNetworkUI.TOP_LAYER_OFFSET + AiNeuralNetworkUI.VERTICAL_DISTANCE_BETWEEN_TWO_NODES * nodePosition;
            var circle = svg.circle()
                .radius(20)
                .cx(startXPosition)
                .cy(y)
                .fill('black');
        }
    }

    private static drawLinks(links, positionX1, positionX2, svg) {
        let lineAlt;
        var that = this;
        for (var linkID in links) {
            var link = links[linkID];

            let positionY1 = AiNeuralNetworkUI.TOP_LAYER_OFFSET + AiNeuralNetworkUI.VERTICAL_DISTANCE_BETWEEN_TWO_NODES * link.inputNode.position;
            let positionY2 = AiNeuralNetworkUI.TOP_LAYER_OFFSET + AiNeuralNetworkUI.VERTICAL_DISTANCE_BETWEEN_TWO_NODES * link.outputNode.position;

            let line = svg.line(positionX1, positionY1, positionX2, positionY2);
            let slider = SVGSlider.createSlider(svg.line(positionX1, positionY1, positionX2, positionY2), 0, 1, svg.circle(), 0.5, 0, svg.line.length);
            slider.addEventListener('sliderValueChanged', function (sliderValueData: CustomEvent) {
                link.weight = sliderValueData.detail.sliderValue;
x
            });
            let linkUI = new LinkUI(line, link);

            var pointOnLine = line.node.getPointAtLength(line.node.getTotalLength() * link.weight);
            let circle: SVG.Shape = svg.circle()
                .radius(8)
                .fill('red')
                .cx(pointOnLine.x + 20) //?
                .cy(pointOnLine.y)
                .front() //?
                .mousedown(function () {
                    lineAlt = that.changeLineColour($(that.draggingElement).data('line').stroke('black'), lineAlt, this);
                })

            this.draggable.registerDraggableElement(circle);

            $(circle).data("line", line)
            $(line).data("link", link);
        }
    }



}



export class SVGSlider extends EventTarget{

    private static readonly ACCURACY = 100;

    private constructor(
        private path: SVG.Path,
        private rangeMin: number,
        private rangeMax: number,
        private sliderShape: SVG.Shape,
        private sliderValue: number,
        private startPoint = 0,
        private endPoint = path.length()) {
        super();
    }


    public static createSlider(path: SVG.Path,rangeMin: number, rangeMax: number, sliderShape: SVG.Shape, sliderValue: number, startPoint = 0, endPoint = path.length) : SVGSlider {
        let slider = new SVGSlider(path, rangeMin, rangeMax, sliderShape, sliderValue,startPoint, endPoint());

        return slider;
    }



    public dragmove() {
        let that = this;
        this.sliderShape.on('dragmove', function() {
            let line = that.path.node;
            let sliderShapeCenter = {"x": that.sliderShape.cx(), "y": that.sliderShape.cy()};
            that.sliderValue = that.getPositionOnPath(line, sliderShapeCenter, SVGSlider.ACCURACY, that.rangeMax);
            that.setSliderValue(that.sliderValue);
        });
    }


    private getPositionOnPath(path, point, accuracy, fullWeight) {
            let totalLength = path.getTotalLength();
            let step = totalLength/accuracy;
            let t = 0;
            let currentDistance;
            let minDistanceData = {"t":t, "distance": Number.MAX_VALUE};


            /**
             * <--        totalLength         -->
             * <step> <step> <step> <step> <step>
             * ------|------|------|---*--|------
             *       t-->         cirlceCenter
             *       <--  distance  -->
             *
             */
            for (t=0; t<=totalLength; t+=step) {
                t = SVGSlider.round(t, 4);
                currentDistance = SVGSlider.calcDistance(path.getPointAtLength(t), point)
                if (currentDistance < minDistanceData.distance) {
                    minDistanceData = {"t":t, "distance": currentDistance}; //p2 - distance from point at length to circle center
                }
            }
            let sliderValue = minDistanceData.t/step * fullWeight/accuracy;
            return sliderValue;
        }


    private static round(num, places) {
        var multiplier = Math.pow(10, places);
        return (Math.round(num * multiplier) / multiplier);
    }

    private static calcDistance(p1, p2) {
        return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
    }

    public getSliderValue() {
        return this.sliderValue;
    }


    public setSliderValue(sliderValue: number) {
        this.sliderValue = sliderValue;
        let event: CustomEvent = new CustomEvent<number>('sliderValueChanged', {detail: sliderValue});
        this.dispatchEvent(event);
    }





    //
    // var pointOnLine = line.node.getPointAtLength(line.node.getTotalLength() * link.weight);
    // var circle = svg.circle()
    //     .radius(8)
    //     .fill('red')
    //     .cx(pointOnLine.x+20) //?
    //     .cy(pointOnLine.y)
    //     .front() //?
    //     .mousedown(function () {
    //         console.log("Mouse is down");
    //         that.draggingElement = this;
    //         lineAlt = that.changeLineColour( $(that.draggingElement).data('line').stroke('black'), lineAlt, this);
    //     })
    // $(circle).data("line", line)
    // $(line).data("link", link);
    //
    // changeLineColour(line, lineAlt, sliderElement) {
    //     if (lineAlt != undefined) {
    //         lineAlt.stroke('#b5cb5f');
    //         lineAlt.back();
    //     }
    //     //line.front();
    //     sliderElement.front();
    //     line.stroke('black');
    //     lineAlt = line;
    //     return lineAlt;
    // }
    //
    //
    // mousemoved(svg,mbedBehaviour, e) {
    //     console.log("Start moving!")
    //     var m = svg.point(e.pageX, e.pageY),
    //         p = mbedBehaviour.closestPoint($(mbedBehaviour.draggingElement).data("line").node, m);
    //     //lineTest.attr("x1", p[0]).attr("y1", p[1]).attr("x2", m.x).attr("y2", m.y);
    //     mbedBehaviour.draggingElement.attr("cx", p[0]).attr("cy", p[1]);
    // }
    //
    //
    // closestPoint(pathNode, point) {
    //     var pathLength = pathNode.getTotalLength(),
    //         precision = 8,
    //         best,
    //         bestLength,
    //         bestDistance = Infinity;
    //
    //     // linear scan for coarse approximation
    //     for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
    //         if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
    //             best = scan, bestLength = scanLength, bestDistance = scanDistance;
    //         }
    //     }
    //     // binary search for precise estimate
    //     precision /= 2;
    //     while (precision > 0.5) {
    //         var before,
    //             after,
    //             beforeLength,
    //             afterLength,
    //             beforeDistance,
    //             afterDistance;
    //         if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
    //             best = before, bestLength = beforeLength, bestDistance = beforeDistance;
    //         } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
    //             best = after, bestLength = afterLength, bestDistance = afterDistance;
    //         } else {
    //             precision /= 2;
    //         }
    //     }
    //
    //     best = [best.x, best.y];
    //     best.distance = Math.sqrt(bestDistance);
    //     return best;
    //
    //     function distance2(p) {
    //         var dx = p.x - point.x,
    //             dy = p.y - point.y;
    //         return dx * dx + dy * dy;
    //     }
    // }



}


export class SVGSliderUtils {

}