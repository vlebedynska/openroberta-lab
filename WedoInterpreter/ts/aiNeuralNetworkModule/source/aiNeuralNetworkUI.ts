import * as SVG from "svgdotjs";
import {Draggable} from "interpreter.aiNeuralNetworkModule/source/draggable";
import {LinkUI} from "interpreter.aiNeuralNetworkModule/source/linkUI";
import {AiNeuralNetwork, Node} from "interpreter.aiNeuralNetworkModule/source/models";

export class AiNeuralNetworkUI extends EventTarget{

    private static readonly colorsMap: Map<string, string> = new Map<string, string>(
        [
            ["R", "#ff3333"],
            ["G", "#00b33c"],
            ["B", "#008ae6"],
            ["default", "#bfbfbf" ]
        ]
    );

    private draggable: Draggable;
    private activeLinkUI: LinkUI;
    public static readonly LAYER_OFFSET_TOP = 90;
    public static readonly LAYER_OFFSET_LEFT = 200;
    public static HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES = 170;
    public static VERTICAL_DISTANCE_BETWEEN_TWO_NODES = 110;
    public static NODE_CIRCLE_RADIUS = 20;
    public static readonly LABEL_OFFSET_LEFT = 30;
    public static readonly LABEL_OFFSET_RIGHT = 30;

    public constructor(public neuralNetwork: AiNeuralNetwork, private svg: SVG.Svg) {
        super();
        this.draggable = Draggable.create(svg);
        this.drawPlayer();
        this.drawNeuralNetwork();
    }


    public drawNeuralNetwork() {
        this.drawLinks(this.neuralNetwork.links);
        this.drawLayer(this.neuralNetwork.layers[0]);
        this.drawLayer(this.neuralNetwork.layers[1]);
    }

    private drawLayer(layer: Array<Node>) {
        for (let node of layer) {
            let nodePositionXY: { x, y } = AiNeuralNetworkUI.getNodeXY(node.positionX, node.positionY);
            let circle: SVG.Circle = this.svg.circle()
                .radius(AiNeuralNetworkUI.NODE_CIRCLE_RADIUS)
                .cx(nodePositionXY.x)
                .cy(nodePositionXY.y)

            this.addNodeColor(circle, node.color);

            let nodeName: string = node.name;
            let text: SVG.Text = this.svg.text("").tspan(nodeName).dy(""+circle.cy());
            if (node.positionX == 0) {
                text.x((circle.cx()-AiNeuralNetworkUI.LABEL_OFFSET_LEFT)).font({anchor: 'end'}).addClass("inputNodeName");
            } else {
                text.x("" + (circle.cx()+AiNeuralNetworkUI.LABEL_OFFSET_RIGHT)).addClass("outputNodeName");
            }

            let nodeValue: SVG.Text = this.svg.plain("0").x(circle.cx()).cy(circle.cy()).font({anchor: 'middle'}).addClass("activeNodeValue");
            node.addEventListener("valueChanged", (e: CustomEvent<number>) => {
                let newValue: number = e.detail;
                nodeValue.plain(""+Math.round(newValue));
            });

        }
    }

    private drawLinks(links) {
        let that = this;
        for (let link of links) {
            let linkUI = new LinkUI(link, this.svg, this.draggable);
            linkUI.addEventListener('linkActivated', function (event: CustomEvent) {
                if (that.activeLinkUI != undefined) {
                    that.activeLinkUI.deactivateLink();
                }
                that.activeLinkUI = this;
            });
        }
    }

    public static getNodeXY(nodePositionX: number, nodePositionY: number): { x, y } {
        let x = AiNeuralNetworkUI.LAYER_OFFSET_LEFT + AiNeuralNetworkUI.HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES * nodePositionX;
        let y = AiNeuralNetworkUI.LAYER_OFFSET_TOP + AiNeuralNetworkUI.VERTICAL_DISTANCE_BETWEEN_TWO_NODES * nodePositionY;
        return {x: x, y: y};
    }

    private addNodeColor(nodeShape: SVG.Circle, nodeColor: string) {
        nodeShape.attr({fill: AiNeuralNetworkUI.colorsMap.get(nodeColor)});
    }




    private drawPlayer() {
        let that = this;

        let background: SVG.Rect = this.svg.rect(99, 36)
            .radius(16.43)
            .addClass("backgroundPlayerButtonsNNModule")
            .id("background");

        let playButton: SVG.Polygon = this.svg.polygon("64.32 7.15 84 18.52 64.32 29.88 64.32 7.15")
            .addClass("buttonNNModule")
            .id("play");

        let pauseButton1: SVG.Rect = this.svg.rect(7.51, 22.97).addClass("buttonNNModule");
        pauseButton1.x(22.33).y(6.86);

        let pauseButton2: SVG.Rect = this.svg.rect(7.51, 22.97).addClass("buttonNNModule");
        pauseButton2.x(35.28).y(6.86);



        playButton.on('click', function () {
            that.dispatchEvent(new CustomEvent<void>("playerStarted"));
            pauseButton1.removeClass("buttonPressed")
            pauseButton2.removeClass("buttonPressed")
            playButton.addClass("buttonPressed")
            console.log("Player started")
        })

        playButton.on('mouseover', function () {
            playButton.addClass("buttonHovered")
        })

        playButton.on('mouseout', function () {
            playButton.removeClass("buttonHovered")
        })


        let groupPause: SVG.Element =  this.svg.group().add(pauseButton1).add(pauseButton2).id("buttonPause");
        groupPause.on('click', function () {
            that.dispatchEvent(new CustomEvent<void>("playerPaused"));
            playButton.removeClass("buttonPressed");
            pauseButton1.addClass("buttonPressed");
            pauseButton2.addClass("buttonPressed");
            console.log("Player paused")
        })


        groupPause.on('mouseover', function () {
            pauseButton1.addClass("buttonHovered")
            pauseButton2.addClass("buttonHovered")
        })

        groupPause.on('mouseout', function () {
            pauseButton1.removeClass("buttonHovered")
            pauseButton2.removeClass("buttonHovered")
        })



        let groupPlayer: SVG.Element = this.svg.group();
        groupPlayer.add(background).add(playButton).add(groupPause);

        groupPlayer.cx(AiNeuralNetworkUI.LAYER_OFFSET_LEFT + AiNeuralNetworkUI.HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES/2);

    }

}