import {Dom, Element, Line, List, Path, Polyline, Shape, SVG, Svg, Text} from "svgdotjs";
import {Action, Player, QLearningStep} from "./models";
import {Utils} from "./utils";
import {ProblemSource} from "./models";


//.size(3148 / 5, 1764 / 5).

export class Visualizer extends EventTarget implements ProblemSource{
    private readonly svg: Svg;

    private constructor(svg: Svg) {
        super();
        this.svg = svg;
    }



    public static createVisualizer(path: string,  htmlSelector: string, size: Size): Promise<Visualizer>{
        let visualizerPromise: Promise<Visualizer> = Visualizer.preload(path, htmlSelector)
            .then(function (svg: Svg) {
                Visualizer.scaleSVGtoSize(svg, size);
                let visualizer: Visualizer =  new Visualizer(svg);
                visualizer.addEventListeners();
                return visualizer;
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
        svg.viewbox(svg.findOne('svg').attr("viewBox"));
        return svg;
    }

    public getActions(): Array<Action> {
        let listOfPaths: Array<Action> = new Array<Action>();

        let allPaths: List<Element> = this.svg.find('g[id^="path-"]');
        allPaths.each(function (item) {
            let idName: string = item.attr("id");
            let tokens: string[] = idName.split("-");
            listOfPaths.push({
                startState: {
                    id: parseInt(tokens[1])
                },
                finishState: {
                    id: parseInt(tokens[2])
                }
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

    setPlayer(player: Player) {

    }

    processNotAllowedActions(notAllowedActions: Array<Action>) {
        for (let notAllowedAction of notAllowedActions) {
            let notAllowedPath: Shape = <Shape>this.svg.findOne('g[id^="path-"]' + notAllowedAction.startState.id + "-" + notAllowedAction.finishState.id + " path|line|polyline");
            notAllowedPath.attr({
                stroke: 'red',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': 7,
                'stroke-dasharray': '12 24'
            })
            this.setMarker(notAllowedPath);
            //document.querySelector(notAllowedPath).innerHTML = ""
        }
    }

    private setMarker(notAllowedPath: Path|Line|Polyline|any) {
        try {
            notAllowedPath.marker('start', 10, 10, function(add) {
                add.circle(20).fill('#ff0000')
            })

            notAllowedPath.marker('end', 10, 10, function(add) {
                add.circle(20).fill('#ff0000')
            })
        } catch (error) {
            if (error instanceof TypeError) {
                console.log("Unsupported type for the marker: " + error.message + ". Expected type: line, polyline or path. ")
            }
        }
    }


    onQLearningStep(newQLearnerStep: QLearningStep, currentTime: number){
        console.log("gotStep! " + newQLearnerStep.stepNumber);
        let nodeStart: Text = <Text>this.svg.findOne('#node-start-navi > text');
        nodeStart.plain('' + newQLearnerStep.state);
    }


    private addEventListeners() {
        let buttonSpeed1x: Element = <Element>this.svg.findOne('#navi-speed-normal');
        let buttonSpeed2x: Element = <Element>this.svg.findOne('#navi-speed-2x');
        let buttonSpeed3x: Element = <Element>this.svg.findOne('#navi-speed-3x');
        let buttonPause: Element = <Element>this.svg.findOne("#navi-pause")
        let buttonStop: Element = <Element>this.svg.findOne("#navi-stop")
        let that = this;
        buttonSpeed1x.click(function (e) {
            that.startPlayer(1);
        });
        buttonSpeed1x.addClass("navi-button");


        buttonSpeed2x.click(function (e) {
            that.startPlayer(100)
        });
        buttonSpeed2x.addClass("navi-button")


        buttonSpeed3x.click(function (e) {
            that.startPlayer(1000)
        });
        buttonSpeed3x.addClass("navi-button")


        buttonStop.click(function (e) {
            that.stopPlayer()
        })
        buttonStop.addClass("navi-button")

        buttonPause.click(function (e) {
            that.pausePlayer()
        })
        buttonPause.addClass("navi-button")
    }

    private startPlayer(speed: number) {
        console.log("playerStarted!");
        this.dispatchEvent(new CustomEvent<number>("playerStarted", {
                detail: speed
            })
        );
    }

    private stopPlayer() {
        this.dispatchEvent(new CustomEvent("playerStopped"))
    }

    private pausePlayer() {
        this.dispatchEvent(new CustomEvent("playerPaused"))
    }



}




export interface Size {
    width: number;
    height: number;
}