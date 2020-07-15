define(["require", "exports", "svgdotjs", "utils", "svglookup"], function (require, exports, svgdotjs_1, utils_1, svglookup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Visualizer extends EventTarget {
        constructor(svg) {
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
            this.rho = undefined;
            this.svgLookup = new svglookup_1.Svglookup(svg);
            this.newQLearnerStepData = undefined;
        }
        get svg() {
            return this._svg;
        }
        static createVisualizer(path, htmlSelector, size) {
            let visualizerPromise = Visualizer.preload(path, htmlSelector)
                .then(function (svg) {
                Visualizer.scaleSVGtoSize(svg, size);
                let visualizer = new Visualizer(svg);
                visualizer.addEventListeners();
                return visualizer;
            });
            return visualizerPromise;
        }
        static preload(path, htmlSelector) {
            let svgPromise = Visualizer.loadSVG(path)
                .then(function (text) {
                return Visualizer.addSVGToHTML(text, htmlSelector);
            });
            return svgPromise;
        }
        static loadSVG(filePath) {
            return utils_1.Utils.file_get_contents(filePath);
        }
        static addSVGToHTML(text, htmlSelector) {
            document.querySelector(htmlSelector).innerHTML = "";
            let svg = svgdotjs_1.SVG().addTo(htmlSelector);
            svg.svg(text);
            svg.viewbox(svg.findOne('svg').attr("viewBox"));
            return svg;
        }
        getActions() {
            let listOfPaths = new Array();
            let allPaths = this._svg.find('g[id^="path-"]');
            allPaths.each(function (item) {
                let idName = item.attr("id");
                let tokens = idName.split("-");
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
        static scaleSVGtoSize(svg, size) {
            let svgWidthHeight = {
                width: svg.viewbox().width,
                height: svg.viewbox().height
            };
            let newSize = Visualizer.fitInNewSize(svgWidthHeight, size);
            svg.size(newSize.width, newSize.height);
        }
        static fitInNewSize(originSize, newSize) {
            let factorWidth = newSize.width / originSize.width;
            let factorHeight = newSize.height / originSize.height;
            let factor = Math.min(factorWidth, factorHeight);
            return {
                width: originSize.width * factor,
                height: originSize.height * factor
            };
        }
        processNotAllowedActions(notAllowedActions) {
            for (let notAllowedAction of notAllowedActions) {
                let notAllowedPath = this.findPathWithID(notAllowedAction.startState.id, notAllowedAction.finishState.id);
                notAllowedPath.attr({
                    stroke: 'red',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': 7,
                    'stroke-dasharray': '12 24'
                });
                this.setMarker(notAllowedPath);
                //document.querySelector(notAllowedPath).innerHTML = ""
            }
        }
        setMarker(notAllowedPath) {
            try {
                notAllowedPath.marker('start', 5, 5, function (add) {
                    add.circle(5).fill('#ff0000');
                });
                notAllowedPath.marker('end', 5, 5, function (add) {
                    add.circle(5).fill('#ff0000');
                });
            }
            catch (error) {
                if (error instanceof TypeError) {
                    console.log("Unsupported type for the marker: " + error.message + ". Expected type: line, polyline or path. ");
                }
            }
        }
        //set inital values on map and in the navi
        setInitialValuesOnMap(startStateID, finishStateID, totalTime, totalQLearningSteps) {
            this.startStateID = startStateID;
            this.finishStateID = finishStateID;
            this.setStartAndFinishState(this.startStateID, this.finishStateID);
            this.setTotalNumberOfEpisodes(totalQLearningSteps);
            this.setTotalTime(totalTime);
            let setInitialEpisode = this.svgLookup.getTextElement('#episode > text:nth-child(3)');
            setInitialEpisode.plain('');
            this.nodeStartNaviBar = this.svgLookup.getTextElement('#node-start-navi text');
            this.nodeStartNaviBar.plain('');
            this.rho = this.svgLookup.getTextElement('#explore_exploit text');
            this.rho.plain('');
            this.nodeFinishNaviBar = this.svgLookup.getTextElement('#node-finish-navi text');
            this.nodeFinishNaviBar.plain('');
            // this.startState.id, this.finishState.id, this.totalTime,this.qLearningSteps.length
        }
        setStartAndFinishState(startStateID, finishStateID) {
            this.nodeStartInNaviText = this.svgLookup.getTextElement('#node-start  text');
            this.nodeStartInNaviText.plain('' + startStateID);
            this.nodeStartInNaviColour = this.svgLookup.getTextElement('#node-start path');
            this.nodeFinishInNaviText = this.svgLookup.getTextElement('#node-finish text');
            this.nodeFinishInNaviText.plain('' + finishStateID);
            this.nodeFinishInNaviColour = this.svgLookup.getTextElement('#node-finish path');
        }
        setTotalTime(totalTime) {
            let formattedTime = utils_1.Utils.convertNumberToSeconds(totalTime);
            let timeCurrent = this.svgLookup.getTextElement('#time > text:nth-child(1)');
            timeCurrent.plain('' + formattedTime);
        }
        setTotalNumberOfEpisodes(totalQLearningSteps) {
            let episodeTotal = this.svgLookup.getTextElement('#episode > text:nth-child(2)');
            episodeTotal.plain('' + totalQLearningSteps);
        }
        onQLearningStep(newQLearnerStepDataAndPath, currentTime, executionDuration) {
            this.newQLearnerStepData = newQLearnerStepDataAndPath.qLearnerStepData;
            // this.checkAndUpdateOptimalPath(newQLearnerStepDataAndPath.optimalPath);
            console.log("gotStep! " + this.newQLearnerStepData.stepNumber);
            console.log("first measure " + Date.now());
            Visualizer.delay(0)
                .then(() => this.showCurrentTime(currentTime))
                .then(() => Visualizer.delay(0))
                .then(() => this.showCurrentEpisode(this.newQLearnerStepData))
                .then(() => Visualizer.delay(0.1 * executionDuration))
                .then(() => this.showCurrentStartNode(this.newQLearnerStepData.state, this.newQLearnerStepData.newState))
                .then(() => Visualizer.delay(0))
                .then(() => this.showCurrentRho(this.newQLearnerStepData.rho))
                .then(() => Visualizer.delay(0.1 * executionDuration))
                .then(() => this.showCurrentStroke(0.6 * executionDuration, 0.6 * executionDuration, this.newQLearnerStepData.state, this.newQLearnerStepData.newState, this.newQLearnerStepData.qValueNew, 100))
                .then(() => Visualizer.delay(0))
                .then(() => this.showCurrentFinishNode(this.newQLearnerStepData.state, this.newQLearnerStepData.newState))
                .then(() => Visualizer.delay(0.6 * executionDuration))
                .then(() => this.showCurrentOptimalPath(newQLearnerStepDataAndPath.optimalPath))
                .then(() => Visualizer.delay(0))
                .then(() => this.resetAllValues(this.newQLearnerStepData.state, this.newQLearnerStepData.newState));
        }
        static delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        showCurrentTime(currentTime) {
            console.log("The new q Learnig step " + Date.now());
            let timeCurrent = this.svgLookup.getTextElement('#time > text:nth-child(1)');
            timeCurrent.plain('' + utils_1.Utils.convertNumberToSeconds(currentTime));
        }
        showCurrentEpisode(newQLearnerStep) {
            console.log("Dalay ist zu Ende " + Date.now());
            let episodeCurrent = this.svgLookup.getTextElement('#episode > text:nth-child(3)');
            episodeCurrent.plain('' + newQLearnerStep.stepNumber);
        }
        showCurrentStartNode(state, newState) {
            this.nodeStartNaviBar.plain('' + state);
            if (state == this.startStateID || newState == this.startStateID) {
                this.nodeStartInNaviColour.addClass("node-active");
            }
            this.nodeStartOnMap = this.svgLookup.getPathElement('#node-' + state + ' path');
            this.nodeStartOnMap.addClass("node-active");
        }
        showCurrentRho(currentRho) {
            this.rho.plain('' + currentRho);
        }
        showCurrentStroke(duration, timeout, state, newState, qValue, maxQValue) {
            let path = this.findPathWithID(state, newState);
            let pathLength = path.length();
            let pathClone = path.clone();
            pathClone.stroke({ opacity: 1 });
            pathClone.addTo(this._svg);
            pathClone.addClass("shape-active");
            pathClone.stroke({
                dasharray: 5 + ", " + 35,
                dashoffset: pathLength,
                linecap: "round",
            });
            pathClone.animate(duration, '>').attr("stroke-dashoffset", "0");
            setTimeout(function () {
                pathClone.remove();
                path.stroke({ opacity: -(1 / maxQValue) * qValue + 1 });
            }, timeout);
        }
        showCurrentFinishNode(state, newState) {
            if (state == this.finishStateID || newState == this.finishStateID) {
                this.nodeFinishInNaviColour.addClass("node-active");
            }
            this.nodeFinishOnMap = this.svgLookup.getPathElement('#node-' + newState + ' path');
            this.nodeFinishOnMap.addClass("node-active");
            this.nodeFinishNaviBar.plain('' + newState);
        }
        showCurrentOptimalPath(optimalPath) {
            this.checkAndUpdateOptimalPath(optimalPath);
            let currentOptimalPath = this.svgLookup.getTextElement('#navi-optimal-path > text:nth-child(2)');
            let result = optimalPath != undefined ? optimalPath.join(' - ') : 'noch nicht gefunden';
            currentOptimalPath.plain(result);
        }
        resetAllValues(state, newState) {
            if (this.nodeStartOnMap) {
                this.nodeStartOnMap.removeClass("node-active").addClass("node-visited");
            }
            if (this.nodeFinishOnMap) {
                this.nodeFinishOnMap.removeClass("node-active").addClass("node-visited");
            }
            if (this.line) {
                this.line.removeClass("line-active");
            }
            if (this.path) {
                this.path.removeClass("path-active");
            }
            if (state == this.startStateID || newState == this.startStateID) {
                this.nodeStartInNaviColour.removeClass("node-active").addClass("node-visited");
            }
            if (state == this.finishStateID || newState == this.finishStateID) {
                this.nodeFinishInNaviColour.removeClass("node-active").addClass("node-visited");
            }
            this.nodeStartNaviBar.plain('');
            this.rho.plain('');
            this.nodeFinishNaviBar.plain('');
        }
        addEventListeners() {
            let buttonStepInto = this.svgLookup.getElement("#navi-step-for-step-button");
            let buttonSpeed1x = this.svgLookup.getElement('#navi-speed-normal');
            let buttonSpeed2x = this.svgLookup.getElement('#navi-speed-2x');
            let buttonSpeed3x = this.svgLookup.getElement('#navi-speed-3x');
            let buttonPause = this.svgLookup.getElement("#navi-pause");
            let buttonStop = this.svgLookup.getElement("#navi-stop");
            let that = this;
            buttonStepInto.click(function (e) {
                that.startPlayerForOneTick(0.1);
            });
            buttonStepInto.addClass("navi-button");
            buttonSpeed1x.click(function (e) {
                that.startPlayer(0.5);
            });
            buttonSpeed1x.addClass("navi-button");
            buttonSpeed2x.click(function (e) {
                that.startPlayer(100);
            });
            buttonSpeed2x.addClass("navi-button");
            buttonSpeed3x.click(function (e) {
                that.startPlayer(1000);
            });
            buttonSpeed3x.addClass("navi-button");
            buttonStop.click(function (e) {
                that.stopPlayer();
            });
            buttonStop.addClass("navi-button");
            buttonPause.click(function (e) {
                that.pausePlayer();
            });
            buttonPause.addClass("navi-button");
        }
        startPlayer(speed) {
            console.log("playerStarted!");
            this.dispatchEvent(new CustomEvent("playerStarted", {
                detail: speed
            }));
        }
        stopPlayer() {
            this.dispatchEvent(new CustomEvent("playerStopped"));
        }
        pausePlayer() {
            this.dispatchEvent(new CustomEvent("playerPaused"));
        }
        startPlayerForOneTick(speed) {
            this.dispatchEvent(new CustomEvent("playerStartedForOneStep", {
                detail: speed
            }));
        }
        getCombinedPath() {
            let combinedPath = undefined;
            for (let actionIndex in this.currentOptimalPathArray) {
                let firstAction = this.currentOptimalPathArray[parseInt(actionIndex)];
                let secondAction = this.currentOptimalPathArray[parseInt(actionIndex) + 1];
                if (secondAction !== undefined) {
                    let actionPath = this.findPathWithID(firstAction, secondAction);
                    try {
                        if (combinedPath == undefined) {
                            combinedPath = actionPath.clone();
                        }
                        else {
                            let currentPathArray = actionPath.array().clone(); //get array of path pieces
                            currentPathArray.splice(0, 1); // cut off the first piece of path (Movetto) to seemless combination of passes
                            combinedPath.array().push(...currentPathArray);
                            combinedPath.plot(combinedPath.array());
                        }
                    }
                    catch (error) {
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
        findPathWithID(firstValue, secondValue) {
            let selector = "#path-" + firstValue + "-" + secondValue + " path ";
            var foundPath = this.svgLookup.getPathElement(selector);
            return foundPath;
        }
        checkAndUpdateOptimalPath(optimalPath) {
            if (this.currentOptimalPathArray == undefined || this.currentOptimalPathArray.join("-") != optimalPath.join("-")) {
                this.currentOptimalPathArray = optimalPath;
                this.drawCurrentOptimalPathOnMap();
            }
        }
        drawFinalOptimalPath() {
            let combinedPath = this.getCombinedPath();
            combinedPath.addTo(this._svg);
            combinedPath.addClass('line-follower-outside');
            let pathLength = combinedPath.length();
            combinedPath.stroke({
                dasharray: pathLength + ", " + pathLength,
                dashoffset: pathLength
            });
            combinedPath.animate(6000, '>').attr("stroke-dashoffset", "0");
            let combinedPathCopy = combinedPath.clone();
            combinedPathCopy.addTo(this._svg);
            combinedPathCopy.addClass('line-follower-inside');
            combinedPathCopy.stroke({
                dasharray: pathLength + ", " + pathLength,
                dashoffset: pathLength
            });
            combinedPathCopy.animate(6000, '>').attr("stroke-dashoffset", "0");
            console.log(combinedPath.array());
            console.log(combinedPath.array());
        }
        drawCurrentOptimalPathOnMap() {
            if (this.currentOptimalPath != undefined) {
                this.currentOptimalPath.remove();
            }
            let combinedPath = this.getCombinedPath();
            combinedPath.addTo(this._svg);
            combinedPath.addClass("current-optimal-path-on-map");
            let pathLength = combinedPath.length();
            combinedPath.stroke({
                dasharray: pathLength + ", " + pathLength,
                dashoffset: pathLength
            });
            combinedPath.animate(6000, '>').attr("stroke-dashoffset", "0");
        }
    }
    exports.Visualizer = Visualizer;
});
