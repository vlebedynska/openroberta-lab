define(["require", "exports", "interpreter.aiNeuralNetworkModule/source/draggable", "interpreter.aiNeuralNetworkModule/source/linkUI"], function (require, exports, draggable_1, linkUI_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AiNeuralNetworkUI {
        constructor(neuralNetwork, svg) {
            this.neuralNetwork = neuralNetwork;
            this.svg = svg;
            this.draggable = draggable_1.Draggable.create(svg);
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
                let nodeValue = this.svg.plain("0").x(circle.cx()).cy(circle.cy()).font({ anchor: 'middle' }).addClass("activeNodeValue");
                node.addEventListener("valueChanged", (e) => {
                    let newValue = e.detail;
                    nodeValue.plain("" + Math.round(newValue));
                });
            }
        }
        drawLinks(links) {
            let that = this;
            for (let link of links) {
                let linkUI = new linkUI_1.LinkUI(link, this.svg, this.draggable);
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
});
