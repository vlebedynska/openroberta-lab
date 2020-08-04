define(["require", "exports", "interpreter.aiNeuralNetworkModule/source/draggable", "interpreter.aiNeuralNetworkModule/source/linkUI"], function (require, exports, draggable_1, linkUI_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AiNeuralNetworkUI extends EventTarget {
        constructor(neuralNetwork, svg) {
            super();
            this.neuralNetwork = neuralNetwork;
            this.svg = svg;
            this.draggable = draggable_1.Draggable.create(svg);
            this.drawPlayer();
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
                    .cy(nodePositionXY.y);
                this.addNodeColor(circle, node.color);
                let nodeName = node.name;
                let text = this.svg.text("").tspan(nodeName).dy("" + circle.cy());
                if (node.positionX == 0) {
                    text.x((circle.cx() - AiNeuralNetworkUI.LABEL_OFFSET_LEFT)).font({ anchor: 'end' }).addClass("inputNodeName");
                }
                else {
                    text.x("" + (circle.cx() + AiNeuralNetworkUI.LABEL_OFFSET_RIGHT)).addClass("outputNodeName");
                }
                let normalizedNodeValue = value => Math.round(value);
                let nodeValue = this.svg.plain("" + normalizedNodeValue(node.value)).x(circle.cx()).cy(circle.cy()).font({ anchor: 'middle' }).addClass("activeNodeValue");
                node.addEventListener("valueChanged", (e) => {
                    let newValue = e.detail;
                    nodeValue.plain("" + normalizedNodeValue(newValue));
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
        addNodeColor(nodeShape, nodeColor) {
            nodeShape.attr({ fill: AiNeuralNetworkUI.colorsMap.get(nodeColor) });
        }
        drawPlayer() {
            let that = this;
            let background = this.svg.rect(99, 36)
                .radius(16.43)
                .addClass("backgroundPlayerButtonsNNModule")
                .id("background");
            let playButton = this.svg.polygon("64.32 7.15 84 18.52 64.32 29.88 64.32 7.15")
                .addClass("buttonNNModule")
                .id("play");
            let pauseButton1 = this.svg.rect(7.51, 22.97).addClass("buttonNNModule");
            pauseButton1.x(22.33).y(6.86);
            let pauseButton2 = this.svg.rect(7.51, 22.97).addClass("buttonNNModule");
            pauseButton2.x(35.28).y(6.86);
            playButton.on('click', function () {
                that.dispatchEvent(new CustomEvent("playerStarted"));
                pauseButton1.removeClass("buttonPressed");
                pauseButton2.removeClass("buttonPressed");
                playButton.addClass("buttonPressed");
                console.log("Player started");
            });
            playButton.on('mouseover', function () {
                playButton.addClass("buttonHovered");
            });
            playButton.on('mouseout', function () {
                playButton.removeClass("buttonHovered");
            });
            let groupPause = this.svg.group().add(pauseButton1).add(pauseButton2).id("buttonPause");
            groupPause.on('click', function () {
                that.dispatchEvent(new CustomEvent("playerPaused"));
                playButton.removeClass("buttonPressed");
                pauseButton1.addClass("buttonPressed");
                pauseButton2.addClass("buttonPressed");
                console.log("Player paused");
            });
            groupPause.on('mouseover', function () {
                pauseButton1.addClass("buttonHovered");
                pauseButton2.addClass("buttonHovered");
            });
            groupPause.on('mouseout', function () {
                pauseButton1.removeClass("buttonHovered");
                pauseButton2.removeClass("buttonHovered");
            });
            let groupPlayer = this.svg.group();
            groupPlayer.add(background).add(playButton).add(groupPause);
            groupPlayer.cx(AiNeuralNetworkUI.LAYER_OFFSET_LEFT + AiNeuralNetworkUI.HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES / 2);
        }
    }
    exports.AiNeuralNetworkUI = AiNeuralNetworkUI;
    AiNeuralNetworkUI.colorsMap = new Map([
        ["R", "#fa6b6b"],
        ["G", "#6ce08a"],
        ["B", "#95c9fa"],
        ["BLACK", "#555454"],
        ["YELLOW", "#f7d117"],
        ["GREEN", "#6ce08a"],
        ["BROWN", "#a58070"],
        ["GREY", "#c7c4c4"],
        ["RED", "#fa6b6b"],
        ["WHITE", "#ffffff"],
        ["BLUE", "#95c9fa"],
        ["NONE", "#bfbfbf"],
        ["ORANGE", "#F7D118"],
        ["default", "#69b0bb"]
    ]);
    AiNeuralNetworkUI.LAYER_OFFSET_TOP = 90;
    AiNeuralNetworkUI.LAYER_OFFSET_LEFT = 200;
    AiNeuralNetworkUI.HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES = 170;
    AiNeuralNetworkUI.VERTICAL_DISTANCE_BETWEEN_TWO_NODES = 110;
    AiNeuralNetworkUI.NODE_CIRCLE_RADIUS = 20;
    AiNeuralNetworkUI.LABEL_OFFSET_LEFT = 30;
    AiNeuralNetworkUI.LABEL_OFFSET_RIGHT = 30;
});
