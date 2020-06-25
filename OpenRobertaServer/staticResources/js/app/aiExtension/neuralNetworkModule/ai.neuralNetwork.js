define(["require", "exports", "svgdotjs", "jquery"], function (require, exports, SVG, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AiNeuralNetworkModule {
        constructor(selector, size, ...layers) {
            this._aiNeuralNetwork = null;
            this._aiNeuralNetworkUI = null;
            $(selector).html('');
            this.svg = SVG.SVG().addTo(selector).size(size.width, size.height);
            this._aiNeuralNetwork = this.createNeuralNetwork(...layers);
            this._aiNeuralNetworkUI = new AiNeuralNetworkUI(this.aiNeuralNetwork, this.svg);
        }
        get aiNeuralNetwork() {
            if (this._aiNeuralNetwork != null) {
                return this._aiNeuralNetwork;
            }
            else {
                return null;
            }
        }
        get aiNeuralNetworkUI() {
            return this._aiNeuralNetworkUI;
        }
        createNeuralNetwork(...layers) {
            if (this._aiNeuralNetwork != null) {
                return;
            }
            return AiNeuralNetwork.createNeuralNetwork(layers);
        }
        calculateNeuralNetworkOutput() {
            this.aiNeuralNetwork.calculateNeuralNetworkOutput();
        }
    }
    exports.AiNeuralNetworkModule = AiNeuralNetworkModule;
    class AiNeuralNetwork {
        constructor(layers, links) {
            this._layers = layers;
            this._links = links;
        }
        get layers() {
            return this._layers;
        }
        get links() {
            return this._links;
        }
        static createLinks(layers, weight = 0) {
            let links = [];
            for (let i = 0; i < layers.length - 1; i++) {
                let nodesFirstLayer = layers[i];
                let nodesSecondLayer = layers[i + 1];
                for (let node1Index in nodesFirstLayer) {
                    let node1 = nodesFirstLayer[node1Index];
                    for (let node2Index in nodesSecondLayer) {
                        let node2 = nodesFirstLayer[node2Index];
                        let link = new Link(node1, node2, weight);
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
            let links = AiNeuralNetwork.createLinks(layers, initialWeight);
            for (let layerID in layers) {
                let layer = layers[layerID];
                AiNeuralNetwork.addNodesPositionXY(parseInt(layerID), layer);
            }
            return new AiNeuralNetwork(layers, links);
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
        getInputLayer() {
            return this._layers[0];
        }
        getOutputLayer() {
            return this._layers[this._layers.length - 1];
        }
    }
    exports.AiNeuralNetwork = AiNeuralNetwork;
    class Node {
        constructor(value, threshold) {
            this.value = value;
            this.threshold = threshold;
        }
        get positionX() {
            return this._positionX;
        }
        set positionX(value) {
            this._positionX = value;
        }
        get positionY() {
            return this._positionY;
        }
        set positionY(value) {
            this._positionY = value;
        }
    }
    exports.Node = Node;
    class Ev3MotorOutputNode extends Node {
        constructor(value, threshold, port, type) {
            super(value, threshold);
            this._port = port;
            this._type = type;
        }
        get port() {
            return this._port;
        }
        get type() {
            return this._type;
        }
    }
    exports.Ev3MotorOutputNode = Ev3MotorOutputNode;
    class Link extends EventTarget {
        constructor(node1, node2, _weight) {
            super();
            this.node1 = node1;
            this.node2 = node2;
            this._weight = _weight;
        }
        get weight() {
            return this._weight;
        }
        set weight(value) {
            this._weight = value;
            let event = new CustomEvent('weightChanged', { detail: value });
            this.dispatchEvent(event);
        }
    }
    exports.Link = Link;
    class LinkUI extends EventTarget {
        constructor(link, svg, draggable) {
            super();
            this.link = link;
            this.svg = svg;
            this.draggable = draggable;
            this.isActivated = false;
            this.drawSlider();
            this.addLinkListener();
        }
        ;
        drawSlider() {
            let that = this;
            let path = LinkUI.createPathForLink(this.link, this.svg);
            let circle = this.svg.circle()
                .radius(8)
                .fill('red')
                .click(function () {
                that.activateLink();
            });
            this.slider = SVGSlider.createSlider(path, LinkUI.RANGE_MIN, LinkUI.RANGE_MAX, circle, LinkUI.STARTPOINT, path.length);
            this.slider.addEventListener('sliderValueChanged', function (sliderValueData) {
                that.link.weight = sliderValueData.detail.sliderValue;
            });
            this.draggable.registerDraggableElement(circle);
        }
        static createPathForLink(link, svg) {
            let node1PositionXY = AiNeuralNetworkUI.getNodeXY(link.node1.positionX, link.node1.positionY);
            let node2PositionXY = AiNeuralNetworkUI.getNodeXY(link.node2.positionX, link.node2.positionY);
            return SVGUtils.createPath(svg, node1PositionXY.x, node1PositionXY.y, node2PositionXY.x, node2PositionXY.y);
        }
        addLinkListener() {
            let that = this;
            this.link.addEventListener('weightChanged', function (value) {
                let width = value.detail.value * 4 + 2;
                that.slider.path.stroke({ width: width });
            });
            this.slider.path.stroke({ color: LinkUI.COLOR_INACTIVE, width: this.link.weight })
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
        activateLink() {
            this.isActivated = true;
            this.slider.path.stroke(LinkUI.COLOR_ACTIVE).front();
            this.slider.sliderShape.front();
            let event = new CustomEvent('linkActivated');
            this.dispatchEvent(event);
        }
        deactivateLink() {
            this.isActivated = false;
            this.slider.path.stroke(LinkUI.COLOR_INACTIVE);
        }
    }
    exports.LinkUI = LinkUI;
    LinkUI.COLOR_ACTIVE = 'black';
    LinkUI.COLOR_INACTIVE = '#b5cb5f';
    LinkUI.RANGE_MIN = 0;
    LinkUI.RANGE_MAX = 1;
    LinkUI.STARTPOINT = 0;
    class Draggable {
        constructor(area) {
            this.area = area;
            this.draggingElement = null;
        }
        static create(area) {
            let draggable = new Draggable(area);
            draggable.draggableEventHandling();
            return draggable;
        }
        draggableEventHandling() {
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
        registerDraggableElement(element) {
            let that = this;
            element.mousedown(function () {
                that.draggingElement = this;
                that.draggingElement.fire('dragstart');
            });
        }
    }
    exports.Draggable = Draggable;
    class AiNeuralNetworkUI {
        constructor(neuralNetwork, svg) {
            this.neuralNetwork = neuralNetwork;
            this.svg = svg;
            this.draggable = Draggable.create(svg);
            this.drawNeuralNetwork();
        }
        drawNeuralNetwork() {
            this.drawLinks(this.neuralNetwork.links);
            this.drawLayer(this.neuralNetwork.layers[0]);
            this.drawLayer(this.neuralNetwork.layers[1]);
        }
        drawLayer(layer) {
            for (let node of layer) {
                let nodePositionXY = AiNeuralNetworkUI.getNodeXY(node.positionX, node.positionY);
                let circle = this.svg.circle()
                    .radius(20)
                    .cx(nodePositionXY.x)
                    .cy(nodePositionXY.y)
                    .fill('black');
            }
        }
        drawLinks(links) {
            let that = this;
            for (let link of links) {
                let linkUI = new LinkUI(link, this.svg, this.draggable);
                linkUI.addEventListener('linkActivated', function (event) {
                    that.activeLinkUI.deactivateLink();
                    that.activeLinkUI = this;
                });
            }
        }
        static getNodeXY(nodePositionX, nodePositionY) {
            let x = AiNeuralNetworkUI.LAYER_OFFSET_LEFT + AiNeuralNetworkUI.HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES + nodePositionX;
            let y = AiNeuralNetworkUI.LAYER_OFFSET_TOP + AiNeuralNetworkUI.VERTICAL_DISTANCE_BETWEEN_TWO_NODES * nodePositionY;
            return { x: x, y: y };
        }
    }
    exports.AiNeuralNetworkUI = AiNeuralNetworkUI;
    AiNeuralNetworkUI.LAYER_OFFSET_TOP = 20;
    AiNeuralNetworkUI.LAYER_OFFSET_LEFT = 20;
    AiNeuralNetworkUI.HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES = 170;
    AiNeuralNetworkUI.VERTICAL_DISTANCE_BETWEEN_TWO_NODES = 70;
    class SVGSlider extends EventTarget {
        constructor(_path, rangeMin, rangeMax, _sliderShape, startPoint = 0, endPoint = _path.length()) {
            super();
            this._path = _path;
            this.rangeMin = rangeMin;
            this.rangeMax = rangeMax;
            this._sliderShape = _sliderShape;
            this.startPoint = startPoint;
            this.endPoint = endPoint;
        }
        get path() {
            return this._path;
        }
        get sliderShape() {
            return this._sliderShape;
        }
        get sliderValue() {
            return this._sliderValue;
        }
        set sliderValue(value) {
            this.sliderValue = value;
            let pointOnPath = this.path.node.getPointAtLength(this.path.node.getTotalLength() * value);
            this.sliderShape.cx(pointOnPath.x + 20).cy(pointOnPath.y);
            let event = new CustomEvent('sliderValueChanged', { detail: value });
            this.dispatchEvent(event);
        }
        static createSlider(path, rangeMin, rangeMax, sliderShape, startPoint, endPoint = path.length) {
            let slider = new SVGSlider(path, rangeMin, rangeMax, sliderShape, startPoint, endPoint());
            slider.sliderShape.on('dragmove', function (e) {
                var m = path.root().point(e.pageX, e.pageY), p = SVGUtils.closestPoint(path.node, m);
                sliderShape.cx(p.x).cy(p.y);
                let sliderShapeCenter = { x: sliderShape.cx(), y: sliderShape.cy() };
                slider.sliderValue = SVGUtils.getPositionOnPath(path, sliderShapeCenter, SVGSlider.ACCURACY, rangeMax);
            });
            return slider;
        }
    }
    exports.SVGSlider = SVGSlider;
    SVGSlider.ACCURACY = 100;
    class SVGUtils {
        static createPath(svg, node1PositionX, node1PositionY, node2PositionX, node2PositionY) {
            return svg.path([
                ['M', node1PositionX, node1PositionY],
                ['L', node2PositionX, node2PositionY],
                ['z']
            ]);
        }
        static closestPoint(pathNode, point) {
            var pathLength = pathNode.getTotalLength(), precision = 8, best, bestLength, bestDistance = Infinity;
            // linear scan for coarse approximation
            for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
                if ((scanDistance = SVGUtils.distance2(point, scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
                    best = scan, bestLength = scanLength, bestDistance = scanDistance;
                }
            }
            // binary search for precise estimate
            precision /= 2;
            while (precision > 0.5) {
                var before, after, beforeLength, afterLength, beforeDistance, afterDistance;
                if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = SVGUtils.distance2(point, before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
                    best = before, bestLength = beforeLength, bestDistance = beforeDistance;
                }
                else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = SVGUtils.distance2(point, after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
                    best = after, bestLength = afterLength, bestDistance = afterDistance;
                }
                else {
                    precision /= 2;
                }
            }
            return { x: best.x, y: best.y, distance: Math.sqrt(bestDistance) };
        }
        static distance2(point, p) {
            var dx = p.x - point.x, dy = p.y - point.y;
            return dx * dx + dy * dy;
        }
        static getPositionOnPath(path, point, accuracy, fullWeight) {
            let totalLength = path.length();
            let step = totalLength / accuracy;
            let t = 0;
            let currentDistance;
            let minDistanceData = { "t": t, "distance": Number.MAX_VALUE };
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
                currentDistance = SVGUtils.calcDistance(path.node.getPointAtLength(t), point);
                if (currentDistance < minDistanceData.distance) {
                    minDistanceData = { "t": t, "distance": currentDistance }; //p2 - distance from point at length to circle center
                }
            }
            let sliderValue = minDistanceData.t / step * fullWeight / accuracy;
            return sliderValue;
        }
        static round(num, places) {
            var multiplier = Math.pow(10, places);
            return (Math.round(num * multiplier) / multiplier);
        }
        static calcDistance(p1, p2) {
            return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        }
    }
    exports.SVGUtils = SVGUtils;
});
