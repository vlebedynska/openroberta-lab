import {
    Dom,
    easing,
    Element,
    Line,
    List,
    Path,
    PathArray, PathCommand,
    Polyline,
    Runner,
    Shape,
    SVG,
    Svg,
    Text,
    Timeline
} from "svgdotjs";
import {Action, Player, ProblemState, QLearningStep} from "./models";
import {Utils} from "./utils";
import {ProblemSource} from "./models";
import {OptimalPathResult, ResultState} from "aiReinforcementLearningModule.ts.ts";


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
    private nodeFinishNaviBar: Text;
    private nodeStartNaviBar: Text;
    private rho: Text;


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
        this.nodeFinishNaviBar = undefined;
        this.nodeStartNaviBar = undefined;
        this.rho = undefined;
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
            let notAllowedPath: Path = <Path>this.svg.findOne("#path-" + notAllowedAction.startState.id + "-" + notAllowedAction.finishState.id + " path");
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
            notAllowedPath.marker('start', 5, 5, function (add) {
                add.circle(5).fill('#ff0000')
            })

            notAllowedPath.marker('end', 5, 5, function (add) {
                add.circle(5).fill('#ff0000')
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

        let setInitialEpisode: Text = <Text>this.svg.findOne('#episode > text:nth-child(3)');
        setInitialEpisode.plain('');


        this.nodeStartNaviBar = <Text>this.svg.findOne('#node-start-navi text');
        this.nodeStartNaviBar.plain('');

        this.rho = <Text>this.svg.findOne('#explore_exploit text');
        this.rho.plain('');

        this.nodeFinishNaviBar = <Text>this.svg.findOne('#node-finish-navi text');
        this.nodeFinishNaviBar.plain('');


        // this.startState.id, this.finishState.id, this.totalTime,this.qLearningSteps.length
    }


    private setStartAndFinishState(startStateID: number, finishStateID: number) {
        this.nodeStartInNaviText = <Text>this.svg.findOne('#node-start  text');
        this.nodeStartInNaviText.plain('' + startStateID);
        this.nodeStartInNaviColour = <Text>this.svg.findOne('#node-start path');

        this.nodeFinishInNaviText = <Text>this.svg.findOne('#node-finish text');
        this.nodeFinishInNaviText.plain('' + finishStateID);
        this.nodeFinishInNaviColour = <Text>this.svg.findOne('#node-finish path');
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


    onQLearningStep(newQLearnerStepDataAndPath: {qLearnerStepData: QLearningStep, optimalPath: Array<number>}, currentTime: number, executionDuration: number) {

        let newQLearnerStep = newQLearnerStepDataAndPath.qLearnerStepData;

        console.log("gotStep! " + newQLearnerStep.stepNumber);


        console.log("first measure " + Date.now())

        Visualizer.delay(0)
            .then(() => this.showCurrentTime(currentTime))
            .then(() => Visualizer.delay(0))
            .then(() => this.showCurrentEpisode(newQLearnerStep))
            .then(() => Visualizer.delay(0.1 * executionDuration))
            .then(() => this.showCurrentStartNode(newQLearnerStep.state, newQLearnerStep.newState))
            .then(() => Visualizer.delay(0))
            .then(() => this.showCurrentRho(newQLearnerStep.rho))
            .then(() => Visualizer.delay(0.1 * executionDuration))
            .then(() => this.showCurrentStroke(0.6 * executionDuration, 0.6 * executionDuration, newQLearnerStep.state, newQLearnerStep.newState, newQLearnerStep.qValueNew, 100))
            .then(() => Visualizer.delay(0))
            .then(() => this.showCurrentFinishNode(newQLearnerStep.state, newQLearnerStep.newState))
            .then(() => Visualizer.delay(0.6 * executionDuration))
            .then(() => this.showCurrentOptimalPath(newQLearnerStepDataAndPath.optimalPath))
            .then(() => Visualizer.delay(0))
            .then(() => this.resetAllValues(newQLearnerStep.state, newQLearnerStep.newState));

    }


    private static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    private showCurrentTime(currentTime: number) {
        console.log("The new q Learnig step " + Date.now())
        let timeCurrent: Text = <Text>this.svg.findOne('#time > text:nth-child(1)')
        timeCurrent.plain('' + Utils.convertNumberToSeconds(currentTime));
    }

    private showCurrentEpisode(newQLearnerStep: QLearningStep) {
        console.log("Dalay ist zu Ende " + Date.now())
        let episodeCurrent: Text = <Text>this.svg.findOne('#episode > text:nth-child(3)');
        episodeCurrent.plain('' + newQLearnerStep.stepNumber);
    }

    private showCurrentStartNode(state: number, newState: number) {
        this.nodeStartNaviBar.plain('' + state);

        if (state == this.startStateID || newState == this.startStateID) {
            this.nodeStartInNaviColour.addClass("node-active");
        }

        this.nodeStartOnMap = <Path>this.svg.findOne('#node-' + state + ' path');
        this.nodeStartOnMap.addClass("node-active");
    }


    private showCurrentRho(currentRho: string) {
        this.rho.plain('' + currentRho);
    }

    private showCurrentStroke(duration: number, timeout: number, state: number, newState: number, qValue: number, maxQValue: number) {
        let shapeGroupId = '#path-' + state + '-' + newState;
        let shapes = this.svg.find(shapeGroupId + ' > path' + "," + shapeGroupId + " line");
        if (shapes.length != 1) {
            console.warn("shape not found or ambiguous");
            return;
        }

        let shape: Shape = <Shape>shapes[0];
        let shapeLength: number = Utils.calcShapeLength(shape);
        let shapeClone = shape.clone();

        shapeClone.stroke({opacity: 1});
        shapeClone.addTo(this.svg);
        shapeClone.addClass("shape-active")
        shapeClone.stroke({
            dasharray: 5 + ", " + 35,
            dashoffset: shapeLength,
            linecap: "round",
        })

        shapeClone.animate(duration, '>').attr("stroke-dashoffset", "0");

        setTimeout(function () {
            shapeClone.remove();
            shape.stroke({opacity: -(1 / maxQValue) * qValue + 1});
        }, timeout);

    }

    private showCurrentFinishNode(state: number, newState: number,) {
        if (state == this.finishStateID || newState == this.finishStateID) {
            this.nodeFinishInNaviColour.addClass("node-active");
        }

        this.nodeFinishOnMap = <Path>this.svg.findOne('#node-' + newState + ' path');
        this.nodeFinishOnMap.addClass("node-active");

        this.nodeFinishNaviBar.plain('' + newState);

    }



    private showCurrentOptimalPath(optimalPath: Array<number>) {
        let currentOptimalPath: Text = <Text>this.svg.findOne('#navi-optimal-path > text:nth-child(2)');
        let result: string = optimalPath != undefined ? optimalPath.join(' - ') : 'noch nicht gefunden';
        currentOptimalPath.plain(result);
    }





    private resetAllValues(state: number, newState: number) {
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

        if (state == this.startStateID || newState == this.startStateID) {
            this.nodeStartInNaviColour.removeClass("node-active").addClass("node-visited")
        }

        if (state == this.finishStateID || newState == this.finishStateID) {
            this.nodeFinishInNaviColour.removeClass("node-active").addClass("node-visited")
        }

        this.nodeStartNaviBar.plain('');
        this.rho.plain('');
        this.nodeFinishNaviBar.plain('');
    }


    private addEventListeners() {
        let buttonStepInto: Element = <Element>this.svg.findOne("#navi-step-for-step-button");
        let buttonSpeed1x: Element = <Element>this.svg.findOne('#navi-speed-normal');
        let buttonSpeed2x: Element = <Element>this.svg.findOne('#navi-speed-2x');
        let buttonSpeed3x: Element = <Element>this.svg.findOne('#navi-speed-3x');
        let buttonPause: Element = <Element>this.svg.findOne("#navi-pause")
        let buttonStop: Element = <Element>this.svg.findOne("#navi-stop")
        let that = this;

        buttonStepInto.click(function (e) {
            that.startPlayerForOneTick(0.1);
        });
        buttonStepInto.addClass("navi-button")


        buttonSpeed1x.click(function (e) {
            that.startPlayer(0.5);
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

    private startPlayerForOneTick(speed: number) {
        this.dispatchEvent(new CustomEvent("playerStartedForOneStep", {
                detail: speed
            })
        );
    }


    public drawPath(actions: Array<number>) {
        let combinedPath: Path = undefined;
        for (let actionIndex in actions) {
            let firstAction: number = actions[parseInt(actionIndex)];
            let secondAction: number = actions[parseInt(actionIndex) + 1];
            let actionPath = Visualizer.findPathWithID(this.svg, firstAction, secondAction)
            if (secondAction !== undefined) {
                try {
                    if (combinedPath == undefined) {
                        combinedPath = actionPath;
                    } else {
                        let currentPathArray: PathArray = actionPath.array() //get array of path pieces
                        let currentPathArrayWithoutMovetto: PathCommand[]=  currentPathArray.splice(0, 1); // cut off the first piece of path (Movetto) to seemless combination of passes
                        combinedPath.array().push(...currentPathArray)
                        combinedPath.plot(combinedPath.array());
                    }
                } catch (error) {
                    console.log(combinedPath);
                }
            }
        }
        combinedPath.addTo(this.svg);
        combinedPath.addClass('line-follower-outside');
        // combinedPath.stroke({width: 80, color: '#ffffff', opacity: 1, linecap: 'round', linejoin: 'round'})
        //     .fill('none');

        let combinedPathCopy: Path = combinedPath.clone();
        combinedPathCopy.addTo(this.svg);
        combinedPathCopy.addClass('line-follower-inside')
        // combinedPathCopy.stroke({width: 30, color: '#000000'})
        //     .fill('none');
        console.log(combinedPath.array())

    }



    /**
     *
     * @param svg
     * @param firstValue
     * @param secondValue
     * @return foundPath in {@link svg} or null if not found
     */
    static findPathWithID(svg, firstValue, secondValue): Path{
        const linkIDPrefix = "path-";
        var foundPath = svg.findOne('#' + linkIDPrefix + firstValue + "-" + secondValue + " path ")
        return <Path>foundPath;
    }




}


export interface Size {
    width: number;
    height: number;
}