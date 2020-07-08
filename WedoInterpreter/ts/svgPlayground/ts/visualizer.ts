import {Dom, easing, Element, Line, List, Path, Polyline, Runner, Shape, SVG, Svg, Text, Timeline} from "svgdotjs";
import {Action, Player, ProblemState, QLearningStep} from "./models";
import {Utils} from "./utils";
import {ProblemSource} from "./models";


//.size(3148 / 5, 1764 / 5).

export class Visualizer extends EventTarget implements ProblemSource {
    private readonly svg: Svg;
    private nodeStartOnMap: Element;
    private nodeFinishOnMap: Element;
    private path: Path;
    private line: Line;
    private previousShape: Shape;
    private previousOpacity: number;
    private startStateID: number;
    private finishStateID: number;
    private nodeStartInNaviText: Text;
    private nodeFinishInNaviText: Text;
    private nodeStartInNaviColour: Text;
    private nodeFinishInNaviColour: Text;


    private constructor(svg: Svg) {
        super();
        this.svg = svg;
        this.nodeStartOnMap = undefined;
        this.nodeFinishOnMap = undefined;
        this.path = undefined;
        this.line = undefined;
        this.previousShape = undefined;
        this.previousOpacity = 1;
        this.startStateID = undefined;
        this.finishStateID = undefined;
        this.nodeStartInNaviText = undefined;
        this.nodeFinishInNaviText = undefined;
    }


