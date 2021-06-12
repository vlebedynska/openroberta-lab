import * as SVG from "svgdotjs";
import {Action, Obstacle, OptimalPathResult, Player, Pose, QLearningStep, ResultState} from "models";
import {Size, Visualizer} from "visualizer";
import {Utils} from "utils";
import {PlayerImpl} from "playerImpl";
import {QLearningAlgorithm, ReinforcementProblem, RlUtils} from "qLearner";
import {Path, Point, Rect, Svg} from "svgdotjs";


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

    /**
     *
     * @param updateBackground
     * @param htmlSelector
     * @param popupSelector
     * @param size
     * @param pathToSvg
     */
    constructor(updateBackground, htmlSelector: string, popupSelector: any, size: Size, pathToSvg: string) {
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


    async runQLearner(episodes: number, time: number) {
        this.episodes = episodes;
        this.totalTime = time;
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

                        // <rect id="myScene" x="69.77" y="484.02" width="1962.26" height="946.08" fill="none"/>

                        let copyOfSVG: SVG.Svg = (<Svg>that.visualizer.svg.findOne("svg")).clone();
                        let sceneToBeTransmitted: Rect = <Rect>that.visualizer.svg.findOne("#myScene");
                        let x = sceneToBeTransmitted.x();
                        let y = sceneToBeTransmitted.y();
                        let width = sceneToBeTransmitted.width();
                        let height = sceneToBeTransmitted.height();
                        copyOfSVG.viewbox( x, y, width, height);
                        // copyOfSVG.viewbox("69.77 484.02 1962.26 946.08");
                        copyOfSVG.size(width/2, height/2)
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

                        let point0: {x, y} = (<Path>copyOfSVG.findOne(".finalPath-outline")).pointAt(0);
                        let point1: {x, y} = (<Path>copyOfSVG.findOne(".finalPath-outline")).pointAt(60);
                        // let rect = copyOfSVG.rect(50, 50).cx(point0.x).cy(point0.y).attr({ fill: '#f06' });

                        //Berechnung der Steigung
                        // copyOfSVG.line(point0.x, point0.y, point1.x, point1.y).stroke({ width: 10 , color: "red"});
                        //
                        // copyOfSVG.circle(20).fill("red").cx(point1.x).cy(point1.y);


                        //Berechung der Drehung des Roboters
                        // let m = (point1.y - point0.y)*-1 / (point1.x - point0.x);
                        // let theta : number = Math.atan(m)*(-1);

                        let deltaX = (point1.x - point0.x);
                        let deltaY = (point1.y - point0.y);
                        let additionalPi = deltaY > 0 ? 0: Math.PI;
                        let thetaArcCos = deltaX / Math.sqrt(Math.pow(deltaX,2)+Math.pow(deltaY, 2))
                        let theta = Math.acos(thetaArcCos)+additionalPi;

                        point0.x = (point0.x - sceneToBeTransmitted.x())/2;
                        point0.y = (point0.y - sceneToBeTransmitted.y())/2;


                        let pose: Pose = {
                            x : point0.x+10,
                            y : point0.y+10,
                            theta : theta,
                            transX : 0,
                            transY : 0
                        };

                        let poses: Array<Pose> = new Array<Pose>();
                        poses.push(pose);


                        let learnedImageHTML = copyOfSVG.svg();

                        //The svg transferred via URI gets also broken, if the namespace of svgjs and its references in certain elements remain in the svg.
                        // For this reason, they must be removed from the svg that is to be transferred.
                        learnedImageHTML = learnedImageHTML.replace(/svgjs:data="{[^}]*}"/g, "");
                        learnedImageHTML = learnedImageHTML.replace('xmlns:svgjs="http://svgjs.com/svgjs"', "");

                        let learnedImage = window.btoa(learnedImageHTML);
                        let temp: string = 'data:image/svg+xml;base64,' + learnedImage;
                        that.updateBackground(9, temp, poses);

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