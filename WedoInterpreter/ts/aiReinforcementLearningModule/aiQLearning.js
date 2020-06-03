class Test {

    testStart(){
        var that = this;
        var statesAndActions = [
            [undefined, 100, undefined, undefined],
            [0, undefined, 0, undefined],
            [undefined, 0, undefined, 0],
            [undefined, undefined, 0, 0]
        ];
        var problem = new ReinforcementProblem(statesAndActions);
        var qLearnerCallback = function (qValueStore) {
                console.log(qValueStore);
                that.createOptimalPath(qValueStore, "D", "A");
        }
        new QLearningAlgorithm().qLearner(problem, 300   , 9007199254740991, 0.1,0.5, 1, 0.1, qLearnerCallback)


    }

    createOptimalPath(qValueStore, startNode, finishNode) {
        var lastQValues = [];
        var chars = "ABCDEFGHI";
        var test;
        for(var i = chars.indexOf(startNode); i !== chars.indexOf(finishNode); i=test) {
            var qValueLine = qValueStore.qMatrix[i];
            var id = this.indexOfMax(qValueLine);
            lastQValues.push(chars.charAt(i) + chars.charAt(id))
            test = id;
        }
    }

    indexOfMax(arr) {
        if (arr.length === 0) {
            return -1;
        }
        var max = arr[0];
        var maxIndex = 0;
        for (var i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                maxIndex = i;
                max = arr[i];
            }
        }
        return maxIndex;
    }

}

class QLearningAlgorithm {
    
    qLearner(problem, episodes, timeLimit, alpha, gamma, rho, nu, callback) {
        var qValueStore = new QValueStore(problem.statesAndActions);
        var state = problem.getRandomState();
        var action;
        var chars = "ABCDEFGHI";

        var timer = setInterval(function () {

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
            svg.find("#"+chars.charAt(state) + chars.charAt(newState)).stroke({width: q/10})
            qValueStore.storeQValue(state, action, q);
            console.log("state " + state + " > " + newState + "; reward " + reward + "; q " + q + "; maxQ " + maxQ);
            state = newState;
            timeLimit = timeLimit - (Date.now()- startTime);
            episodes = episodes - 1;
            if( !((timeLimit > 0)  &&  (episodes > 0))) {
                clearInterval(timer);
                callback(qValueStore);
            }
        }, 50);
        return qValueStore;
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
        //TODO Available Actions ?
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
        //TODO Available Actions ?
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
    }

    storeQValue(state, action, value) {
        var actions = this.qMatrix[state];
        actions[action] = value; // === this.qMatrix[state][action] = value;
    }


}