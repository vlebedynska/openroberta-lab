import * as SVG from "svgdotjs";
import {Draggable} from "interpreter.aiNeuralNetworkModule/source/draggable";
import {LinkUI} from "interpreter.aiNeuralNetworkModule/source/linkUI";
import {AiNeuralNetwork, Node} from "interpreter.aiNeuralNetworkModule/source/models";

export class AiNeuralNetworkUI{
    private draggable: Draggable;
    private activeLinkUI: LinkUI;
    public static readonly LAYER_OFFSET_TOP = 60;
    public static readonly LAYER_OFFSET_LEFT = 200;
    public static HORIZONTAL_DISTANCE_BETWEEN_TWO_NODES = 170;
    public static VERTICAL_DISTANCE_BETWEEN_TWO_NODES = 110;
    public static NODE_CIRCLE_RADIUS = 20;

    public constructor(public neuralNetwork: AiNeuralNetwork, private svg: SVG.Svg) {
        this.draggable = Draggable.create(svg);
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
                .addClass("inputNode");
            let nodeName: string = node.name;
            let text: SVG.Text = this.svg.text("").tspan(nodeName).dy(""+circle.cy());
            if (node.positionX == 0) {
                text.ax(""+(circle.cx()-175)).addClass("inputNodeName");
            } else {
                text.ax("" + (circle.cx()+30)).addClass("outputNodeName");
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



}