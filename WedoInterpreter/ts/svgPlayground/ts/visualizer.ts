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
import {Action, Player, ProblemState, QLearningStep} from "models";
import {Utils} from "utils";
import {ProblemSource} from "models";
import {Svglookup} from "svglookup";
import {qValueLookup} from "qValueLookup";


export class Visualizer extends EventTarget implements ProblemSource {


    private readonly _svg: Svg;
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
    private nodeStartInNaviColour: Path;
    private nodeFinishInNaviColour: Path;
    private nodeFinishNaviBar: Text;
    private nodeStartNaviBar: Text;
    private rho: Text;
    private svgLookup: Svglookup;
    private newQLearnerStepData: QLearningStep;
    private currentOptimalPathArray: Array<number>;
    private currentOptimalPath: Path;
    private clupperHead: Element;
    private qValueLookup: qValueLookup;
    private rhoActiveRectExplore: Path;
    private rhoActiveRectExploit: Path;
    private rhoActiveTextExplore: Text;
    private rhoActiveTextExploit: Text;


    private constructor(svg: Svg) {
        super();
        this._svg = svg;
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
        this.svgLookup = new Svglookup(svg);
        this.newQLearnerStepData = undefined;
        this.qValueLookup = new qValueLookup(5);
    }

    public get svg(): Svg {
        return this._svg;
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

        let allPaths: List<Element> = this._svg.find('g[id^="path-"]');
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
            let notAllowedPath: Path = this.findPathWithID(notAllowedAction.startState.id, notAllowedAction.finishState.id);
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

        let setInitialEpisode: Text = this.svgLookup.getTextElement('#episode_number > text');
        setInitialEpisode.plain('');


        this.rhoActiveRectExplore = this.svgLookup.getPathElement('#explore_rect > rect');
        this.rhoActiveRectExploit = this.svgLookup.getPathElement('#exploit_rect > rect');
        this.rhoActiveTextExplore = this.svgLookup.getTextElement("#explore_text");
        this.rhoActiveTextExploit = this.svgLookup.getTextElement("#exploit_text");

        this.rhoActiveRectExplore.addClass("rho");
        this.rhoActiveRectExploit.addClass("rho");
        this.rhoActiveTextExplore.addClass("rho");
        this.rhoActiveTextExploit.addClass("rho");


        this.nodeStartNaviBar = this.svgLookup.getTextElement('#node-start-navi text');
        this.nodeStartNaviBar.plain('');

        this.nodeFinishNaviBar = this.svgLookup.getTextElement('#node-finish-navi text');
        this.nodeFinishNaviBar.plain('');


        // this.startState.id, this.finishState.id, this.totalTime,this.qLearningSteps.length
    }


    private setStartAndFinishState(startStateID: number, finishStateID: number) {
        this.nodeStartInNaviText = this.svgLookup.getTextElement('#node-start  text');
        this.nodeStartInNaviText.plain('' + startStateID);
        this.nodeStartInNaviColour = this.svgLookup.getPathElement('#node-start path');

        this.nodeFinishInNaviText = this.svgLookup.getTextElement('#node-finish text');
        this.nodeFinishInNaviText.plain('' + finishStateID);
        this.nodeFinishInNaviColour = this.svgLookup.getPathElement('#node-finish path');
    }

    private setTotalTime(totalTime: number) {
        let formattedTime: String = Utils.convertNumberToSeconds(totalTime);
        let timeCurrent: Text = this.svgLookup.getTextElement('#time text');
        timeCurrent.plain('' + formattedTime);
    }

    private setTotalNumberOfEpisodes(totalQLearningSteps: number) {
        let episodeTotal: Text = this.svgLookup.getTextElement('#totalEpisodes > text');
        episodeTotal.plain('' + totalQLearningSteps);
    }


    onQLearningStep(newQLearnerStepDataAndPath: {qLearnerStepData: QLearningStep, optimalPath: Array<number>}, currentTime: number, executionDuration: number) {

        let newQLearnerStepData = newQLearnerStepDataAndPath.qLearnerStepData;
        // this.checkAndUpdateOptimalPath(newQLearnerStepDataAndPath.optimalPath);

        console.log("gotStep! " + newQLearnerStepData.stepNumber);


        console.log("first measure " + Date.now())

        Visualizer.delay(0)
            .then(() => this.showCurrentTime(currentTime))
            .then(() => Visualizer.delay(0.3 * executionDuration))
            .then(() => this.showCurrentEpisode(newQLearnerStepData))
            .then(() => Visualizer.delay(0.1 * executionDuration))
            .then(() => this.showCurrentStartNode(newQLearnerStepData.state, newQLearnerStepData.newState))
            .then(() => Visualizer.delay(0))
            .then(() => this.showCurrentRho(newQLearnerStepData.rho))
            .then(() => Visualizer.delay(0.1 * executionDuration))
            .then(() => this.showCurrentStroke(0.6 * executionDuration, 0.6 * executionDuration, newQLearnerStepData.state, newQLearnerStepData.newState, newQLearnerStepData.qValueNew, 100))
            .then(() => Visualizer.delay(0))
            .then(() => this.showCurrentFinishNode(newQLearnerStepData.state, newQLearnerStepData.newState))
            .then(() => this.showCurrentQValue(newQLearnerStepData.state, newQLearnerStepData.newState, newQLearnerStepData.qValueNew, newQLearnerStepData.highestQValue))
            .then(() => Visualizer.delay(0.6 * executionDuration))
            .then(() => this.showCurrentOptimalPath(newQLearnerStepDataAndPath.optimalPath))
            .then(() => Visualizer.delay(0))
            .then(() => this.resetAllValues(newQLearnerStepData.state, newQLearnerStepData.newState));

    }


