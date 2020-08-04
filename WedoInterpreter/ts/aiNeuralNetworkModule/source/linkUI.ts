import * as SVG from "svgdotjs";
import {Link, SVGSlider} from "interpreter.aiNeuralNetworkModule/source/models";
import {Draggable} from "interpreter.aiNeuralNetworkModule/source/draggable";
import {SVGSliderImpl} from "interpreter.aiNeuralNetworkModule/source/svgSlider";
import {AiNeuralNetworkUI} from "interpreter.aiNeuralNetworkModule/source/aiNeuralNetworkUI";
import {SVGUtils} from "interpreter.aiNeuralNetworkModule/source/svgUtils";

export class LinkUI extends EventTarget {
    private static readonly COLOR_ACTIVE = '#f7ba61';
    private static readonly COLOR_INACTIVE = '#f7ba61';
    private static readonly COLOR_DEFAULT = '#f7ba61';
    private static readonly RANGE_MIN = 0;
    private static readonly RANGE_MAX = 1;
    private static readonly SLIDER_SHAPE_RADIUS: number = 8;
    private static readonly STARTPOINT = 0;
    private slider: SVGSlider;
    private isActivated: boolean = false;
    private sliderValueText: SVG.Text;

    constructor(private readonly link: Link, private svg: SVG.Svg, private draggable: Draggable) {
        super();
        this.sliderValueText = this.svg.text("");
        this.drawSlider();
        this.addLinkListener();
    };

    private drawSlider() {
        let that = this;
        let path: SVG.Path = LinkUI.createPathForLink(this.link, this.svg)
            .stroke(LinkUI.COLOR_DEFAULT);
        let circle: SVG.Shape = this.svg.circle()
            .radius(LinkUI.SLIDER_SHAPE_RADIUS)
            .addClass("sliderShape")

        circle.on("mousedown", function () {
            circle.addClass("sliderShapeMouseDown")
        })

        circle.on("mouseup", function () {
            circle.removeClass("sliderShapeMouseDown")
        })


        this.slider = SVGSliderImpl.createSlider(
            path,
            LinkUI.RANGE_MIN,
            LinkUI.RANGE_MAX,
            circle,
            this.sliderValueText,
            AiNeuralNetworkUI.NODE_CIRCLE_RADIUS+LinkUI.SLIDER_SHAPE_RADIUS,
            path.length()-(AiNeuralNetworkUI.NODE_CIRCLE_RADIUS+LinkUI.SLIDER_SHAPE_RADIUS),
            this.link.weight);
        this.slider.addEventListener('sliderValueChanged', function (sliderValueData: CustomEvent) {
            that.link.weight = sliderValueData.detail;
        });
        this.updateSliderPathOnWeightChange(this.link.weight);
        this.draggable.registerDraggableElement(circle);
    }

    private static createPathForLink(link: Link, svg: SVG.Svg): SVG.Path {
        let node1PositionXY = AiNeuralNetworkUI.getNodeXY(link.node1.positionX, link.node1.positionY);
        let node2PositionXY = AiNeuralNetworkUI.getNodeXY(link.node2.positionX, link.node2.positionY);
        return SVGUtils.createPath(svg, node1PositionXY.x, node1PositionXY.y, node2PositionXY.x, node2PositionXY.y);
    }

    private addLinkListener() {
        let that = this;
        this.link.addEventListener('weightChanged', function (event: CustomEvent) {
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


    private updateSliderPathOnWeightChange(weight: number) {
        let width = weight * 5 + 10;
        this.slider.path.stroke({width: width});
    }

    private activateLink() {
        this.isActivated = true;
        this.slider.path.stroke(LinkUI.COLOR_ACTIVE);
        this.slider.sliderShape.front();
        let event: CustomEvent = new CustomEvent('linkActivated');
        console.log("Link aktiviert");
        this.dispatchEvent(event);
    }

    public deactivateLink() {
        this.isActivated = false;
        this.slider.path.stroke(LinkUI.COLOR_INACTIVE);
        console.log("Link deaktiviert");
    }


}
