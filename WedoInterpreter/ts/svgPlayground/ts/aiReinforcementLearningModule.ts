import * as SVG from "svgdotjs";
import {Action, Player, QLearningStep} from "models";
import {Size, Visualizer} from "visualizer";
import {Utils} from "utils";
import {PlayerImpl} from "playerImpl";
import {QLearningAlgorithm} from "qLearner";

export interface QlearningAlgorithmParameters {
    // svg: SVG.Svg;
    startNode: number;
    updateBackground: any;
    finishNode: number;
    // problem: ReinforcementProblem;
    alpha: number;
    gamma: number;
    nu: number;
    rho: number;
    // qValueStore: QValueStore;
    episodes: number;
    totalTime: number;
    obstaclesList: Array<Obstacle>;
        //Action[];
}



export class QLearningAlgorithmModule {

    svg: SVG.Svg;
    startNode: number;
    updateBackground: any;
    finishNode: number;
    problem: ReinforcementProblem;
    alpha: number;
    gamma: number;
    nu: number;
    rho: number;
    qValueStore: QValueStore;
    episodes: number;
    timePerEpisode: number;
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
        this.htmlSelector = htmlSelector;
        this.size = size;
        this.pathToSvg = pathToSvg;
        this.problem = undefined;
        this.qValueStore = undefined;
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




         // this.startNode = startNode;
         // this.finishNode = finishNode;

     }



    setUpQLearningBehaviour(alpha: number, gamma: number, nu:number, rho:number) {
        this.alpha = alpha;
        this.gamma = gamma;
        this.nu = nu;
        this.rho = rho;
    }


    runQLearner(): void {
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






    drawOptimalPath() {
        let that = this;
        this.player.timer.addEventListener("stop", function () {
            let optimalPathResult: OptimalPathResult = that.qLearner.findOptimalPath(that.startFinishStates.startState.id, that.startFinishStates.finishState.id);
            if (optimalPathResult.resultState == ResultState.ERROR) {
                console.log(optimalPathResult.optimalPath + "ist not an optimal Path.")
            }
            that.visualizer.drawPath(optimalPathResult.optimalPath);

        })





        // var copyOfSVG: SVG.Svg = this.svg.clone();
        // RlUtils.hideAllPathsExeptTheOptimal(copyOfSVG);
        // var learnedImageHTML = copyOfSVG.svg();
        // var learnedImage = window.btoa(learnedImageHTML);
        // var temp: string = 'data:image/svg+xml;base64,' + learnedImage;
        // this.updateBackground(9, temp);
    }







    get drawOptimalPathResult(): boolean {
        return this._drawOptimalPathResult;
    }

    set drawOptimalPathResult(value: boolean) {
        this._drawOptimalPathResult = value;
    }




}



class RlUtils {

    private static readonly REWARD_VALUE = 50;
    private static readonly DEFAULT_REWARD_VALUE = 0;



    static generateRewardsAndProblem(allActions: Array<Action>, startFinishState: Action): Array<Array<number>> {
        let statesAndActions = new Array<Array<number>>();
        for (let action of allActions) {
            if (statesAndActions[action.startState.id] == undefined) {
                statesAndActions[action.startState.id] = new Array<number>();
            }
            let rewardValue = RlUtils.DEFAULT_REWARD_VALUE;
            if (action.finishState.id == startFinishState.finishState.id) {
                rewardValue = this.REWARD_VALUE;
            }
            statesAndActions[action.startState.id][action.finishState.id] = rewardValue;
        }
        return statesAndActions;
    }



    static hideAllPathsExeptTheOptimal(svg) {
        svg.find('.cls-customPathColor').hide();
    }




}


// exports.QLearningAlgorithmModule = QLearningAlgorithmModule;

//Utils

export enum ResultState {
    SUCCESS = 1,
    ERROR= 2
}


export interface OptimalPathResult {
    optimalPath: Array<number>;
    resultState: ResultState;
}

class ReinforcementProblem {
    statesAndActions: number[][];
    states: number[];

    constructor(statesAndActions: number[][]) {
        this.statesAndActions = statesAndActions;
        this.states = [];
        for (let i = 0; i < statesAndActions.length; i++) {
            this.states.push(i);
        }
    }

    getRandomState(): number {
        var indexOfState: number = Math.floor(Math.random() * this.states.length)
        return this.states[indexOfState];
    }

    getAvailableActions(state: number): number[] {
        var availableActions: number[] = [];
        var actions: number[] = this.statesAndActions[state];
        var actionIndex: string;
        for (actionIndex in actions) {
            if (actions[actionIndex] !== undefined) {
                availableActions.push(parseInt(actionIndex));
            }
        }
        return availableActions;
    }

    takeAction(state: number, action:number): TakeActionResult {
        var actions: number[] = this.statesAndActions[state];
        return {
            "reward": actions[action],
            "newState": action
        };
    }

    takeOneOfActions(actions: number[]): number {
        let action: number = Math.floor(Math.random() * actions.length);
        return actions[action];
    }
}

