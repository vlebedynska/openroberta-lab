import {Element, List, SVG, Svg} from "@svgdotjs/svg.js";
import {Section} from "./aiReinforcementLearningModule";
import {Utils} from "./Utils";
import {ProblemSource} from "./models";

//.size(3148 / 5, 1764 / 5).

export class Visualizer implements ProblemSource{
    private readonly svg: Svg;

    private constructor(svg: Svg) {
        this.svg = svg;
    }



    //
    public static createVisualizer(path: string,  htmlSelector: string, size: Size): Promise<Visualizer>{
        let visualizerPromise: Promise<Visualizer> = Visualizer.preload(path, htmlSelector)
            .then(function (svg: Svg) {
                Visualizer.scaleSVGtoSize(svg, size);
                return new Visualizer(svg);
            });
        return visualizerPromise;
    }

    private static preload(path: string, htmlSelector: string): Promise<Svg> {
        let svgPromise: Promise<Svg> = Visualizer.loadSVG(path)
            .then(function (text: string) {
                return Visualizer.addSVGToHTML(text, htmlSelector);
            });
        return svgPromise;
    }

    private static loadSVG(filePath: string): Promise<string> {
        return Utils.file_get_contents(filePath);
    }

    private static addSVGToHTML(text: string, htmlSelector: string): Svg {
        document.querySelector(htmlSelector).innerHTML = "";
        let svg: Svg = SVG().addTo(htmlSelector);
        svg.svg(text);
        svg.viewbox(svg.attr("viewBox"));
        return svg;
    }

    public getSections(): Array<Section> {
        let listOfPaths: Array<Section> = new Array<Section>();

        let allPaths: List<Element> = this.svg.find('g[id^="path-"]');
        allPaths.each(function (item) {
            let idName: string = item.attr("id");
            let tokens: string[] = idName.split("-");
            listOfPaths.push({
                startNode: parseInt(tokens[1]),
                finishNode: parseInt(tokens[2])
            });
        });
        return listOfPaths;
    }

    private static scaleSVGtoSize(svg: Svg, size: Size): void {
        let svgWidthHeight: Size = {
            width: svg.viewbox().width,
            height: svg.viewbox().height
        }
        let newSize: Size = Visualizer.fitInNewSize(svgWidthHeight, size);
        svg.size(newSize.width, newSize.height);
    }

    private static fitInNewSize(originSize: Size, newSize: Size): Size {
        let factorWidth: number = newSize.width / originSize.width;
        let factorHeight: number = newSize.height / originSize.height;
        let factor: number = Math.min(factorWidth, factorHeight);
        return {
            width: originSize.width * factor,
            height: originSize.height * factor
        };
    }

}


export interface Size {
    width: number;
    height: number;
}