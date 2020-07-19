import * as SVG from "svgdotjs";
import {Action, Obstacle, OptimalPathResult, Player, QLearningStep, ResultState} from "models";
import {Size, Visualizer} from "visualizer";
import {Utils} from "utils";
import {PlayerImpl} from "playerImpl";
import {QLearningAlgorithm, ReinforcementProblem, RlUtils} from "qLearner";
import {Path, Point, Svg} from "svgdotjs";


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
    popupSelector: any;
    size: Size;
    pathToSvg: string;
    totalTime: number;
    startFinishStates: Action;
    player: Player;
    visualizer: Visualizer;
    qLearner: QLearningAlgorithm;
    private _drawOptimalPathResult: boolean;


    constructor(updateBackground, htmlSelector: string, popupSelector: any, size: Size, pathToSvg: string) {
        this.updateBackground = updateBackground;
        this.htmlSelector = htmlSelector;
        this.popupSelector = popupSelector;
        this.size = size;
        this.pathToSvg = pathToSvg;
        this.problem = undefined;
        this.episodes = 500;
        this.totalTime = 300;
        this.startFinishStates = undefined;
        this.player = undefined;
        this.qLearner = undefined;
        this._drawOptimalPathResult = undefined;
        this.addEventListenerToRLPopup();
        console.log("New RL-Module created.");
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


        let promise = new Promise<void>(function (resolve) {
            that.player.timer.addEventListener("stop", function () {
                that.visualizer.drawFinalOptimalPath()
                    .then(() => {

                        let copyOfSVG: SVG.Svg = (<Svg>that.visualizer.svg.findOne("svg")).clone();
                        copyOfSVG.viewbox("69.77 484.02 1962.26 946.08");
                        copyOfSVG.size(1962.26/2, 946.08/2)
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

                        let point: {x, y} = (<Path>copyOfSVG.findOne(".finalPath-outline")).pointAt(0);
                        let rect = copyOfSVG.rect(50, 50).cx(point.x).cy(point.y).attr({ fill: '#f06' });

                        let learnedImageHTML = copyOfSVG.svg();

                        //The svg transferred via URI gets also broken, if the namespace of svgjs and its references in certain elements remain in the svg.
                        // For this reason, they must be removed from the svg that is to be transferred.
                        learnedImageHTML = learnedImageHTML.replace(/svgjs:data="{[^}]*}"/g, "");
                        learnedImageHTML = learnedImageHTML.replace('xmlns:svgjs="http://svgjs.com/svgjs"', "");

                        let learnedImage = window.btoa(learnedImageHTML);
                        let temp: string = 'data:image/svg+xml;base64,' + learnedImage;
                        that.updateBackground(9, temp);

                        resolve();
                    })


            })

        });



        return promise;

    }


    private addEventListenerToRLPopup() {
        let that = this;
        if (this.popupSelector && this.popupSelector.on) {
            this.popupSelector.on("hidden.bs.modal", function() {
                if (that.player){
                    that.player.pause();
                }
            });
        }

    }

    get drawOptimalPathResult(): boolean {
        return this._drawOptimalPathResult;
    }

    set drawOptimalPathResult(value: boolean) {
        this._drawOptimalPathResult = value;
    }
}