interface TakeActionResult {
   reward: number;
   newState: number;
}

class QValueStore {
    qMatrix: number[][];

    constructor(statesAndActions: number[][]) {
        this.qMatrix = [];

        for (var statesIndex in statesAndActions) {
            var actions = statesAndActions[statesIndex].slice().fill(0);
            this.qMatrix.push(actions)

        }

    }

    getQValue(state:number, action:number): number {
        var actions: number[] = this.qMatrix[state];
        return actions[action]; //associatedQValue
    }

    getBestAction(state: number, availableActions: number[]): number {
        var actionsQMatrix: number[] = this.qMatrix[state];
        var bestActionValue: number = -1;
        var bestAction: number;
        for (var actionIndex in actionsQMatrix) {
            var action: number = actionsQMatrix[actionIndex];
            if (action != undefined && availableActions.includes(parseInt(actionIndex)) && action > bestActionValue) {
                bestActionValue = actionsQMatrix[actionIndex];
                bestAction = parseInt(actionIndex);
            }
        }
        return bestAction;
    }

    storeQValue(state: number, action: number, value: number) {
        let actions: number[] = this.qMatrix[state];
        actions[action] = value; // === this.qMatrix[state][action] = value;
    }

    createOptimalPath(startState: number, endState: number, problem: ReinforcementProblem): OptimalPathResult {
        var optimalPath: number[] = [startState];
        var currentState: number = startState;
        var resultState: ResultState = ResultState.SUCCESS;
        while (currentState !== endState) {
            var nextState: number = this.getBestAction(currentState, problem.getAvailableActions(currentState));
            currentState = nextState;
            if (optimalPath.includes(currentState)) {
                console.log("Keinen optimalen Pfad von " + startState + " nach " + endState + " gefunden. Zyklus geschlossen bei: " + currentState);
                resultState = ResultState.ERROR;
                break;
            }
            optimalPath.push(nextState);
        }
        return {optimalPath, resultState};
    }
}
//
//
// class QLearningAlgorithm {
//
//     qLearner(svg: SVG.Svg, problem: ReinforcementProblem, episodes: number, timeLimit: number, alpha: number, gamma: number, rho: number, nu: number, callback): QValueStore {
//         var qValueStore: QValueStore = new QValueStore(problem.statesAndActions);
//         var state: number = problem.getRandomState();
//         var action: number;
//         let previousPath: SVG.Path;
//         var timer = setInterval(function () {
//             var startTime: number = Date.now();
//             if (Math.random() < nu) {
//                 state = problem.getRandomState();
//             }
//             var actions: number[] = problem.getAvailableActions(state);
//             if (Math.random() < rho) {
//                 action = problem.takeOneOfActions(actions);
//             } else {
//                 action = qValueStore.getBestAction(state, actions);
//             }
//             var rewardAndNewState: TakeActionResult = problem.takeAction(state, action);
//             var reward: number = rewardAndNewState.reward;
//             var newState: number = rewardAndNewState.newState;
//             var q: number = qValueStore.getQValue(state, action);
//             var newStateActions: number[] = problem.getAvailableActions(newState);
//             var maxQ: number = qValueStore.getQValue(newState, qValueStore.getBestAction(newState, newStateActions));
//             q = (1 - alpha) * q + alpha * (reward + gamma * maxQ);
//             if (previousPath !== undefined) {
//                 previousPath.stroke({color: '#f8f7f7', dasharray: "0"})
//             }
//             previousPath = RlUtils.findPathWithID(svg, state, newState);
//             let pathLength: number = previousPath.length();
//             let direction: number = state > newState ? -1 : 1;
//             previousPath.stroke({
//                 color: '#8fdc5d',
//                 dasharray: "" + pathLength + ", " + pathLength,
//                 dashoffset: pathLength * direction,
//                 width: q * 2 + 10
//             });
//             // let strokeData: SVG.StrokeData = previousPath.stroke();
//             // strokeData.color = "red";
//             // strokeData.dasharray = "" + pathLength + ", " + pathLength;
//             // strokeData.dashoffset = pathLength * direction;
//             // strokeData.width = q * 2 + 10
//
//             previousPath.animate(200).attr("stroke-dashoffset", "0");
//
//             // previousPath.animate({
//             //     duration: 400,
//             //     delay: 0,
//             //     when: 'now',
//             // }).attr("stroke-dashoffset", 0);
//             qValueStore.storeQValue(state, action, q);
//             console.log("state " + state + " > " + newState + "; reward " + reward + "; q " + q + "; maxQ " + maxQ);
//             state = newState;
//             timeLimit = timeLimit - (Date.now() - startTime);
//             episodes = episodes - 1;
//             if (!((timeLimit > 0) && (episodes > 0))) {
//                 previousPath.stroke({color: '#f8f7f7', dasharray: "0"})
//                 clearInterval(timer);
//                 callback(qValueStore, problem);
//             }
//         }, 200);
//         return qValueStore;
//     }
// }

//
export interface Obstacle {
    startNode: number;
    finishNode: number;
}