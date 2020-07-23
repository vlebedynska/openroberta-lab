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
                        let node2 = nodesSecondLayer[node2Index];
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
                AiNeuralNetwork.addNodesName(layer);
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
        static addNodesName(layer) {
            for (let node of layer) {
                node.name = node.name + " Port " + node.port;
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
        constructor(value, threshold, data) {
            this.value = value;
            this.threshold = threshold;
            this.data = data;
        }
        get name() {
            return this._name;
        }
        set name(value) {
            this._name = value;
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
        get type() {
            return this._type;
        }
        get port() {
            return this._port;
        }
    }
    exports.Node = Node;
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
            this.sliderValueText = this.svg.text("");
            this.drawSlider();
            this.addLinkListener();
        }
        ;
        drawSlider() {
            let that = this;
            let path = LinkUI.createPathForLink(this.link, this.svg)
                .stroke(LinkUI.COLOR_DEFAULT);
            let circle = this.svg.circle()
                .radius(LinkUI.SLIDER_SHAPE_RADIUS)
                .fill('red');
            this.slider = SVGSlider.createSlider(path, LinkUI.RANGE_MIN, LinkUI.RANGE_MAX, circle, this.sliderValueText, AiNeuralNetworkUI.NODE_CIRCLE_RADIUS + LinkUI.SLIDER_SHAPE_RADIUS, path.length() - (AiNeuralNetworkUI.NODE_CIRCLE_RADIUS + LinkUI.SLIDER_SHAPE_RADIUS), this.link.weight);
            this.slider.addEventListener('sliderValueChanged', function (sliderValueData) {
                that.link.weight = sliderValueData.detail;
            });
            this.updateSliderPathOnWeightChange(this.link.weight);
            this.draggable.registerDraggableElement(circle);
        }
        static createPathForLink(link, svg) {
            let node1PositionXY = AiNeuralNetworkUI.getNodeXY(link.node1.positionX, link.node1.positionY);
            let node2PositionXY = AiNeuralNetworkUI.getNodeXY(link.node2.positionX, link.node2.positionY);
            return SVGUtils.createPath(svg, node1PositionXY.x, node1PositionXY.y, node2PositionXY.x, node2PositionXY.y);
        }
        addLinkListener() {
            let that = this;
            this.link.addEventListener('weightChanged', function (event) {
                that.updateSliderPathOnWeightChange(event.detail);
            });
            this.slider.path
                .mouseover(function () {
                this.stroke(LinkUI.COLOR_ACTIVE);
                console.log("Link mouseover");
            })
                .mouseout(function () {
                if (!that.isActivated) {
                    this.stroke(LinkUI.COLOR_INACTIVE);
                    console.log("Link mouseout");
                }
            })
                .click(function () {
                console.log(that.link);
                that.activateLink();
            });
        }
        updateSliderPathOnWeightChange(weight) {
            let width = weight * 4 + 2;
            this.slider.path.stroke({ width: width });
        }
        activateLink() {
            this.isActivated = true;
            this.slider.path.stroke(LinkUI.COLOR_ACTIVE);
            this.slider.sliderShape.front();
            let event = new CustomEvent('linkActivated');
            console.log("Link aktiviert");
            this.dispatchEvent(event);
        }
        deactivateLink() {
            this.isActivated = false;
            this.slider.path.stroke(LinkUI.COLOR_INACTIVE);
            console.log("Link deaktiviert");
        }
    }
    exports.LinkUI = LinkUI;
    LinkUI.COLOR_ACTIVE = 'black';
    LinkUI.COLOR_INACTIVE = '#b5cb5f';
    LinkUI.COLOR_DEFAULT = '#b5cb5f';
    LinkUI.RANGE_MIN = 0;
    LinkUI.RANGE_MAX = 1;
    LinkUI.SLIDER_SHAPE_RADIUS = 8;
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
                    that.draggingElement.dispatch('dragmove', e);
                    console.log("dragmove");
                }
            });
            $(document).mouseup(function (e) {
                if (that.draggingElement != null) {
                    that.draggingElement.fire('dragend');
                    console.log("dragend");
                    that.draggingElement = null;
                }
            });
        }
        registerDraggableElement(element) {
            let that = this;
            element.mousedown(function () {
                that.draggingElement = this;
                that.draggingElement.fire('dragstart');
                console.log("dragstart");
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
                    .radius(AiNeuralNetworkUI.NODE_CIRCLE_RADIUS)
                    .cx(nodePositionXY.x)
                    .cy(nodePositionXY.y)
                    .addClass("inputNode");
                let nodeName = node.name;
                let text = this.svg.text("").tspan(nodeName).dy("" + circle.cy());
                if (node.positionX == 0) {
                    text.ax("" + (circle.cx() - 175)).addClass("inputNodeName");
                }
                else {
                    text.ax("" + (circle.cx() + 30)).addClass("outputNodeName");
                }
            }
        }
        drawLinks(links) {
            let that = this;
            for (let link of links) {
                let linkUI = new LinkUI(link, this.svg, this.draggable);
                linkUI.addEventListener('linkActivated', function (event) {
                    if (that.activeLinkUI != undefined) {
                        that.activeLinkUI.deactivateLink();
                    }
                    that.activeLinkUI = this;
                });
            }
        }
        static getNodeXY(nodePositionX, nodePositionY) {
            let x = AiNeuralNetworkUI.LAYER_OFFSET_LEFT + AiNeuralNetworkUI.HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES * nodePositionX;
            let y = AiNeuralNetworkUI.LAYER_OFFSET_TOP + AiNeuralNetworkUI.VERTICAL_DISTANCE_BETWEEN_TWO_NODES * nodePositionY;
            return { x: x, y: y };
        }
    }
    exports.AiNeuralNetworkUI = AiNeuralNetworkUI;
    AiNeuralNetworkUI.LAYER_OFFSET_TOP = 60;
    AiNeuralNetworkUI.LAYER_OFFSET_LEFT = 200;
    AiNeuralNetworkUI.HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES = 170;
    AiNeuralNetworkUI.VERTICAL_DISTANCE_BETWEEN_TWO_NODES = 110;
    AiNeuralNetworkUI.NODE_CIRCLE_RADIUS = 20;
    class SVGSlider extends EventTarget {
        constructor(_path, rangeMin, rangeMax, _sliderShape, sliderValueText, startPoint = 0, endPoint = _path.length(), _sliderValue) {
            super();
            this._path = _path;
            this.rangeMin = rangeMin;
            this.rangeMax = rangeMax;
            this._sliderShape = _sliderShape;
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            this._sliderValue = _sliderValue;
            this.sliderValueText = sliderValueText;
            this.sliderValue = _sliderValue;
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
        set sliderValueText(value) {
            this._sliderValueText = value;
        }
        get sliderValueText() {
            return this._sliderValueText;
        }
        static createSlider(path, rangeMin, rangeMax, sliderShape, sliderValueText, startPoint, endPoint = path.length(), sliderValue = 0) {
            let slider = new SVGSlider(path, rangeMin, rangeMax, sliderShape, sliderValueText, startPoint, endPoint, sliderValue);
            slider.updateSliderShapePosition(sliderValue);
            slider.sliderShape.on('dragmove', function (e) {
                let mouseEvent = e.detail;
                let m = path.root().point(mouseEvent.pageX, mouseEvent.pageY), p = SVGUtils.closestPoint(path.node, m);
                //umrechnen startpoint und endpoint
                slider.updateSliderShapePosition(p.lengthOnPath);
                slider.sliderValueText = slider.sliderValueText.cx(sliderShape.cx()).cy(sliderShape.cy() - 15);
                let sliderShapeCenter = { x: sliderShape.cx(), y: sliderShape.cy() };
                slider.sliderValue = SVGUtils.getPositionOnPath(path, sliderShapeCenter, SVGSlider.ACCURACY, rangeMax);
            });
            return slider;
        }
        set sliderValue(value) {
            this._sliderValue = value;
            let pointOnPath = this.path.node.getPointAtLength(this.path.node.getTotalLength() * value);
            this.sliderShape.cx(pointOnPath.x).cy(pointOnPath.y);
            let event = new CustomEvent('sliderValueChanged', { detail: value });
            console.log("slidervalue changed: " + value);
            this.dispatchEvent(event);
            this.updateSliderValueText(value);
        }
        updateSliderShapePosition(p) {
            if (p >= this.startPoint && p <= this.endPoint) {
                this.sliderShape.cx(this.path.node.getPointAtLength(p).x).cy(this.path.node.getPointAtLength(p).y);
            }
            else {
                if (p < this.startPoint) {
                    let minimalPoint = this.path.node.getPointAtLength(this.startPoint);
                    this.sliderShape.cx(minimalPoint.x).cy(minimalPoint.y);
                }
                else {
                    let maximalPoint = this.path.node.getPointAtLength(this.endPoint);
                    this.sliderShape.cx(maximalPoint.x).cy(maximalPoint.y);
                }
            }
        }
        updateSliderValueText(value) {
            this.sliderValueText.plain("" + value.toFixed(2));
        }
    }
    exports.SVGSlider = SVGSlider;
    SVGSlider.ACCURACY = 100;
    class SVGUtils {
        static createPath(svg, node1PositionX, node1PositionY, node2PositionX, node2PositionY) {
            return svg.path([
                ['M', node1PositionX, node1PositionY],
                ['L', node2PositionX, node2PositionY]
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
            return { x: best.x, y: best.y, distance: Math.sqrt(bestDistance), lengthOnPath: bestLength };
        }
        static distance2(point, p) {
            var dx = p.x - point.x, dy = p.y - point.y;
            return dx * dx + dy * dy;
        }
        static getPositionOnPath(path, point, accuracy, fullWeight) {
            let totalLength = path.node.getTotalLength();
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
