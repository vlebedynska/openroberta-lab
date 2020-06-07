const linkIDPrefix = "path-";


const ResultState = {
    "SUCCESS": 1,
    "ERROR" : 2
}

Object.freeze(ResultState);

function generateStatesAndActionsFromSVG(svg, finishNode) {
    var statesAndActions = [];
    var allPathes = svg.find('.cls-customPathColor');
    allPathes.each(function(item) {
        let idName = item.attr("id");
        let tokens = idName.split("-");
        let firstValue = tokens[1]; //0
        let secondValue = tokens[2]; //1
        if(statesAndActions[firstValue] == undefined) {
            statesAndActions[firstValue] = [];
        } else if (secondValue == finishNode) {
            statesAndActions[firstValue][secondValue] = 50;
        } else {
            statesAndActions[firstValue][secondValue] = 0;
        }
    })
    return statesAndActions;
}

class Test {

    testStart() {
        var that = this;
        var statesAndActions = generateStatesAndActionsFromSVG(svg, 5);
        // var statesAndActions = [
        //     [undefined, 100, undefined, undefined],
        //     [0, undefined, 0, undefined],
        //     [undefined, 0, undefined, 0],
        //     [undefined, undefined, 0, 0]
        // ];
        var problem = new ReinforcementProblem(statesAndActions);
        new QLearningAlgorithm().qLearner(problem, 200, 9007199254740991, 0.1, 0.5, 1, 0.1, that.qLearnerCallback)


    }

    qLearnerCallback (qValueStore) {
        console.log(qValueStore);
        drawOptimalPath(qValueStore.createOptimalPath(0, 5));
    }



}

function drawOptimalPath(optimalPathResult) {
    if (optimalPathResult.resultState == ResultState.ERROR) {
        console.log("...")
    } else {
        for (var qValue in optimalPathResult.optimalPath) {
            var firstValue = optimalPathResult.optimalPath[parseInt(qValue)];
            var secondValue = optimalPathResult.optimalPath[parseInt(qValue)+1];
            if (secondValue !== null) {
                try {
                    var pathCopyWhite = findPathWithID(svg, firstValue, secondValue).clone();
                    pathCopyWhite.addTo(svg2);
                    pathCopyWhite.stroke({width: 80, color: '#d5bfbf'}).back();

                    var pathCopyBlack = findPathWithID(svg, firstValue, secondValue).clone();
                    pathCopyBlack.addTo(svg2);
                    pathCopyBlack.stroke({width: 30, color: '#000000'});
                } catch (error) {
                    console.log(pathCopyWhite + " > " + pathCopyBlack)
                }
            }

        }
    }
}

function findPathWithID(svg, firstValue, secondValue) {
    var foundPath = svg.findOne('#' + linkIDPrefix + firstValue + "-" + secondValue)
    return foundPath;
}

class QLearningAlgorithm {

    qLearner(problem, episodes, timeLimit, alpha, gamma, rho, nu, callback) {
        var qValueStore = new QValueStore(problem.statesAndActions);
        var state = problem.getRandomState();
        var action;
        let previousPath;
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
            q = (1 - alpha) * q + alpha * (reward + gamma * maxQ);
            if (previousPath !== undefined) {
                previousPath.stroke({color: '#f8f7f7', dasharray: "0"})
            }
            previousPath = findPathWithID(svg, state, newState);
            let pathLength = previousPath.length();
            if (state > newState) {
                previousPath.stroke({color: '#8fdc5d', dasharray: "" + pathLength + ", " + pathLength , dashoffset: "" + (pathLength*(-1)), width: q*2 + 10});
                previousPath.animate({
                    duration: 400,
                    delay: 0,
                    when: 'now',
                    // times: 5,
                    // wait: 20
                }).attr( "stroke-dashoffset", 0 );
            } else {
                previousPath.stroke({color: '#8fdc5d', dasharray: "" + pathLength + ", " + pathLength, dashoffset: "" + pathLength, width: q*2 + 10});
                previousPath.animate({
                    duration: 400,
                    delay: 0,
                    when: 'now',
                    // times: 5,
                    // wait: 20
                }).attr( "stroke-dashoffset", 0 );
            }

            qValueStore.storeQValue(state, action, q);
            console.log("state " + state + " > " + newState + "; reward " + reward + "; q " + q + "; maxQ " + maxQ);
            state = newState;
            timeLimit = timeLimit - (Date.now() - startTime);
            episodes = episodes - 1;
            if (!((timeLimit > 0) && (episodes > 0))) {
                previousPath.stroke({color: '#f8f7f7', dasharray: "0"})
                clearInterval(timer);
                callback(qValueStore);
            }
        }, 300);
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
        return this.states[indexOfState];
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
            "newState": action
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

    createOptimalPath(startState, endState) {
        var optimalPath = [startState];
        var currentState = startState;
        var resultState = ResultState.SUCCESS;
        while (currentState !== endState) {
            var nextState = parseInt(this.getBestAction(currentState));
            currentState = nextState;
            if (optimalPath.includes(currentState)) {
                console.log("Zyklus geschlossen bei: " + currentState);
                resultState = ResultState.ERROR;
                break;
            }
            optimalPath.push(nextState);
        }
        return new OptimalPathResult(optimalPath, resultState);
    }
}

class OptimalPathResult {
    constructor(optimalPath, resultState) {
        this.optimalPath = optimalPath;
        this.resultState = resultState;
    }

}

