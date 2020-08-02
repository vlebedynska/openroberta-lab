define(["require", "exports", "visualizer", "utils", "playerImpl", "qLearner"], function (require, exports, visualizer_1, utils_1, playerImpl_1, qLearner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class QLearningAlgorithmModule {
        constructor(updateBackground, htmlSelector, popupSelector, size, pathToSvg) {
            this.updateBackground = updateBackground;
            this.htmlSelector = htmlSelector;
            this.popupSelector = popupSelector;
            this.size = size;
            this.pathToSvg = pathToSvg;
            this.problem = undefined;
            this.episodes = 0;
            this.totalTime = 0;
            this.startFinishStates = undefined;
            this.player = undefined;
            this.qLearner = undefined;
            this._drawOptimalPathResult = undefined;
            this.addEventListenerToRLPopup();
            console.log("New RL-Module created.");
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
        async runQLearner(episodes, time) {
            this.episodes = episodes;
            this.totalTime = time;
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
            let promise = new Promise(function (resolve) {
                that.player.timer.addEventListener("stop", function () {
                    that.visualizer.drawFinalOptimalPath()
                        .then(() => {
                        // <rect id="myScene" x="69.77" y="484.02" width="1962.26" height="946.08" fill="none"/>
                        let copyOfSVG = that.visualizer.svg.findOne("svg").clone();
                        let sceneToBeTransmitted = that.visualizer.svg.findOne("#myScene");
                        let x = sceneToBeTransmitted.x();
                        let y = sceneToBeTransmitted.y();
                        let width = sceneToBeTransmitted.width();
                        let height = sceneToBeTransmitted.height();
                        copyOfSVG.viewbox(x, y, width, height);
                        // copyOfSVG.viewbox("69.77 484.02 1962.26 946.08");
                        copyOfSVG.size(width / 2, height / 2);
                        //RlUtils.hideAllPathsExeptTheOptimal(copyOfSVG);
                        //For some reason while transferring svg via URI (data:image/svg+xml;base64,) it gets broken, if it contains empty text elements.
                        // It gets also broken, if it contains tspan elements.
                        // For this reason tsapn elements are found in the svg and their parents - i.e. texts - are set to random text e.g. "0".
                        copyOfSVG.find("tspan").each(el => {
                            let parent = el.parent();
                            if (parent) {
                                parent.plain("0");
                            }
                        });
                        let point0 = copyOfSVG.findOne(".finalPath-outline").pointAt(0);
                        let point1 = copyOfSVG.findOne(".finalPath-outline").pointAt(20);
                        // let rect = copyOfSVG.rect(50, 50).cx(point0.x).cy(point0.y).attr({ fill: '#f06' });
                        //Berechnung der Steigung
                        copyOfSVG.line(point0.x, point0.y, point1.x, point1.y).stroke({ width: 10, color: "red" });
                        //Berechung der Drehung des Roboters
                        let m = (point1.y - point0.y) / (point1.x - point0.x);
                        let theta = Math.atan(m) * (-1);
                        point0.x = (point0.x - sceneToBeTransmitted.x()) / 2;
                        point0.y = (point0.y - sceneToBeTransmitted.y()) / 2;
                        let pose = {
                            x: point0.x + 10,
                            y: point0.y + 10,
                            theta: theta,
                            transX: 0,
                            transY: 0
                        };
                        let poses = new Array();
                        poses.push(pose);
                        let learnedImageHTML = copyOfSVG.svg();
                        //The svg transferred via URI gets also broken, if the namespace of svgjs and its references in certain elements remain in the svg.
                        // For this reason, they must be removed from the svg that is to be transferred.
                        learnedImageHTML = learnedImageHTML.replace(/svgjs:data="{[^}]*}"/g, "");
                        learnedImageHTML = learnedImageHTML.replace('xmlns:svgjs="http://svgjs.com/svgjs"', "");
                        let learnedImage = window.btoa(learnedImageHTML);
                        let temp = 'data:image/svg+xml;base64,' + learnedImage;
                        that.updateBackground(9, temp, poses);
                        resolve();
                    });
                });
            });
            return promise;
        }
        addEventListenerToRLPopup() {
            let that = this;
            if (this.popupSelector && this.popupSelector.on) {
                this.popupSelector.on("hidden.bs.modal", function () {
                    if (that.player) {
                        that.player.pause();
                    }
                });
            }
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
//# sourceMappingURL=aiReinforcementLearningModule.js.map