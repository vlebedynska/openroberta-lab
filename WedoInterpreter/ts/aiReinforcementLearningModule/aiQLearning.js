class QLearningAlgorithm {
    constructor(qvalues, state, timelimit, episodes) {
        this.qvalues = qvalues//new QValueStore();
        this.state = state;
        this.timelimit = timelimit;
        this.episodes = episodes;

    }

    qLearner(problem, episodes, timeLimit, alpha, gamma, rho, nu) {
        var state = problem.getRandomState();
        while( (timeLimit > 0)  &&  (episodes > 0)) {
            var startTime = Date.now();
            if (random < nu) {
                state = problem.getRandomState();
                var actions = problem.getAvailableActions(this.state);
                if (random < rho) {
                    var action = takeOneOfActions(actions);
                } else {
                    action = this.qvalues.getBestAction(state);
                    var rewardAndNewState = problem.takeAction(state, action);
                    var q = this.qvalues.getQValue(state, action);
                    var maxQ = this.qvalues.getQValue(newState, this.qvalues.getBestAction(newState));
                    q = (1-alpha) * q + alpha * (reward + gamma * maxQ);
                    this.qvalues.storeQValue(state, action, q);
                    state = newState;
                    timeLimit = timeLimit - (Date.now()- startTime);
                    episodes = episodes - 1;
                }
            }
        }
    }
}

class ReinforcementProblem {

    constructor(states, actions) {
        this.problem = problem;
    }

    getRandomState() {
        return randomState
    }

    getAvailableActions(state) {
        return possibleActions;
    }

    takeAction(state, action) {
        return rewardAndNewState;
    }

}


class QValueStore {

    getQValue(state, action) {
        return associatedQValue;
    }

    getBestAction(state) {
        return maxValue(state)
    }

    storeQValue(state, action, value) {
        // QValues[state][action] = value
    }


}