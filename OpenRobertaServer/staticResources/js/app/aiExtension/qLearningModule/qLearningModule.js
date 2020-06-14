define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});

    class RlUtils {

        static generateStatesAndActionsFromSVG(svg, obstaclesList, finishNode) {
            var statesAndActions = [];
            var allPathes = svg.find('.cls-customPathColor');
            var obstaclesArray = [];
            for (var obstacleItem in obstaclesList) {
                let obstacle = obstaclesList[obstacleItem]
                obstaclesArray.push(obstacle.startNode + "-" + obstacle.finishNode);
            }
            allPathes.each(function (item) {
                let obstaclePresent = false;
                let idName = item.attr("id");
                let tokens = idName.split("-");
                let firstValue = tokens[1]; //0
                let secondValue = tokens[2]; //1
                if (statesAndActions[firstValue] == undefined) {
                    statesAndActions[firstValue] = [];
                }
                if (obstaclesArray.includes(firstValue + "-" + secondValue)) {

                } else if (secondValue == finishNode) {
                    statesAndActions[firstValue][secondValue] = 50;
                } else {
                    statesAndActions[firstValue][secondValue] = 0;
                }
            })
            return statesAndActions;
        }


        static file_get_contents(uri, callback) {
            fetch(uri).then(res => res.text()).then(text => callback(text));
        }


        static hideAllPathsExeptTheOptimal(svg) {
            svg.find('.cls-customPathColor').hide();
        }


        static findPathWithID(svg, firstValue, secondValue) {
            const linkIDPrefix = "path-";
            var foundPath = svg.findOne('#' + linkIDPrefix + firstValue + "-" + secondValue)
            return foundPath;
        }

    }


    class QLearningAlgorithmModule {

        constructor(updateBackground) {
            this.svg = undefined;
            this.startNode = undefined;
            this.finishNode = undefined;
            this.statesAndActions = undefined;
            this.problem = undefined;
            this.alpha = undefined;
            this.gamma = undefined;
            this.nu = undefined;
            this.rho = undefined;
            this.qValueStore = undefined;
            this.episodes = 150;
            this.timePerEpisode = 600;
            this.updateBackground = updateBackground;

        }

        createQLearningEnvironment(obstaclesList, startNode, finishNode) {
            this.startNode = startNode;
            this.finishNode = finishNode;
            var path = "/js/app/simulation/simBackgrounds/marsTopView.svg";
            this.loadSVG(path, obstaclesList, finishNode);
            return 1000;
        }


        loadSVG(filePath, obstaclesList, finishNode) {
            var that = this;
            RlUtils.file_get_contents(filePath, function (text) {
                that.drawSVG(text);
                that.statesAndActions = RlUtils.generateStatesAndActionsFromSVG(that.svg, obstaclesList, finishNode);
                that.problem = new ReinforcementProblem(that.statesAndActions);
            });

        }

        drawSVG(text) {
            $('#qLearningBackgroundArea').html("");
            this.svg = SVG().addTo('#qLearningBackgroundArea').size(3148 / 5, 1764 / 5).viewbox("0 0 3148 1764");
            this.svg.svg(text);
            this.svg.find('.cls-customPathColor').stroke({color: '#fcfcfc', opacity: 0.9, width: 0});
        }


        setUpQLearningBehaviour(alpha, gamma, nu, rho) {
            this.alpha = alpha;
            this.gamma = gamma;
            this.nu = nu;
            this.rho = rho;
        }

        learningEnded(qValueStore, problem) {

        }

        runQLearner() {
            this.qValueStore = new QLearningAlgorithm().qLearner(this.svg, this.problem, this.episodes, 9007199254740991, this.alpha, this.gamma, this.rho, this.nu, this.learningEnded)
            return this.episodes * this.timePerEpisode;
        }

        drawOptimalPath() {
            console.log(this.qValueStore);
            var optimalPathResult = this.qValueStore.createOptimalPath(this.startNode, this.finishNode, this.problem);
            this.drawOptimalPathIntern(optimalPathResult);
            var copyOfSVG = this.svg.clone();
            RlUtils.hideAllPathsExeptTheOptimal(copyOfSVG);

            // var learnedImageHTML = $("#Layer_1").parent().html();
            // var learnedImageHTML = $("#qLearningBackgroundArea").html();
            var learnedImageHTML = copyOfSVG.svg();
            //learnedImageHTML =  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="110"> <rect width="300" height="100"  style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" /> </svg>' ;
            var learnedImage = window.btoa(learnedImageHTML);
            var temp = 'data:image/svg+xml;base64,' + learnedImage;
            this.updateBackground(9, temp);

        }

        drawOptimalPathIntern(optimalPathResult) {
            if (optimalPathResult.resultState == ResultState.ERROR) {
                console.log("...")
            } else {
                var combinedPath;
                var combinedPathTestPurpose;
                for (var qValue in optimalPathResult.optimalPath) {
                    var firstValue = optimalPathResult.optimalPath[parseInt(qValue)];
                    var secondValue = optimalPathResult.optimalPath[parseInt(qValue) + 1];
                    if (secondValue !== null) {

                        try {
                            // combinedPathTestPurpose = RlUtils.findPathWithID(this.svg, firstValue, secondValue);
                            // combinedPathTestPurpose.addTo(this.svg);
                            // combinedPathTestPurpose.stroke({width: 20, color: '#1ad274'})

                            if (combinedPath == undefined) {
                                var combinedPath = RlUtils.findPathWithID(this.svg, firstValue, secondValue);
                            } else {
                                var temp = RlUtils.findPathWithID(this.svg, firstValue, secondValue).array();
                                // temp.stroke({linecap: 'round'})
                                temp.splice(0, 1);
                                combinedPath.array().push(...temp)
                                combinedPath.plot(combinedPath.array());
                            }
                        } catch (error) {
                            console.log(combinedPathTestPurpose + " > " + combinedPath);
                        }
                    }
                }
                combinedPath.addTo(this.svg);
                combinedPath.removeClass('cls-customPathColor');
                combinedPath.addClass('pink-flower')
                combinedPath.stroke({width: 80, color: '#ffffff', opacity: 1, linecap: 'round', linejoin: 'round'})
                    .fill('none');

                var pathCopyBlack = combinedPath.clone();
                pathCopyBlack.addTo(this.svg);
                pathCopyBlack.removeClass('cls-customPathColor')
                pathCopyBlack.addClass('pink-flower')
                pathCopyBlack.stroke({width: 30, color: '#000000'})
                    .fill('none');
                console.log(combinedPath.array())
            }

        }
    }
    exports.QLearningAlgorithmModule = QLearningAlgorithmModule;

