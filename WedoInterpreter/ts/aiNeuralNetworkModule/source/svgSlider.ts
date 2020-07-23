import * as SVG from "svgdotjs";
import {SVGSlider} from "interpreter.aiNeuralNetworkModule/source/models";
import {SVGUtils} from "interpreter.aiNeuralNetworkModule/source/svgUtils";



export class SVGSliderImpl extends EventTarget implements SVGSlider{


    private readonly _path: SVG.Path;
    private readonly _rangeMin: number;
    private readonly _rangeMax: number;
    private readonly _sliderShape: SVG.Shape;
    private readonly _startPoint: number;
    private readonly _endPoint: number;
    private _sliderValue: number;
    private _sliderValueText: SVG.Text;

    private static readonly ACCURACY = 100;

    private constructor(path: SVG.Path, rangeMin: number, rangeMax: number, sliderShape: SVG.Shape, sliderValueText: SVG.Text, startPoint = 0, endPoint = path.length(), sliderValue: number) {
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




    public static createSlider(path: SVG.Path, rangeMin: number, rangeMax: number, sliderShape: SVG.Shape, sliderValueText: SVG.Text, startPoint: number, endPoint = path.length(), sliderValue = 0): SVGSlider {
        let slider = new SVGSliderImpl(path, rangeMin, rangeMax, sliderShape, sliderValueText, startPoint, endPoint, sliderValue);
        slider.updateSliderShapePosition(sliderValue);

        slider.sliderShape.on('dragmove', function (e) {
            let mouseEvent: MouseEvent = e.detail;
            let m = path.root().point(mouseEvent.pageX, mouseEvent.pageY),
                p = SVGUtils.closestPoint(path.node, m);
            //umrechnen startpoint und endpoint
            slider.updateSliderShapePosition(p.lengthOnPath);

            slider.sliderValueText = slider.sliderValueText.cx(sliderShape.cx()).cy(sliderShape.cy()-15);
            let sliderShapeCenter = {x: sliderShape.cx(), y: sliderShape.cy()};
            slider.sliderValue = slider.calculateValueOnSlider(p.lengthOnPath);
            // slider.sliderValue = SVGUtils.getPositionOnPath(path, sliderShapeCenter, SVGSliderImpl.ACCURACY, rangeMax);
        });
        return slider;
    }


    set sliderValue(value: number) {
        this._sliderValue = value;

        // this.updateSliderShapePosition(value);
        // let pointOnPath = this.path.node.getPointAtLength(this.path.node.getTotalLength() * value);
        // this.sliderShape.cx(pointOnPath.x).cy(pointOnPath.y);

        this.updateSliderValueText(value);
        let event: CustomEvent = new CustomEvent<number>('sliderValueChanged', {detail: value});
        console.log("slidervalue changed: " + value);
        this.dispatchEvent(event);

    }

    private updateSliderShapePosition(p: number) {

        if (p >= this._startPoint && p <= this._endPoint ) {
            this.sliderShape.cx(this.path.node.getPointAtLength(p).x).cy(this.path.node.getPointAtLength(p).y);
        } else {
            if (p < this._startPoint) {
                let minimalPoint = this.path.node.getPointAtLength(this._startPoint);
                this.sliderShape.cx(minimalPoint.x).cy(minimalPoint.y);
            } else {
                let maximalPoint = this.path.node.getPointAtLength(this._endPoint);
                this.sliderShape.cx(maximalPoint.x).cy(maximalPoint.y);
            }

        }
    }

    private updateSliderValueText(value: number) {
        let fixedValue = value.toFixed(1);
        fixedValue = fixedValue.replace("\.0", "")
        this.sliderValueText.plain(""+fixedValue);
    }



    private calculateValueOnSlider(lengthOnPath: number): number{
        if (lengthOnPath <= this.startPoint) {
            return 0;
        } else if (lengthOnPath >= this.endPoint) {
            return 1;
        } else {
            let totalPathLength = this.endPoint-this.startPoint;
            return 1/totalPathLength * lengthOnPath - this.startPoint/totalPathLength;
        }

    }


    get path(): SVG.Path {
        return this._path;
    }

    get sliderShape(): SVG.Shape {
        return this._sliderShape;
    }

    get sliderValue(): number {
        return this._sliderValue;
    }

    set sliderValueText(value: SVG.Text) {
        this._sliderValueText = value;
    }
    get sliderValueText(): SVG.Text {
        return this._sliderValueText;
    }

    get rangeMin(): number {
        return this._rangeMin;
    }

    get rangeMax(): number {
        return this._rangeMax;
    }

    get startPoint(): number {
        return this._startPoint;
    }

    get endPoint(): number {
        return this._endPoint;
    }



}

