import * as SVG from "svgdotjs";
import {Action, Obstacle, OptimalPathResult, Player, QLearningStep, ResultState} from "models";
import {Size, Visualizer} from "visualizer";
import {Utils} from "utils";
import {PlayerImpl} from "playerImpl";
import {QLearningAlgorithm, ReinforcementProblem, RlUtils} from "qLearner";


export class QLearningAlgorithmModule {
    svg: SVG.Svg;
    updateBackground: any;
    startNode: number;
    finishNode: number;
    problem: ReinforcementProblem;
    alpha: number;
    gamma: number;
    nu: number;
    rho: number;
    episodes: number;
    htmlSelector: string;
    size: Size;
    pathToSvg: string;
    totalTime: number;
    startFinishStates: Action;
    player: Player;
    visualizer: Visualizer;
    qLearner: QLearningAlgorithm;
    private _drawOptimalPathResult: boolean;


    constructor(updateBackground, htmlSelector: string, size: Size, pathToSvg: string) {
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


     async createQLearningEnvironment(obstaclesList: Array<Obstacle>, startNode: number, finishNode: number) {
         this.visualizer = await Visualizer.createVisualizer(this.pathToSvg, this.htmlSelector, this.size);

         //convert data: obstacle list Array<Action>, start node, finishnode to actionInterface / array
         let notAllowedActions: Array<Action> = Utils.convertObstacleListToActionList(obstaclesList);
         this.startFinishStates = Utils.convertStartFinishNodeToAction(startNode, finishNode);

         let allActions: Array<Action> = this.visualizer.getActions();

         //visualiser gets obstacle list and draws rocks on the way
         this.visualizer.processNotAllowedActions(notAllowedActions);


         //filter out all actions from obstacle lists -> work with the same list
         allActions = Utils.filterOutNotAllowedActions(allActions, notAllowedActions);


         //generate rewards & problem
         let statesAndActions: Array<Array<number>> = RlUtils.generateRewardsAndProblem(allActions, this.startFinishStates);
         this.problem = new ReinforcementProblem(statesAndActions);
     }


    async setUpQLearningBehaviour(alpha: number, gamma: number, nu:number, rho:number) {
        this.alpha = alpha;
        this.gamma = gamma;
        this.nu = nu;
        this.rho = rho;
    }


    async runQLearner() {
        this.qLearner = new QLearningAlgorithm(this.problem,this.alpha, this.gamma, this.rho, this.nu);
        let qLearningSteps: Array<{qLearnerStepData: QLearningStep, optimalPath: Array<number>}> = new Array<{qLearnerStepData: QLearningStep, optimalPath: Array<number>}>();
        for (let i=0; i < this.episodes; i++) {
            qLearningSteps.push({
                qLearnerStepData: this.qLearner.qLearnerStep(),
                optimalPath: this.qLearner.findOptimalPath(this.startFinishStates.startState.id, this.startFinishStates.finishState.id).optimalPath});
        }
        this.player = new PlayerImpl(qLearningSteps, this.totalTime, this.episodes, this.startFinishStates);
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



        let promise = new Promise<void>(function (resolve) {
            that.player.timer.addEventListener("stop", function () {
                // let optimalPathResult: OptimalPathResult = that.qLearner.findOptimalPath(that.startFinishStates.startState.id, that.startFinishStates.finishState.id);
                // if (optimalPathResult.resultState == ResultState.ERROR) {
                //     console.log(optimalPathResult.optimalPath + "ist not an optimal Path.")
                // }
                // that.visualizer.drawPath(optimalPathResult.optimalPath);
                that.visualizer.drawFinalOptimalPath();


                let copyOfSVG: SVG.Svg = that.visualizer.svg.clone();
                //RlUtils.hideAllPathsExeptTheOptimal(copyOfSVG);
                let learnedImageHTML = copyOfSVG.svg();
                let learnedImage = window.btoa(learnedImageHTML);
                let temp: string = 'data:image/svg+xml;base64,' + learnedImage;
                that.updateBackground(9, temp);

                resolve();
            })

        });



        return promise;

    }



    get drawOptimalPathResult(): boolean {
        return this._drawOptimalPathResult;
    }

    set drawOptimalPathResult(value: boolean) {
        this._drawOptimalPathResult = value;
    }
}