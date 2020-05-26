import * as SVG from "svgdotjs" ;

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
    private svg: SVG.Svg;


}


export class SVGSlider {

    private rangeMin: number;
    private rangeMax: number;
    private sliderShape: SVG.Shape;
    private path: SVG.Path;
    private sliderValue: number;
    private startPoint: number;
    private endPoint: number;


    private constructor(path: SVG.Path, rangeMin: number, rangeMax: number, sliderShape: SVG.Shape, sliderValue: number, startPoint = 0, endPoint = path.length()) {
        this.rangeMin = rangeMin;
        this.rangeMax = rangeMax;
        this.sliderShape = sliderShape;
        this.path = path;
        this.sliderValue = sliderValue;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }


    public static createSlider(path: SVG.Path, rangeMin: number, rangeMax: number, sliderShape: SVG.Shape, sliderValue: number, startPoint = 0, endPoint = path.length) : SVGSlider {
        let slider = new SVGSlider(path, rangeMin, rangeMax, sliderShape, sliderValue,startPoint, endPoint());

        return slider;
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
    // getLengthFromPathStartToPointAndCalculateWeigth(path, point, accuracy, fullWeight) {
    //     var totalLength = path.getTotalLength();
    //     var step = totalLength/accuracy;
    //     var t = 0;
    //     var currentDistance;
    //     var minDistanceData = {"t":t, "distance": Number.MAX_VALUE};
    //
    //
    //     /**
    //      * <--        totalLength         -->
    //      * <step> <step> <step> <step> <step>
    //      * ------|------|------|---*--|------
    //      *       t-->         cirlceCenter
    //      *       <--  distance  -->
    //      *
    //      */
    //     for (t=0; t<=totalLength; t+=step) {
    //         t = this.round(t, 4);
    //         currentDistance = this.calcDistance(path.getPointAtLength(t), point)
    //         if (currentDistance < minDistanceData.distance) {
    //             minDistanceData = {"t":t, "distance": currentDistance}; //p2 - distance from point at length to circle center
    //         }
    //     }
    //     var weight = minDistanceData.t/step * fullWeight/accuracy;
    //     return weight;
    //
    //
    // }
    //
    // round(num, places)
    // { var multiplier = Math.pow(10, places);
    //     return (Math.round(num * multiplier) / multiplier);
    // }
    //
    //
    // calcDistance(p1, p2) {
    //     return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
    // }
    //
    //
    // speichereStand(e) {
    //     console.log("speichere Stand")
    // }
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