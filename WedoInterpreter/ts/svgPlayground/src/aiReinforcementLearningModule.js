define(["require", "exports", "./Visualizer", "./Utils", "./playerImpl", "qLearner"], function (require, exports, Visualizer_1, Utils_1, playerImpl_1, qLearner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class QLearningAlgorithmModule {
        constructor(updateBackground, htmlSelector, size, pathToSvg) {
            this.htmlSelector = htmlSelector;
            this.size = size;
            this.pathToSvg = pathToSvg;
            this.problem = undefined;
            this.qValueStore = undefined;
            this.episodes = 150;
            this.totalTime = 200;
            this.startFinishStates = undefined;
            this.player = undefined;
        }
        async createQLearningEnvironment(obstaclesList, startNode, finishNode) {
            let visualizer = await Visualizer_1.Visualizer.createVisualizer(this.pathToSvg, this.htmlSelector, this.size);
            //convert data: obstacle list Array<Action>, start node, finishnode to actionInterface / array
            let notAllowedActions = Utils_1.Utils.convertObstacleListToActionList(obstaclesList);
            this.startFinishStates = Utils_1.Utils.convertStartFinishNodeToAction(startNode, finishNode);
            let allActions = visualizer.getActions();
            //visualiser gets obstacle list and draws rocks on the way
            visualizer.processNotAllowedActions(notAllowedActions);
            //filter out all actions from obstacle lists -> work with the same list
            allActions = Utils_1.Utils.filterOutNotAllowedActions(allActions, notAllowedActions);
            //generate rewards & problem
            let statesAndActions = RlUtils.generateRewardsAndProblem(allActions, this.startFinishStates);
            this.problem = new ReinforcementProblem(statesAndActions);
            // this.startNode = startNode;
            // this.finishNode = finishNode;
        }
        setUpQLearningBehaviour(alpha, gamma, nu, rho) {
            this.alpha = alpha;
            this.gamma = gamma;
            this.nu = nu;
            this.rho = rho;
        }
        runQLearner() {
            let qLearningStep = new qLearner_1.QLearningAlgorithm(this.problem, this.alpha, this.gamma, this.rho, this.nu);
            let qLearningSteps = new Array();
            for (let i = 0; i < this.episodes; i++) {
                qLearningSteps.push(qLearningStep.qLearnerStep());
            }
            this.player = new playerImpl_1.PlayerImpl(qLearningSteps, this.totalTime, this.episodes, this.startFinishStates);
            this.player.initialize();
        }
        drawOptimalPath() {
            console.log(this.qValueStore);
            var optimalPathResult = this.qValueStore.createOptimalPath(this.startNode, this.finishNode, this.problem);
            this.drawOptimalPathIntern(optimalPathResult);
            var copyOfSVG = this.svg.clone();
            RlUtils.hideAllPathsExeptTheOptimal(copyOfSVG);
            var learnedImageHTML = copyOfSVG.svg();
            var learnedImage = window.btoa(learnedImageHTML);
            var temp = 'data:image/svg+xml;base64,' + learnedImage;
            this.updateBackground(9, temp);
        }
        drawOptimalPathIntern(optimalPathResult) {
            if (optimalPathResult.resultState == ResultState.ERROR) {
                console.log("...");
            }
            else {
                var combinedPath;
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
                            }
                            else {
                                var temp = RlUtils.findPathWithID(this.svg, firstValue, secondValue).array();
                                // temp.stroke({linecap: 'round'})
                                temp.splice(0, 1);
                                combinedPath.array().push(...temp);
                                combinedPath.plot(combinedPath.array());
                            }
                        }
                        catch (error) {
                            console.log(combinedPath);
                        }
                    }
                }
                combinedPath.addTo(this.svg);
                combinedPath.removeClass('cls-customPathColor');
                combinedPath.addClass('pink-flower');
                combinedPath.stroke({ width: 80, color: '#ffffff', opacity: 1, linecap: 'round', linejoin: 'round' })
                    .fill('none');
                var pathCopyBlack = combinedPath.clone();
                pathCopyBlack.addTo(this.svg);
                pathCopyBlack.removeClass('cls-customPathColor');
                pathCopyBlack.addClass('pink-flower');
                pathCopyBlack.stroke({ width: 30, color: '#000000' })
                    .fill('none');
                console.log(combinedPath.array());
            }
        }
    }
    exports.QLearningAlgorithmModule = QLearningAlgorithmModule;
    class RlUtils {
        static generateRewardsAndProblem(allActions, startStateQLearner) {
            let statesAndActions = new Array();
            for (let action of allActions) {
                if (statesAndActions[action.startState.id] == undefined) {
                    statesAndActions[action.startState.id] = new Array();
                }
                let rewardValue = RlUtils.DEFAULT_REWARD_VALUE;
                if (action.finishState.id == startStateQLearner.finishState.id) {
                    rewardValue = this.REWARD_VALUE;
                }
                statesAndActions[action.startState.id][action.finishState.id] = rewardValue;
            }
            return statesAndActions;
        }
        static hideAllPathsExeptTheOptimal(svg) {
            svg.find('.cls-customPathColor').hide();
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
            var foundPath = svg.findOne('#' + linkIDPrefix + firstValue + "-" + secondValue);
            return foundPath;
        }
    }
    RlUtils.REWARD_VALUE = 50;
    RlUtils.DEFAULT_REWARD_VALUE = 0;
    // exports.QLearningAlgorithmModule = QLearningAlgorithmModule;
    //Utils
    var ResultState;
    (function (ResultState) {
        ResultState[ResultState["SUCCESS"] = 1] = "SUCCESS";
        ResultState[ResultState["ERROR"] = 2] = "ERROR";
    })(ResultState = exports.ResultState || (exports.ResultState = {}));
    class ReinforcementProblem {
        constructor(statesAndActions) {
            this.statesAndActions = statesAndActions;
            this.states = [];
            for (let i = 0; i < statesAndActions.length; i++) {
                this.states.push(i);
            }
        }
        getRandomState() {
            var indexOfState = Math.floor(Math.random() * this.states.length);
            return this.states[indexOfState];
        }
        getAvailableActions(state) {
            var availableActions = [];
            var actions = this.statesAndActions[state];
            var actionIndex;
            for (actionIndex in actions) {
                if (actions[actionIndex] !== undefined) {
                    availableActions.push(parseInt(actionIndex));
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
            let action = Math.floor(Math.random() * actions.length);
            return actions[action];
        }
    }
    class QValueStore {
        constructor(statesAndActions) {
            this.qMatrix = [];
            for (var statesIndex in statesAndActions) {
                var actions = statesAndActions[statesIndex].slice().fill(0);
                this.qMatrix.push(actions);
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
                if (action != undefined && availableActions.includes(parseInt(actionIndex)) && action > bestActionValue) {
                    bestActionValue = actionsQMatrix[actionIndex];
                    bestAction = parseInt(actionIndex);
                }
            }
            return bestAction;
        }
        storeQValue(state, action, value) {
            let actions = this.qMatrix[state];
            actions[action] = value; // === this.qMatrix[state][action] = value;
        }
        createOptimalPath(startState, endState, problem) {
            var optimalPath = [startState];
            var currentState = startState;
            var resultState = ResultState.SUCCESS;
            while (currentState !== endState) {
                var nextState = this.getBestAction(currentState, problem.getAvailableActions(currentState));
                currentState = nextState;
                if (optimalPath.includes(currentState)) {
                    console.log("Keinen optimalen Pfad von " + startState + " nach " + endState + " gefunden. Zyklus geschlossen bei: " + currentState);
                    resultState = ResultState.ERROR;
                    break;
                }
                optimalPath.push(nextState);
            }
            return { optimalPath, resultState };
        }
    }
});
//# sourceMappingURL=aiReinforcementLearningModule.js.map