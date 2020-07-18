import {Action, Nu, OptimalPathResult, QLearningStep, ResultState, Rho} from "models";

export class QLearningAlgorithm extends EventTarget {
    private readonly qValueStore: QValueStore;
    private readonly problem: ReinforcementProblem;
    alpha: number
    gamma: number
    rho: number
    nu: number
    private state: number;
    private stepNumber: number;


    constructor(problem: ReinforcementProblem, alpha: number, gamma: number, rho: number, nu: number) {
        super();
        this.problem = problem;
        this.qValueStore = new QValueStore(problem.statesAndActions);
        this.state = this.problem.getRandomState();
        this.stepNumber = 0;
        this.alpha = alpha;
        this.gamma = gamma;
        this.rho = rho;
        this.nu = nu;
    }

    public qLearnerStep(): QLearningStep {
        let action: number;
        let nu: Nu = Math.random() < this.nu ? Nu.RANDOM_STATE : Nu.STAY_ON_PATH;
        let rho: Rho = Math.random() < this.rho ? Rho.EXPLORE : Rho.EXPLOIT;
        let startTime: number = Date.now();
        let qValueOld: number;
        let qValueNew: number;
        let newState: number;
        let duration: number;

        if (nu == Nu.RANDOM_STATE) {
            this.state = this.problem.getRandomState();
        }

        let state: number = this.state;

        let actions: number[] = this.problem.getAvailableActions(this.state);
        switch (rho) {
            case Rho.EXPLORE:
                action = this.problem.takeOneOfActions(actions);
                break;
            case Rho.EXPLOIT:
                action = this.qValueStore.getBestAction(this.state, actions);
                break;
        }

        let rewardAndNewState: TakeActionResult = this.problem.takeAction(this.state, action);
        let reward: number = rewardAndNewState.reward;
        newState = rewardAndNewState.newState;
        qValueOld = this.qValueStore.getQValue(this.state, action);
        let newStateActions: Array<number> = this.problem.getAvailableActions(newState);
        let maxQ: number = this.qValueStore.getQValue(newState, this.qValueStore.getBestAction(newState, newStateActions));
        qValueNew = (1 - this.alpha) * qValueOld + this.alpha * (reward + this.gamma * maxQ);
        this.qValueStore.storeQValue(this.state, action, qValueNew);
        console.log(this.qValueStore)
        console.log("state " + this.state + " > " + newState + "; reward " + reward + "; q " + qValueNew + "; maxQ " + maxQ);
        this.state = newState;
        duration = Date.now() - startTime;

        let qLearningStep: QLearningStep = {
            newState: newState,
            nu: nu,
            qValueNew: qValueNew,
            qValueOld: qValueOld,
            rho: rho,
            state: state,
            duration: duration,
            stepNumber: this.stepNumber,
            highestQValue: this.qValueStore.highestQValue
        }

        this.dispatchEvent(new CustomEvent<QLearningStep>("stepCompleted", {
                detail: qLearningStep
            })
        );
        this.stepNumber++;


        return qLearningStep;
    }

    public findOptimalPath(startState: number, finishState: number): OptimalPathResult {
        return this.qValueStore.createOptimalPath(startState, finishState, this.problem);
    }


}


interface TakeActionResult {
    reward: number;
    newState: number;
}







class QValueStore {

    qMatrix: number[][];
    private _highestQValue: number = 0;

    constructor(statesAndActions: number[][]) {
        this.qMatrix = [];

        for (var statesIndex in statesAndActions) {
            var actions = statesAndActions[statesIndex].slice().fill(0);
            this.qMatrix.push(actions)

        }

    }

    getQValue(state:number, action:number): number {
        let actions: number[] = this.qMatrix[state];
        return actions[action]; //associatedQValue
    }

    getBestAction(state: number, availableActions: number[]): number {
        let actionsQMatrix: number[] = this.qMatrix[state];
        let bestActionValue: number = -1;
        let bestAction: number;
        for (let actionIndex in actionsQMatrix) {
            let action: number = actionsQMatrix[actionIndex];
            if (action != undefined && availableActions.includes(parseInt(actionIndex)) && action > bestActionValue) {
                bestActionValue = actionsQMatrix[actionIndex];
                bestAction = parseInt(actionIndex);
            }
        }
        return bestAction;
    }

    storeQValue(state: number, action: number, value: number) {
        let actions: number[] = this.qMatrix[state];
        actions[action] = value;// === this.qMatrix[state][action] = value;
        this.updateHighestQValue(value);
    }


    updateHighestQValue(qValue: number){
        if (qValue > this._highestQValue) {
            this._highestQValue = qValue;
        }
    }


    createOptimalPath(startState: number, endState: number, problem: ReinforcementProblem): OptimalPathResult {
        let optimalPath: number[] = [startState];
        let currentState: number = startState;
        let resultState: ResultState = ResultState.SUCCESS;
        while (currentState !== endState) {
            let nextState: number = this.getBestAction(currentState, problem.getAvailableActions(currentState));
            if (optimalPath.includes(nextState)) {
                optimalPath.push(nextState);
                console.log("Keinen optimalen Pfad von " + startState + " nach " + endState + " gefunden. Zyklus geschlossen bei: " + currentState);
                resultState = ResultState.ERROR;
                break;
            }
            optimalPath.push(nextState);
            currentState = nextState;
        }
        return {optimalPath, resultState};
    }


    get highestQValue(): number {
        return this._highestQValue;
    }
}







export class ReinforcementProblem {
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
        let indexOfState: number = Math.floor(Math.random() * this.states.length)
        return this.states[indexOfState];
    }

    getAvailableActions(state: number): number[] {
        let availableActions: number[] = [];
        let actions: number[] = this.statesAndActions[state];
        let actionIndex: string;
        for (actionIndex in actions) {
            if (actions[actionIndex] !== undefined) {
                availableActions.push(parseInt(actionIndex));
            }
        }
        return availableActions;
    }

    takeAction(state: number, action:number): TakeActionResult {
        let actions: number[] = this.statesAndActions[state];
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







export class RlUtils {

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