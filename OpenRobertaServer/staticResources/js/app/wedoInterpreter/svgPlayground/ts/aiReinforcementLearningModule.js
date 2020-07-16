define(["require", "exports", "visualizer", "utils", "playerImpl", "qLearner"], function (require, exports, visualizer_1, utils_1, playerImpl_1, qLearner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class QLearningAlgorithmModule {
        constructor(updateBackground, htmlSelector, size, pathToSvg) {
            this.updateBackground = updateBackground;
            this.htmlSelector = htmlSelector;
            this.size = size;
            this.pathToSvg = pathToSvg;
            this.problem = undefined;
            this.episodes = 500;
            this.totalTime = 300;
            this.startFinishStates = undefined;
            this.player = undefined;
            this.qLearner = undefined;
            this._drawOptimalPathResult = undefined;
        }
        async createQLearningEnvironment(obstaclesList, startNode, finishNode) {
            this.visualizer = await visualizer_1.Visualizer.createVisualizer(this.pathToSvg, this.htmlSelector, this.size);
            //convert data: obstacle list Array<Action>, start node, finishnode to actionInterface / array
            let notAllowedActions = utils_1.Utils.convertObstacleListToActionList(obstaclesList);
            this.startFinishStates = utils_1.Utils.convertStartFinishNodeToAction(startNode, finishNode);
            let allActions = this.visualizer.getActions();
            //visualiser gets obstacle list and draws rocks on the way
            this.visualizer.processNotAllowedActions(notAllowedActions);
            //filter out all actions from obstacle lists -> work with the same list
            allActions = utils_1.Utils.filterOutNotAllowedActions(allActions, notAllowedActions);
            //generate rewards & problem
            let statesAndActions = qLearner_1.RlUtils.generateRewardsAndProblem(allActions, this.startFinishStates);
            this.problem = new qLearner_1.ReinforcementProblem(statesAndActions);
        }
        async setUpQLearningBehaviour(alpha, gamma, nu, rho) {
            this.alpha = alpha;
            this.gamma = gamma;
            this.nu = nu;
            this.rho = rho;
        }
        async runQLearner() {
            this.qLearner = new qLearner_1.QLearningAlgorithm(this.problem, this.alpha, this.gamma, this.rho, this.nu);
            let qLearningSteps = new Array();
            for (let i = 0; i < this.episodes; i++) {
                qLearningSteps.push({
                    qLearnerStepData: this.qLearner.qLearnerStep(),
                    optimalPath: this.qLearner.findOptimalPath(this.startFinishStates.startState.id, this.startFinishStates.finishState.id).optimalPath
                });
            }
            this.player = new playerImpl_1.PlayerImpl(qLearningSteps, this.totalTime, this.episodes, this.startFinishStates);
            this.player.initialize(this.visualizer);
        }
        async drawOptimalPath() {
            let that = this;
            // this.player.timer.addEventListener("stop", function () {
            //     // let optimalPathResult: OptimalPathResult = that.qLearner.findOptimalPath(that.startFinishStates.startState.id, that.startFinishStates.finishState.id);
            //     // if (optimalPathResult.resultState == ResultState.ERROR) {
            //     //     console.log(optimalPathResult.optimalPath + "ist not an optimal Path.")
            //     // }
            //     // that.visualizer.drawPath(optimalPathResult.optimalPath);
            //     that.visualizer.drawFinalOptimalPath();
            //
            //
            //     let copyOfSVG: SVG.Svg = that.visualizer.svg.clone();
            //     //RlUtils.hideAllPathsExeptTheOptimal(copyOfSVG);
            //     let learnedImageHTML = copyOfSVG.svg();
            //     let learnedImage = window.btoa(learnedImageHTML);
            //     let temp: string = 'data:image/svg+xml;base64,' + learnedImage;
            //     that.updateBackground(9, temp);
            // })
            let promise = new Promise(function (resolve) {
                that.player.timer.addEventListener("stop", function () {
                    // let optimalPathResult: OptimalPathResult = that.qLearner.findOptimalPath(that.startFinishStates.startState.id, that.startFinishStates.finishState.id);
                    // if (optimalPathResult.resultState == ResultState.ERROR) {
                    //     console.log(optimalPathResult.optimalPath + "ist not an optimal Path.")
                    // }
                    // that.visualizer.drawPath(optimalPathResult.optimalPath);
                    that.visualizer.drawFinalOptimalPath()
                        .then(() => {
                        let copyOfSVG = that.visualizer.svg.findOne("svg").clone();
                        copyOfSVG.viewbox("69.77 484.02 1962.26 946.08");
                        copyOfSVG.size(1962.26/2, 946.08/2);
                        //RlUtils.hideAllPathsExeptTheOptimal(copyOfSVG);
                        //copyOfSVG.viewbox(copyOfSVG.findOne('svg').attr("viewBox"));
                        let learnedImageHTML = copyOfSVG.svg();
                        let learnedImage = window.btoa(learnedImageHTML);
                        let temp = 'data:image/svg+xml;base64,' + learnedImage;
                        that.updateBackground(9, temp);
                        resolve();
                    });
                });
            });
            return promise;
        }
        get drawOptimalPathResult() {
            return this._drawOptimalPathResult;
        }
        set drawOptimalPathResult(value) {
            this._drawOptimalPathResult = value;
        }
    }
    exports.QLearningAlgorithmModule = QLearningAlgorithmModule;
});
