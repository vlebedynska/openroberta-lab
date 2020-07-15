define(["require", "exports", "models"], function (require, exports, models_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class QLearningAlgorithm extends EventTarget {
        constructor(problem, alpha, gamma, rho, nu) {
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
        qLearnerStep() {
            let action;
            let nu = Math.random() < this.nu ? models_1.Nu.RANDOM_STATE : models_1.Nu.STAY_ON_PATH;
            let rho = Math.random() < this.rho ? models_1.Rho.EXPLORE : models_1.Rho.EXPLOIT;
            let startTime = Date.now();
            let qValueOld;
            let qValueNew;
            let newState;
            let duration;
            if (nu == models_1.Nu.RANDOM_STATE) {
                this.state = this.problem.getRandomState();
            }
            let state = this.state;
            let actions = this.problem.getAvailableActions(this.state);
            switch (rho) {
                case models_1.Rho.EXPLORE:
                    action = this.problem.takeOneOfActions(actions);
                    break;
                case models_1.Rho.EXPLOIT:
                    action = this.qValueStore.getBestAction(this.state, actions);
                    break;
            }
            let rewardAndNewState = this.problem.takeAction(this.state, action);
            let reward = rewardAndNewState.reward;
            newState = rewardAndNewState.newState;
            qValueOld = this.qValueStore.getQValue(this.state, action);
            let newStateActions = this.problem.getAvailableActions(newState);
            let maxQ = this.qValueStore.getQValue(newState, this.qValueStore.getBestAction(newState, newStateActions));
            qValueNew = (1 - this.alpha) * qValueOld + this.alpha * (reward + this.gamma * maxQ);
            this.qValueStore.storeQValue(this.state, action, qValueNew);
            console.log(this.qValueStore);
            console.log("state " + this.state + " > " + newState + "; reward " + reward + "; q " + qValueNew + "; maxQ " + maxQ);
            this.state = newState;
            duration = Date.now() - startTime;
            let qLearningStep = {
                newState: newState,
                nu: nu,
                qValueNew: qValueNew,
                qValueOld: qValueOld,
                rho: rho,
                state: state,
                duration: duration,
                stepNumber: this.stepNumber
            };
            this.dispatchEvent(new CustomEvent("stepCompleted", {
                detail: qLearningStep
            }));
            this.stepNumber++;
            return qLearningStep;
        }
        findOptimalPath(startState, finishState) {
            return this.qValueStore.createOptimalPath(startState, finishState, this.problem);
        }
    }
    exports.QLearningAlgorithm = QLearningAlgorithm;
    class QValueStore {
        constructor(statesAndActions) {
            this.qMatrix = [];
            for (var statesIndex in statesAndActions) {
                var actions = statesAndActions[statesIndex].slice().fill(0);
                this.qMatrix.push(actions);
            }
        }
        getQValue(state, action) {
            let actions = this.qMatrix[state];
            return actions[action]; //associatedQValue
        }
        getBestAction(state, availableActions) {
            let actionsQMatrix = this.qMatrix[state];
            let bestActionValue = -1;
            let bestAction;
            for (let actionIndex in actionsQMatrix) {
                let action = actionsQMatrix[actionIndex];
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
            let optimalPath = [startState];
            let currentState = startState;
            let resultState = models_1.ResultState.SUCCESS;
            while (currentState !== endState) {
                let nextState = this.getBestAction(currentState, problem.getAvailableActions(currentState));
                if (optimalPath.includes(nextState)) {
                    optimalPath.push(nextState);
                    console.log("Keinen optimalen Pfad von " + startState + " nach " + endState + " gefunden. Zyklus geschlossen bei: " + currentState);
                    resultState = models_1.ResultState.ERROR;
                    break;
                }
                optimalPath.push(nextState);
                currentState = nextState;
            }
            return { optimalPath, resultState };
        }
    }
    class ReinforcementProblem {
        constructor(statesAndActions) {
            this.statesAndActions = statesAndActions;
            this.states = [];
            for (let i = 0; i < statesAndActions.length; i++) {
                this.states.push(i);
            }
        }
        getRandomState() {
            let indexOfState = Math.floor(Math.random() * this.states.length);
            return this.states[indexOfState];
        }
        getAvailableActions(state) {
            let availableActions = [];
            let actions = this.statesAndActions[state];
            let actionIndex;
            for (actionIndex in actions) {
                if (actions[actionIndex] !== undefined) {
                    availableActions.push(parseInt(actionIndex));
                }
            }
            return availableActions;
        }
        takeAction(state, action) {
            let actions = this.statesAndActions[state];
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
    exports.ReinforcementProblem = ReinforcementProblem;
    class RlUtils {
        static generateRewardsAndProblem(allActions, startFinishState) {
            let statesAndActions = new Array();
            for (let action of allActions) {
                if (statesAndActions[action.startState.id] == undefined) {
                    statesAndActions[action.startState.id] = new Array();
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
    exports.RlUtils = RlUtils;
    RlUtils.REWARD_VALUE = 50;
    RlUtils.DEFAULT_REWARD_VALUE = 0;
});