    public static createVisualizer(path: string, htmlSelector: string, size: Size): Promise<Visualizer> {
        let visualizerPromise: Promise<Visualizer> = Visualizer.preload(path, htmlSelector)
            .then(function (svg: Svg) {
                Visualizer.scaleSVGtoSize(svg, size);
                let visualizer: Visualizer = new Visualizer(svg);
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

    private setMarker(notAllowedPath: Path | Line | Polyline | any) {
        try {
            notAllowedPath.marker('start', 10, 10, function (add) {
                add.circle(20).fill('#ff0000')
            })

            notAllowedPath.marker('end', 10, 10, function (add) {
                add.circle(20).fill('#ff0000')
            })
        } catch (error) {
            if (error instanceof TypeError) {
                console.log("Unsupported type for the marker: " + error.message + ". Expected type: line, polyline or path. ")
            }
        }
    }


    //set inital values on map and in the navi
    public setInitialValuesOnMap(startStateID: number, finishStateID: number, totalTime: number, totalQLearningSteps: number) {
        this.startStateID = startStateID;
        this.finishStateID = finishStateID;
        this.setStartAndFinishState(this.startStateID, this.finishStateID);
        this.setTotalNumberOfEpisodes(totalQLearningSteps);
        this.setTotalTime(totalTime);

        let nodeStartNavi: Text = <Text>this.svg.findOne('#node-start-navi text');
        nodeStartNavi.plain('');

        let rho: Text = <Text>this.svg.findOne('#explore_exploit text');
        rho.plain('');


        let nodeEndNavi: Text = <Text>this.svg.findOne('#node-finish-navi text');
        nodeEndNavi.plain('');


        // this.startState.id, this.finishState.id, this.totalTime,this.qLearningSteps.length
    }


    private setStartAndFinishState(startStateID: number, finishStateID: number) {
        this.nodeStartInNaviText = <Text>this.svg.findOne('#node-start  text');
        this.nodeStartInNaviText.plain('' + startStateID);
        this.nodeStartInNaviColour = <Text>this.svg.findOne('#node-start path').addClass("node-not-visited")

        this.nodeFinishInNaviText = <Text>this.svg.findOne('#node-finish text');
        this.nodeFinishInNaviText.plain('' + finishStateID);
        this.nodeFinishInNaviColour = <Text>this.svg.findOne('#node-finish path').addClass("node-not-visited")
    }

    private setTotalTime(totalTime: number) {
        let formattedTime: String = Utils.convertNumberToSeconds(totalTime);
        let timeCurrent: Text = <Text>this.svg.findOne('#time > text:nth-child(1)');
        timeCurrent.plain('' + formattedTime);
    }

    private setTotalNumberOfEpisodes(totalQLearningSteps: number) {
        let episodeTotal: Text = <Text>this.svg.findOne('#episode > text:nth-child(2)');
        episodeTotal.plain('' + totalQLearningSteps);
    }


    onQLearningStep(newQLearnerStep: QLearningStep, currentTime: number) {
        console.log("gotStep! " + newQLearnerStep.stepNumber);

        if (this.nodeStartOnMap) {
            this.nodeStartOnMap.removeClass("node-active").addClass("node-visited")
        }

        if (this.nodeFinishOnMap) {
            this.nodeFinishOnMap.removeClass("node-active").addClass("node-visited")
        }

        if (this.line) {
            this.line.removeClass("line-active")
        }

        if (this.path) {
            this.path.removeClass("path-active")
        }

        if (this.nodeStartOnMap == this.nodeStartInNaviText) {
            this.nodeStartInNaviColour.removeClass("node-active").addClass("node-visited")
        }

        if (this.nodeFinishOnMap == this.nodeFinishInNaviText) {
            this.nodeFinishInNaviColour.removeClass("node-active").addClass("node-visited")
        }


        console.log("first measure " + Date.now())
        Visualizer.delay(50)
            .then(() => this.showCurrentTime(currentTime))
            .then(() => Visualizer.delay(700))
            .then(() => this.showCurrentEpisode(newQLearnerStep));





        let nodeStartNavi: Text = <Text>this.svg.findOne('#node-start-navi text');
        nodeStartNavi.plain('' + newQLearnerStep.state);


        this.visualiseActionOnMap(newQLearnerStep.state, newQLearnerStep.newState, newQLearnerStep.qValueNew, 100);

        let rho: Text = <Text>this.svg.findOne('#explore_exploit text');
        rho.plain('' + newQLearnerStep.rho);


        let nodeEndNavi: Text = <Text>this.svg.findOne('#node-finish-navi text');
        nodeEndNavi.plain('' + newQLearnerStep.newState);


    }

    private showCurrentEpisode(newQLearnerStep: QLearningStep) {
        console.log("Dalay ist zu Ende " + Date.now())
        let episodeCurrent: Text = <Text>this.svg.findOne('#episode > text:nth-child(3)');
        episodeCurrent.plain('' + newQLearnerStep.stepNumber);
    }

    private showCurrentTime(currentTime: number) {
        console.log("The new q Learnig step " + Date.now())
        let timeCurrent: Text = <Text>this.svg.findOne('#time > text:nth-child(1)')
        timeCurrent.plain('' + Utils.convertNumberToSeconds(currentTime));
    }

    private visualiseActionOnMap(state: number, newState: number, qValue: number, maxQValue: number) {

        if (state == this.startStateID || newState == this.startStateID) {
            this.nodeStartInNaviColour.removeClass("node-not-visited").addClass("node-active");
        }
        if (state == this.finishStateID || newState == this.finishStateID) {
            this.nodeFinishInNaviColour.removeClass("node-not-visited").addClass("node-active");
        }


        this.nodeStartOnMap = <Path>this.svg.findOne('#node-' + state + ' path');
        this.nodeStartOnMap.addClass("node-active");

        this.nodeFinishOnMap = <Path>this.svg.findOne('#node-' + newState + ' path');
        this.nodeFinishOnMap.addClass("node-active");

        let shapeGroupId = '#path-' + state + '-' + newState;
        let shapes = this.svg.find(shapeGroupId + ' > path' + "," + shapeGroupId + " line");
        if (shapes.length != 1) {
            console.warn("shape not found or ambiguous");
            return;
        }

        let shape: Shape = <Shape>shapes[0];
        let shapeLength: number = Utils.calcShapeLength(shape);
        let shapeClone = shape.clone();

        shapeClone.addTo(this.svg);
        shapeClone.addClass("shape-active")
        shapeClone.stroke({
            dasharray: 5 + ", " + 35,
            dashoffset: shapeLength,
            linecap: "round",
        })

        shapeClone.animate(800, '>').attr("stroke-dashoffset", "0");

        setTimeout(function () {
            shapeClone.remove();
            shape.stroke({opacity: -(1 / maxQValue) * qValue + 1});
        }, 1000);

    }

    private static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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