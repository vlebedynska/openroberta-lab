define(["require", "exports", "interpreter.aiNeuralNetworkModule/source/svgUtils"], function (require, exports, svgUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SVGSliderImpl extends EventTarget {
        constructor(path, rangeMin, rangeMax, sliderShape, sliderValueText, startPoint = 0, endPoint = path.length(), sliderValue) {
            super();
            this._path = path;
            this._rangeMin = rangeMax;
            this._rangeMax = rangeMax;
            this._sliderShape = sliderShape;
            this._sliderValueText = sliderValueText;
            this._startPoint = startPoint;
            this._endPoint = endPoint;
            this._sliderValue = sliderValue;
        }
        static createSlider(path, rangeMin, rangeMax, sliderShape, sliderValueText, startPoint, endPoint = path.length(), sliderValue = 0) {
            let slider = new SVGSliderImpl(path, rangeMin, rangeMax, sliderShape, sliderValueText, startPoint, endPoint, sliderValue);
            slider.updateSliderShapePosition(sliderValue);
            slider.sliderShape.on('dragmove', function (e) {
                let mouseEvent = e.detail;
                let m = path.root().point(mouseEvent.pageX, mouseEvent.pageY), p = svgUtils_1.SVGUtils.closestPoint(path.node, m);
                //umrechnen startpoint und endpoint
                slider.updateSliderShapePosition(p.lengthOnPath);
                slider.sliderValueText = slider.sliderValueText.cx(sliderShape.cx()).cy(sliderShape.cy() - 15);
                let sliderShapeCenter = { x: sliderShape.cx(), y: sliderShape.cy() };
                slider.sliderValue = slider.calculateValueOnSlider(p.lengthOnPath);
                // slider.sliderValue = SVGUtils.getPositionOnPath(path, sliderShapeCenter, SVGSliderImpl.ACCURACY, rangeMax);
            });
            return slider;
        }
        set sliderValue(value) {
            this._sliderValue = value;
            // this.updateSliderShapePosition(value);
            // let pointOnPath = this.path.node.getPointAtLength(this.path.node.getTotalLength() * value);
            // this.sliderShape.cx(pointOnPath.x).cy(pointOnPath.y);
            this.updateSliderValueText(value);
            let event = new CustomEvent('sliderValueChanged', { detail: value });
            console.log("slidervalue changed: " + value);
            this.dispatchEvent(event);
        }
        updateSliderShapePosition(p) {
            if (p >= this._startPoint && p <= this._endPoint) {
                this.sliderShape.cx(this.path.node.getPointAtLength(p).x).cy(this.path.node.getPointAtLength(p).y);
            }
            else {
                if (p < this._startPoint) {
                    let minimalPoint = this.path.node.getPointAtLength(this._startPoint);
                    this.sliderShape.cx(minimalPoint.x).cy(minimalPoint.y);
                }
                else {
                    let maximalPoint = this.path.node.getPointAtLength(this._endPoint);
                    this.sliderShape.cx(maximalPoint.x).cy(maximalPoint.y);
                }
            }
        }
        updateSliderValueText(value) {
            let fixedValue = value.toFixed(1);
            fixedValue = fixedValue.replace("\.0", "");
            this.sliderValueText.plain("" + fixedValue);
        }
        calculateValueOnSlider(lengthOnPath) {
            if (lengthOnPath <= this.startPoint) {
                return 0;
            }
            else if (lengthOnPath >= this.endPoint) {
                return 1;
            }
            else {
                let totalPathLength = this.endPoint - this.startPoint;
                return 1 / totalPathLength * lengthOnPath - this.startPoint / totalPathLength;
            }
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
        get rangeMin() {
            return this._rangeMin;
        }
        get rangeMax() {
            return this._rangeMax;
        }
        get startPoint() {
            return this._startPoint;
        }
        get endPoint() {
            return this._endPoint;
        }
    }
    exports.SVGSliderImpl = SVGSliderImpl;
    SVGSliderImpl.ACCURACY = 100;
});
