define(["require", "exports", "svgdotjs", "utils"], function (require, exports, svgdotjs_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //.size(3148 / 5, 1764 / 5).
    class Visualizer extends EventTarget {
        constructor(svg) {
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
            let allPaths = this.svg.find('g[id^="path-"]');
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
                let notAllowedPath = this.svg.findOne("#path-" + notAllowedAction.startState.id + "-" + notAllowedAction.finishState.id + " path");
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
            let setInitialEpisode = this.svg.findOne('#episode > text:nth-child(3)');
            setInitialEpisode.plain('');
            this.nodeStartNaviBar = this.svg.findOne('#node-start-navi text');
            this.nodeStartNaviBar.plain('');
            this.rho = this.svg.findOne('#explore_exploit text');
            this.rho.plain('');
            this.nodeFinishNaviBar = this.svg.findOne('#node-finish-navi text');
            this.nodeFinishNaviBar.plain('');
            // this.startState.id, this.finishState.id, this.totalTime,this.qLearningSteps.length
        }
        setStartAndFinishState(startStateID, finishStateID) {
            this.nodeStartInNaviText = this.svg.findOne('#node-start  text');
            this.nodeStartInNaviText.plain('' + startStateID);
            this.nodeStartInNaviColour = this.svg.findOne('#node-start path');
            this.nodeFinishInNaviText = this.svg.findOne('#node-finish text');
            this.nodeFinishInNaviText.plain('' + finishStateID);
            this.nodeFinishInNaviColour = this.svg.findOne('#node-finish path');
        }
        setTotalTime(totalTime) {
            let formattedTime = utils_1.Utils.convertNumberToSeconds(totalTime);
            let timeCurrent = this.svg.findOne('#time > text:nth-child(1)');
            timeCurrent.plain('' + formattedTime);
        }
        setTotalNumberOfEpisodes(totalQLearningSteps) {
            let episodeTotal = this.svg.findOne('#episode > text:nth-child(2)');
            episodeTotal.plain('' + totalQLearningSteps);
        }
        onQLearningStep(newQLearnerStepDataAndPath, currentTime, executionDuration) {
            let newQLearnerStep = newQLearnerStepDataAndPath.qLearnerStepData;
            console.log("gotStep! " + newQLearnerStep.stepNumber);
            console.log("first measure " + Date.now());
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
        static delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        showCurrentTime(currentTime) {
            console.log("The new q Learnig step " + Date.now());
            let timeCurrent = this.svg.findOne('#time > text:nth-child(1)');
            timeCurrent.plain('' + utils_1.Utils.convertNumberToSeconds(currentTime));
        }
        showCurrentEpisode(newQLearnerStep) {
            console.log("Dalay ist zu Ende " + Date.now());
            let episodeCurrent = this.svg.findOne('#episode > text:nth-child(3)');
            episodeCurrent.plain('' + newQLearnerStep.stepNumber);
        }
        showCurrentStartNode(state, newState) {
            this.nodeStartNaviBar.plain('' + state);
            if (state == this.startStateID || newState == this.startStateID) {
                this.nodeStartInNaviColour.addClass("node-active");
            }
            this.nodeStartOnMap = this.svg.findOne('#node-' + state + ' path');
            this.nodeStartOnMap.addClass("node-active");
        }
        showCurrentRho(currentRho) {
            this.rho.plain('' + currentRho);
        }
        showCurrentStroke(duration, timeout, state, newState, qValue, maxQValue) {
            let shapeGroupId = '#path-' + state + '-' + newState;
            let shapes = this.svg.find(shapeGroupId + ' > path' + "," + shapeGroupId + " line");
            if (shapes.length != 1) {
                console.warn("shape not found or ambiguous");
                return;
            }
            let shape = shapes[0];
            let shapeLength = utils_1.Utils.calcShapeLength(shape);
            let shapeClone = shape.clone();
            shapeClone.stroke({ opacity: 1 });
            shapeClone.addTo(this.svg);
            shapeClone.addClass("shape-active");
            shapeClone.stroke({
                dasharray: 5 + ", " + 35,
                dashoffset: shapeLength,
                linecap: "round",
            });
            shapeClone.animate(duration, '>').attr("stroke-dashoffset", "0");
            setTimeout(function () {
                shapeClone.remove();
                shape.stroke({ opacity: -(1 / maxQValue) * qValue + 1 });
            }, timeout);
        }
        showCurrentFinishNode(state, newState) {
            if (state == this.finishStateID || newState == this.finishStateID) {
                this.nodeFinishInNaviColour.addClass("node-active");
            }
            this.nodeFinishOnMap = this.svg.findOne('#node-' + newState + ' path');
            this.nodeFinishOnMap.addClass("node-active");
            this.nodeFinishNaviBar.plain('' + newState);
        }
        showCurrentOptimalPath(optimalPath) {
            let currentOptimalPath = this.svg.findOne('#navi-optimal-path > text:nth-child(2)');
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
            let buttonStepInto = this.svg.findOne("#navi-step-for-step-button");
            let buttonSpeed1x = this.svg.findOne('#navi-speed-normal');
            let buttonSpeed2x = this.svg.findOne('#navi-speed-2x');
            let buttonSpeed3x = this.svg.findOne('#navi-speed-3x');
            let buttonPause = this.svg.findOne("#navi-pause");
            let buttonStop = this.svg.findOne("#navi-stop");
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
        drawPath(actions) {
            let combinedPath = undefined;
            for (let actionIndex in actions) {
                let firstAction = actions[parseInt(actionIndex)];
                let secondAction = actions[parseInt(actionIndex) + 1];
                let actionPath = Visualizer.findPathWithID(this.svg, firstAction, secondAction);
                if (secondAction !== undefined) {
                    try {
                        if (combinedPath == undefined) {
                            combinedPath = actionPath;
                        }
                        else {
                            let currentPathArray = actionPath.array(); //get array of path pieces
                            let currentPathArrayWithoutMovetto = currentPathArray.splice(0, 1); // cut off the first piece of path (Movetto) to seemless combination of passes
                            combinedPath.array().push(...currentPathArray);
                            combinedPath.plot(combinedPath.array());
                        }
                    }
                    catch (error) {
                        console.log(combinedPath);
                    }
                }
            }
            combinedPath.addTo(this.svg);
            combinedPath.addClass('line-follower-outside');
            // combinedPath.stroke({width: 80, color: '#ffffff', opacity: 1, linecap: 'round', linejoin: 'round'})
            //     .fill('none');
            let combinedPathCopy = combinedPath.clone();
            combinedPathCopy.addTo(this.svg);
            combinedPathCopy.addClass('line-follower-inside');
            // combinedPathCopy.stroke({width: 30, color: '#000000'})
            //     .fill('none');
            console.log(combinedPath.array());
        }
        /**
         *
         * @param svg
         * @param firstValue
         * @param secondValue
         * @return foundPath in {@link svg} or null if not found
         */
        static findPathWithID(svg, firstValue, secondValue) {
            const linkIDPrefix = "path-";
            var foundPath = svg.findOne('#' + linkIDPrefix + firstValue + "-" + secondValue + " path ");
            return foundPath;
        }
    }
    exports.Visualizer = Visualizer;
});
