define(["require", "exports", "interpreter.aiNeuralNetworkModule/source/svgSlider", "interpreter.aiNeuralNetworkModule/source/aiNeuralNetworkUI", "interpreter.aiNeuralNetworkModule/source/svgUtils"], function (require, exports, svgSlider_1, aiNeuralNetworkUI_1, svgUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            this.slider = svgSlider_1.SVGSliderImpl.createSlider(path, LinkUI.RANGE_MIN, LinkUI.RANGE_MAX, circle, this.sliderValueText, aiNeuralNetworkUI_1.AiNeuralNetworkUI.NODE_CIRCLE_RADIUS + LinkUI.SLIDER_SHAPE_RADIUS, path.length() - (aiNeuralNetworkUI_1.AiNeuralNetworkUI.NODE_CIRCLE_RADIUS + LinkUI.SLIDER_SHAPE_RADIUS), this.link.weight);
            this.slider.addEventListener('sliderValueChanged', function (sliderValueData) {
                that.link.weight = sliderValueData.detail;
            });
            this.updateSliderPathOnWeightChange(this.link.weight);
            this.draggable.registerDraggableElement(circle);
        }
        static createPathForLink(link, svg) {
            let node1PositionXY = aiNeuralNetworkUI_1.AiNeuralNetworkUI.getNodeXY(link.node1.positionX, link.node1.positionY);
            let node2PositionXY = aiNeuralNetworkUI_1.AiNeuralNetworkUI.getNodeXY(link.node2.positionX, link.node2.positionY);
            return svgUtils_1.SVGUtils.createPath(svg, node1PositionXY.x, node1PositionXY.y, node2PositionXY.x, node2PositionXY.y);
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
});