//Utils

    const ResultState = {
        "SUCCESS": 1,
        "ERROR": 2
    }

    Object.freeze(ResultState);


    class OptimalPathResult {
        constructor(optimalPath, resultState) {
            this.optimalPath = optimalPath;
            this.resultState = resultState;
        }
    }

    class ReinforcementProblem {

        constructor(statesAndActions) {
            this.statesAndActions = statesAndActions;
            this.states = [];
            for (let state of statesAndActions.keys()) {
                this.states.push(state);
            }
        }

        getRandomState() {
            var indexOfState = Math.floor(Math.random() * this.states.length)
            return this.states[indexOfState];
        }

        getAvailableActions(state) {
            var availableActions = [];
            var actions = this.statesAndActions[state];
            for (var actionIndex in actions) {
                if (actions[actionIndex] !== undefined) {
                    availableActions.push(actionIndex);
                }
            }
            return availableActions;
        }

        takeAction(state, action) {
            var actions = this.statesAndActions[state];
            return {
                "reward": actions[action],
                "newState": action
            };
        }

        takeOneOfActions(actions) {
            //TODO Available Actions ?
            return actions[Math.floor(Math.random() * actions.length)];
        }
    }


    class QValueStore {

        constructor(statesAndActions) {
            this.qMatrix = [];

            for (var statesIndex in statesAndActions) {
                var actions = statesAndActions[statesIndex].slice().fill(0);
                this.qMatrix.push(actions)

            }

        }

        getQValue(state, action) {
            var actions = this.qMatrix[state];
            return actions[action]; //associatedQValue
        }

        getBestAction(state, availableActions) {
            var actionsQMatrix = this.qMatrix[state];
            var bestActionValue = -1;
            var bestAction;
            for (var actionIndex in actionsQMatrix) {
                var action = actionsQMatrix[actionIndex];
                if (action != undefined && availableActions.includes("" + actionIndex) && action > bestActionValue) {
                    bestActionValue = actionsQMatrix[actionIndex];
                    bestAction = actionIndex
                }
            }
            return bestAction;
        }

        storeQValue(state, action, value) {
            var actions = this.qMatrix[state];
            actions[action] = value; // === this.qMatrix[state][action] = value;
        }

        createOptimalPath(startState, endState, problem) {
            var optimalPath = [startState];
            var currentState = startState;
            var resultState = ResultState.SUCCESS;
            while (currentState !== endState) {
                var nextState = parseInt(this.getBestAction(currentState, problem.getAvailableActions(currentState)));
                currentState = nextState;
                if (optimalPath.includes(currentState)) {
                    console.log("Keinen optimalen Pfad von " + startState + " nach " + endState + " gefunden. Zyklus geschlossen bei: " + currentState);
                    resultState = ResultState.ERROR;
                    break;
                }
                optimalPath.push(nextState);
            }
            return new OptimalPathResult(optimalPath, resultState);
        }
    }


    class QLearningAlgorithm {

        qLearner(svg, problem, episodes, timeLimit, alpha, gamma, rho, nu, callback) {
            var qValueStore = new QValueStore(problem.statesAndActions);
            var state = problem.getRandomState();
            var action;
            let previousPath;
            var timer = setInterval(function () {
                var startTime = Date.now();
                if (Math.random() < nu) {
                    state = problem.getRandomState();
                }
                var actions = problem.getAvailableActions(state);
                if (Math.random() < rho) {
                    action = problem.takeOneOfActions(actions);
                } else {
                    action = qValueStore.getBestAction(state, actions);
                }
                var rewardAndNewState = problem.takeAction(state, action);
                var reward = rewardAndNewState["reward"];
                var newState = rewardAndNewState["newState"];
                var q = qValueStore.getQValue(state, action);
                var newStateActions = problem.getAvailableActions(newState);
                var maxQ = qValueStore.getQValue(newState, qValueStore.getBestAction(newState, newStateActions));
                q = (1 - alpha) * q + alpha * (reward + gamma * maxQ);
                if (previousPath !== undefined) {
                    previousPath.stroke({color: '#f8f7f7', dasharray: "0"})
                }
                previousPath = RlUtils.findPathWithID(svg, state, newState);
                let pathLength = previousPath.length();
                let direction = state > newState ? -1 : 1;
                previousPath.stroke({
                    color: '#8fdc5d',
                    dasharray: "" + pathLength + ", " + pathLength,
                    dashoffset: "" + (pathLength * direction),
                    width: q * 2 + 10
                });
                previousPath.animate({
                    duration: 400,
                    delay: 0,
                    when: 'now',
                }).attr("stroke-dashoffset", 0);
                qValueStore.storeQValue(state, action, q);
                console.log("state " + state + " > " + newState + "; reward " + reward + "; q " + q + "; maxQ " + maxQ);
                state = newState;
                timeLimit = timeLimit - (Date.now() - startTime);
                episodes = episodes - 1;
                if (!((timeLimit > 0) && (episodes > 0))) {
                    previousPath.stroke({color: '#f8f7f7', dasharray: "0"})
                    clearInterval(timer);
                    callback(qValueStore, problem);
                }
            }, 500);
            return qValueStore;
        }
    }
});