import * as SVG from "@svgdotjs/svg.js";
import {Element, List} from "@svgdotjs/svg.js";
import {Action} from "./models";
// import * as $ from "jquery";

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
    timePerEpisode: number;
    obstaclesList: Action[];
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

    constructor(updateBackground) {
        this.svg = SVG.SVG();
        this.startNode = undefined;
        this.finishNode = undefined;
        this.problem = undefined;
        this.alpha = undefined;
        this.gamma = undefined;
        this.nu = undefined;
        this.rho = undefined;
        this.qValueStore = undefined;
        this.episodes = 150;
        this.timePerEpisode = 200; //TODO - auch im QLearner anpassen
        this.updateBackground = updateBackground;

    }

    createQLearningEnvironment(obstaclesList: Action[], startNode: number, finishNode: number): number {
        this.startNode = startNode;
        this.finishNode = finishNode;
        let path: string = "./marsTopView.svg";
        this.loadSVG(path, obstaclesList, finishNode);
        return 1000; //TODO
    }


    loadSVG(filePath: string, obstaclesList: Action[], finishNode: number) {
        let that = this;
        RlUtils.file_get_contents(filePath, function (text) {
            that.drawSVG(text);
            let statesAndActions: number[][] = RlUtils.generateStatesAndActionsFromSVG(that.svg, obstaclesList, finishNode);
            that.problem = new ReinforcementProblem(statesAndActions);
        });

    }

    drawSVG(text: string) {
        document.getElementById('qLearningBackgroundArea').innerText="";
        this.svg = SVG.SVG().addTo('#qLearningBackgroundArea').size(3148 / 5, 1764 / 5).viewbox("0 0 3148 1764");
        this.svg.svg(text);
        this.svg.find('.cls-customPathColor').each(e => e.stroke({color: '#fcfcfc', opacity: 0.9, width: 0}));
    }


    setUpQLearningBehaviour(alpha: number, gamma: number, nu:number, rho:number) {
        this.alpha = alpha;
        this.gamma = gamma;
        this.nu = nu;
        this.rho = rho;
    }

    learningEnded(qValueStore, problem) {

    }

    runQLearner(): number {
        this.qValueStore = new QLearningAlgorithm().qLearner(this.svg, this.problem, this.episodes, 9007199254740991, this.alpha, this.gamma, this.rho, this.nu, this.learningEnded)
        return this.episodes * this.timePerEpisode;
    }

    drawOptimalPath() {
        console.log(this.qValueStore);
        var optimalPathResult: OptimalPathResult = this.qValueStore.createOptimalPath(this.startNode, this.finishNode, this.problem);
        this.drawOptimalPathIntern(optimalPathResult);
        var copyOfSVG: SVG.Svg = this.svg.clone();
        RlUtils.hideAllPathsExeptTheOptimal(copyOfSVG);
        var learnedImageHTML = copyOfSVG.svg();
        var learnedImage = window.btoa(learnedImageHTML);
        var temp: string = 'data:image/svg+xml;base64,' + learnedImage;
        this.updateBackground(9, temp);
    }

    drawOptimalPathIntern(optimalPathResult) {
        if (optimalPathResult.resultState == ResultState.ERROR) {
            console.log("...")
        } else {
            var combinedPath: SVG.Path;
            for (var qValue in optimalPathResult.optimalPath) {
                var firstValue: number = optimalPathResult.optimalPath[parseInt(qValue)];
                var secondValue: number = optimalPathResult.optimalPath[parseInt(qValue) + 1];
                if (secondValue !== null) {
                    try {
                        // combinedPathTestPurpose = RlUtils.findPathWithID(this.svg, firstValue, secondValue);
                        // combinedPathTestPurpose.addTo(this.svg);
                        // combinedPathTestPurpose.stroke({width: 20, color: '#1ad274'})

                        if (combinedPath == undefined) {
                            var combinedPath: SVG.Path = RlUtils.findPathWithID(this.svg, firstValue, secondValue);
                        } else {
                            var temp: SVG.PathArray = RlUtils.findPathWithID(this.svg, firstValue, secondValue).array();
                            // temp.stroke({linecap: 'round'})
                            temp.splice(0, 1);
                            combinedPath.array().push(...temp)
                            combinedPath.plot(combinedPath.array());
                        }
                    } catch (error) {
                        console.log(combinedPath);
                    }
                }
            }
            combinedPath.addTo(this.svg);
            combinedPath.removeClass('cls-customPathColor');
            combinedPath.addClass('pink-flower')
            combinedPath.stroke({width: 80, color: '#ffffff', opacity: 1, linecap: 'round', linejoin: 'round'})
                .fill('none');

            var pathCopyBlack: SVG.Path = combinedPath.clone();
            pathCopyBlack.addTo(this.svg);
            pathCopyBlack.removeClass('cls-customPathColor')
            pathCopyBlack.addClass('pink-flower')
            pathCopyBlack.stroke({width: 30, color: '#000000'})
                .fill('none');
            console.log(combinedPath.array())
        }

    }
}