    private static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    private showCurrentTime(currentTime: number) {
        console.log("The new q Learnig step " + Date.now())
        let timeCurrent: Text = this.svgLookup.getTextElement('#time > text')
        let clockHand: Path = this.svgLookup.getPathElement('#clockhand');
        clockHand.rotate(-360/60, clockHand.attr("x2"), clockHand.attr("y2"))

        timeCurrent.plain('' + Utils.convertNumberToSeconds(currentTime));
    }

    private showCurrentEpisode(newQLearnerStep: QLearningStep) {
        console.log("Dalay ist zu Ende " + Date.now())
        let episodeCurrent: Text = this.svgLookup.getTextElement('#episode_number > text');
        episodeCurrent.plain('' + newQLearnerStep.stepNumber);
    }

    private showCurrentStartNode(state: number, newState: number) {
        this.nodeStartNaviBar.plain('' + state);

        if (state == this.startStateID || newState == this.startStateID) {
            this.nodeStartInNaviColour.addClass("node-active");
        }

        this.nodeStartOnMap = this.svgLookup.getPathElement('#node-' + state + ' path');
        this.nodeStartOnMap.addClass("node-active");
    }


    private showCurrentRho(currentRho: string) {

        if (currentRho == "erkunde") {
            this.rhoActiveRectExplore.addClass("rho-active");
            this.rhoActiveTextExplore.addClass("rho-text-active");
        } else {
            this.rhoActiveRectExploit.addClass("rho-active")
            this.rhoActiveTextExploit.addClass("rho-text-active");
        }
    }

    private showCurrentStroke(duration: number, timeout: number, state: number, newState: number, qValue: number, maxQValue: number) {
        let path: Path = this.findPathWithID(state, newState);

        let pathLength: number = path.length();
        let pathClone = path.clone();

        pathClone.stroke({opacity: 1});
        pathClone.addTo(this._svg);
        pathClone.addClass("shape-active")
        pathClone.stroke({
            dasharray: 5 + ", " + 35,
            dashoffset: pathLength,
            linecap: "round",
        })

        pathClone.animate(duration, '>').attr("stroke-dashoffset", "0");

        setTimeout(function () {
            pathClone.remove();
            path.stroke({opacity: -(1 / maxQValue) * qValue + 1});
        }, timeout);
    }

    private showCurrentFinishNode(state: number, newState: number,) {
        if (state == this.finishStateID || newState == this.finishStateID) {
            this.nodeFinishInNaviColour.addClass("node-active");
        }

        this.nodeFinishOnMap = this.svgLookup.getPathElement('#node-' + newState + ' path');
        this.nodeFinishOnMap.addClass("node-active");

        this.nodeFinishNaviBar.plain('' + newState);

    }

    private showCurrentQValue(state: number, newState: number, qValue: number, highestQValue: number) {
        let currentQValue: Text = this.svgLookup.getTextElement("#qvalue");
        currentQValue.plain('' + Math.round(qValue));

        let OldNumberOfStars: number = this.qValueLookup.getOldNumberOfStars(state, newState);
        for (let i = 1; i <= OldNumberOfStars; i++) {
            let oldStar = this.svgLookup.getPathElement('#star' + i);
            oldStar.removeClass("star");
            oldStar.addClass("oldStar");
        }

        let NewNumberOfStars: number = this.qValueLookup.getNewNumberOfStars(state, newState, qValue, highestQValue);
        for (let i = 1; i <= NewNumberOfStars; i++) {
            let newStar = this.svgLookup.getPathElement('#star' + i)
            newStar.removeClass("star");
            newStar.addClass("newStar")
        }


        // let currentStar: Path = this.svgLookup.getPathElement("#star" + ).attr({fill: '#f06'});
    }

    private showCurrentOptimalPath(optimalPath: Array<number>) {
        this.checkAndUpdateOptimalPath(optimalPath);
        let currentOptimalPath: Text = this.svgLookup.getTextElement('#navi-optimal-path > text:nth-child(2)');
        let result: string = optimalPath != undefined ? optimalPath.join(' - ') : 'noch nicht gefunden';
        currentOptimalPath.plain(result);
    }





