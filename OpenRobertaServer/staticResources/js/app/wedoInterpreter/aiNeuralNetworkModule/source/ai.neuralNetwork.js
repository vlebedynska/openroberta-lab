define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AiNeuralNetwork {
        constructor(layers, links) {
            this.layers = layers;
            this.links = links;
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
                        var link = new Link(node1, node2, weight);
                        links.push(link);
                    }
                }
            }
            return links;
        }
        static creteNeuralNetwork(layers, weight) {
            let links = AiNeuralNetwork.createLinks(layers, weight);
            return new AiNeuralNetwork(layers, links);
        }
    }
    exports.AiNeuralNetwork = AiNeuralNetwork;
    class Node {
        constructor(value, threshold) {
            this._value = value;
            this._threshold = threshold;
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value;
        }
        get threshold() {
            return this._threshold;
        }
        set threshold(value) {
            this._threshold = value;
        }
    }
    exports.Node = Node;
    class Link {
        constructor(node1, node2, weight) {
            this._node1 = node1;
            this._node2 = node2;
            this._weight = weight;
        }
        get node1() {
            return this._node1;
        }
        get node2() {
            return this._node2;
        }
        get weight() {
            return this._weight;
        }
        set weight(value) {
            this._weight = value;
        }
    }
    exports.Link = Link;
    class AiNeuralNetworkUI {
    }
    exports.AiNeuralNetworkUI = AiNeuralNetworkUI;
    class SVGSlider {
        constructor(path, rangeMin, rangeMax, sliderShape, sliderValue, startPoint = 0, endPoint = path.length()) {
            this.rangeMin = rangeMin;
            this.rangeMax = rangeMax;
            this.sliderShape = sliderShape;
            this.path = path;
            this.sliderValue = sliderValue;
            this.startPoint = startPoint;
            this.endPoint = endPoint;
        }
        static createSlider(path, rangeMin, rangeMax, sliderShape, sliderValue, startPoint = 0, endPoint = path.length) {
            let slider = new SVGSlider(path, rangeMin, rangeMax, sliderShape, sliderValue, startPoint, endPoint());
            return slider;
        }
    }
    exports.SVGSlider = SVGSlider;
    class SVGSliderUtils {
    }
    exports.SVGSliderUtils = SVGSliderUtils;
});