class RlUtils {

    static generateStatesAndActionsFromSVG(svg: SVG.Svg, obstaclesList: Action[], finishNode: number): number[][] {
        var statesAndActions: number[][] = [];
        var allPathes: List<Element> = svg.find('.cls-customPathColor');
        var obstaclesArray: string[] = [];
        for (var obstacleItem in obstaclesList) {
            let obstacle = obstaclesList[obstacleItem]
            obstaclesArray.push(obstacle.startNode + "-" + obstacle.finishNode);
        }
        allPathes.each(function (item) {
            // let obstaclePresent = false;
            let idName: string = item.attr("id");
            let tokens: string[] = idName.split("-");
            let firstValue: number = parseInt(tokens[1]); //0
            let secondValue: number = parseInt(tokens[2]); //1
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
    static findPathWithID(svg, firstValue, secondValue): SVG.Path{
        const linkIDPrefix = "path-";
        var foundPath = svg.findOne('#' + linkIDPrefix + firstValue + "-" + secondValue)
        return <SVG.Path>foundPath;
    }

}


// exports.QLearningAlgorithmModule = QLearningAlgorithmModule;

//Utils

enum ResultState {
    SUCCESS = 1,
    ERROR= 2
}


interface OptimalPathResult {
    optimalPath: number[];
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


class QLearningAlgorithm {

    qLearner(svg: SVG.Svg, problem: ReinforcementProblem, episodes: number, timeLimit: number, alpha: number, gamma: number, rho: number, nu: number, callback): QValueStore {
        var qValueStore: QValueStore = new QValueStore(problem.statesAndActions);
        var state: number = problem.getRandomState();
        var action: number;
        let previousPath: SVG.Path;
        var timer = setInterval(function () {
            var startTime: number = Date.now();
            if (Math.random() < nu) {
                state = problem.getRandomState();
            }
            var actions: number[] = problem.getAvailableActions(state);
            if (Math.random() < rho) {
                action = problem.takeOneOfActions(actions);
            } else {
                action = qValueStore.getBestAction(state, actions);
            }
            var rewardAndNewState: TakeActionResult = problem.takeAction(state, action);
            var reward: number = rewardAndNewState.reward;
            var newState: number = rewardAndNewState.newState;
            var q: number = qValueStore.getQValue(state, action);
            var newStateActions: number[] = problem.getAvailableActions(newState);
            var maxQ: number = qValueStore.getQValue(newState, qValueStore.getBestAction(newState, newStateActions));
            q = (1 - alpha) * q + alpha * (reward + gamma * maxQ);
            if (previousPath !== undefined) {
                previousPath.stroke({color: '#f8f7f7', dasharray: "0"})
            }
            previousPath = RlUtils.findPathWithID(svg, state, newState);
            let pathLength: number = previousPath.length();
            let direction: number = state > newState ? -1 : 1;
            previousPath.stroke({
                color: '#8fdc5d',
                dasharray: "" + pathLength + ", " + pathLength,
                dashoffset: pathLength * direction,
                width: q * 2 + 10
            });
            // let strokeData: SVG.StrokeData = previousPath.stroke();
            // strokeData.color = "red";
            // strokeData.dasharray = "" + pathLength + ", " + pathLength;
            // strokeData.dashoffset = pathLength * direction;
            // strokeData.width = q * 2 + 10

            previousPath.animate(200).attr("stroke-dashoffset", "0");

            // previousPath.animate({
            //     duration: 400,
            //     delay: 0,
            //     when: 'now',
            // }).attr("stroke-dashoffset", 0);
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
        }, 200);
        return qValueStore;
    }
}