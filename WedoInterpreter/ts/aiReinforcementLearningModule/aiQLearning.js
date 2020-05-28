class Test {

    testStart() {
        var statesAndActions = [
            [undefined, 0, undefined, undefined],
            [0, undefined, 0, undefined],
            [undefined, 0, undefined, 100],
            [undefined, undefined, 0, 100]
        ];
        var problem = new ReinforcementProblem(statesAndActions);

        new QLearningAlgorithm().qLearner(problem, 600, 9007199254740991, 0.1,0.1, 0.1, 1 )

    }
}

class QLearningAlgorithm {
    // constructor() {
    //     this.qvalues = new QValueStore();
    //
    // }
    qLearner(problem, episodes, timeLimit, alpha, gamma, rho, nu) {
        var qValueStore = new QValueStore(problem.statesAndActions);
        var state = problem.getRandomState();
        var action;
        while( (timeLimit > 0)  &&  (episodes > 0)) {
            var startTime = Date.now();
            if (Math.random() < nu) {
                state = problem.getRandomState();
            }
            var actions = problem.getAvailableActions(state);
            if (Math.random() < rho) {
                action = problem.takeOneOfActions(actions);
            } else {
                action = qValueStore.getBestAction(state);
            }
            var rewardAndNewState = problem.takeAction(state, action);
            var reward = rewardAndNewState["reward"];
            var newState = rewardAndNewState["newState"];
            var q = qValueStore.getQValue(state, action);
            var maxQ = qValueStore.getQValue(newState, qValueStore.getBestAction(newState));
            q = (1-alpha) * q + alpha * (reward + gamma * maxQ);
            qValueStore.storeQValue(state, action, q);
            console.log("state " + state + " > " + newState + "; reward " + reward + "; q " + q + "; maxQ " + maxQ);
            state = newState;
            timeLimit = timeLimit - (Date.now()- startTime);
            episodes = episodes - 1;


        }
    }
}

class ReinforcementProblem {

    constructor(statesAndActions) {
        this.statesAndActions = statesAndActions;
        this.states = [];
        for (let state of statesAndActions.keys()) {
            this.states.push(state);
        }
    }

    getRandomState() {
        var indexOfState = Math.floor(Math.random() * this.states.length)
        return this.states[indexOfState] ;
    }

    getAvailableActions(state) {
        var availableActions = [];
        var actions = this.statesAndActions[state];
        for (var actionIndex in actions) {
            if (actions[actionIndex] !== undefined) {
                availableActions.push(actionIndex);
            }
        }
        return availableActions;
    }

    takeAction(state, action) {
        var actions = this.statesAndActions[state];
        return {
            "reward": actions[action],
            "newState" : action
        };
    }

    takeOneOfActions(actions) {
        return actions[Math.floor(Math.random() * actions.length)];
    }
}


class QValueStore {

    constructor(statesAndActions) {
        this.qMatrix = [];

        for (var statesIndex in statesAndActions) {
            var actions = statesAndActions[statesIndex].slice().fill(0);
            this.qMatrix.push(actions)

        }

    }

    getQValue(state, action) {
        var actions = this.qMatrix[state];
        return actions[action]; //associatedQValue
    }

    getBestAction(state) {
        var actions = this.qMatrix[state];
        var bestActionValue = -1;
        var bestAction;
        for (var actionIndex in actions) {
            var action = actions[actionIndex];
            if (action != undefined && action > bestActionValue) {
                bestActionValue = actions[actionIndex];
                bestAction = actionIndex
            }
        }
        return bestAction;


        // var actionsFiltered = actions.filter(function(item) {
        //     return item != undefined;
        // });
        // return Math.max(...actionsFiltered); //maxValue(state)
    }

    storeQValue(state, action, value) {
        var actions = this.qMatrix[state];
        actions[action] = value; // === this.qMatrix[state][action] = value;
    }


}