    private resetAllValues(state: number, newState: number) {

        for (let i =  1; i<=5; i++) {
            let star = this.svgLookup.getPathElement('#star' + i)
            star.removeClass("newStar").removeClass("oldStar").addClass("star");
        }

        this.rhoActiveRectExplore.removeClass("rho-active");
        this.rhoActiveRectExploit.removeClass("rho-active");
        this.rhoActiveTextExploit.removeClass("rho-text-active")
        this.rhoActiveTextExplore.removeClass("rho-text-active")

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
        this.nodeFinishNaviBar.plain('');


    }


    private addEventListeners() {
        let buttonStepInto: Element = this.svgLookup.getElement("#navi-step-for-step-button");
        let buttonSpeed1x: Element = this.svgLookup.getElement('#navi-speed-normal');
        let buttonSpeed2x: Element = this.svgLookup.getElement('#navi-speed-2x');
        let buttonSpeed3x: Element = this.svgLookup.getElement('#navi-speed-3x');
        let buttonPause: Element = this.svgLookup.getElement("#navi-pause");
        let buttonStop: Element = this.svgLookup.getElement("#navi-stop");
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


    public getCombinedPath(): Path {
        let combinedPath: Path = undefined;
        for (let actionIndex in this.currentOptimalPathArray) {
            let firstAction: number = this.currentOptimalPathArray[parseInt(actionIndex)];
            let secondAction: number = this.currentOptimalPathArray[parseInt(actionIndex) + 1];
            if (secondAction !== undefined) {
            let actionPath = this.findPathWithID(firstAction, secondAction);
                try {
                    if (combinedPath == undefined) {
                        combinedPath = actionPath.clone();
                    } else {
                        let currentPathArray: Array<PathCommand> = actionPath.array().clone() //get array of path pieces
                        currentPathArray.splice(0, 1); // cut off the first piece of path (Movetto) to seemless combination of passes
                        combinedPath.array().push(...currentPathArray)
                        combinedPath.plot(combinedPath.array());
                    }
                } catch (error) {
                    console.log(combinedPath);
                }
            }
        }
        this.currentOptimalPath = combinedPath;
        return combinedPath;

    }


    /**
     *
     * @param svg
     * @param firstValue
     * @param secondValue
     * @return foundPath in {@link _svg} or null if not found
     */
    private findPathWithID(firstValue, secondValue): Path{
        let selector: string = "#path-" + firstValue + "-" + secondValue + " path "
        var foundPath: Path = this.svgLookup.getPathElement(selector)
        return foundPath;
    }



    private checkAndUpdateOptimalPath(optimalPath: Array<number>) {
        if(this.currentOptimalPathArray == undefined || this.currentOptimalPathArray.join("-") != optimalPath.join("-")) {
            this.currentOptimalPathArray = optimalPath;
            this.drawCurrentOptimalPathOnMap();
        }
    }


    public drawFinalOptimalPath(): Promise<void> {
        let combinedPath = this.getCombinedPath();
        combinedPath.addTo(this._svg.findOne('svg'));
        combinedPath.attr({
            stroke: '#ffffff',
            'stroke-width': 80,
            'stroke-opacity': 1,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            fill: 'none'
        })

        let pathLength = combinedPath.length();

        combinedPath.stroke( {
            dasharray: pathLength + ", " + pathLength,
            dashoffset: pathLength})
        combinedPath.animate(6000, '>').attr("stroke-dashoffset", "0");

        let combinedPathCopy: Path = combinedPath.clone();
        combinedPathCopy.addTo(this._svg.findOne('svg'));
        combinedPathCopy.attr({
            stroke: '#000000',
            'stroke-width': 30,
            'stroke-opacity': 1,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            fill: 'none'
        });
        combinedPathCopy.stroke( {
            dasharray: pathLength + ", " + pathLength,
            dashoffset: pathLength})
        combinedPathCopy.animate(6000, '>').attr("stroke-dashoffset", "0");

        console.log(combinedPath.array())
        console.log(combinedPath.array())
        return new Promise(res => setTimeout(res, 7000));
    }





    private drawCurrentOptimalPathOnMap() {
        if(this.currentOptimalPath != undefined) {
            this.currentOptimalPath.remove();
        }
        let combinedPath = this.getCombinedPath()
        combinedPath.addTo(this._svg);
        combinedPath.addClass("current-optimal-path-on-map");
        let pathLength = combinedPath.length();
        combinedPath.stroke( {
            dasharray: pathLength + ", " + pathLength,
            dashoffset: pathLength})
        combinedPath.animate(6000, '>').attr("stroke-dashoffset", "0");
    }




}


export interface Size {
    width: number;
    height: number;
}