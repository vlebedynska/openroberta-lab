const linkIDPrefix = "path-";
const finishNode = 7;

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
        var statesAndActions = generateStatesAndActionsFromSVG(svg, finishNode);
        // var statesAndActions = [
        //     [undefined, 100, undefined, undefined],
        //     [0, undefined, 0, undefined],
        //     [undefined, 0, undefined, 0],
        //     [undefined, undefined, 0, 0]
        // ];
        var problem = new ReinforcementProblem(statesAndActions);
        new QLearningAlgorithm().qLearner(problem, 150, 9007199254740991, 0.1, 0.8, 0.1, 0.1, that.qLearnerCallback)


    }

    qLearnerCallback (qValueStore, problem) {
        console.log(qValueStore);
        drawOptimalPath(qValueStore.createOptimalPath(0, finishNode, problem));
        hideAllPathsExeptTheOptimal();
    }



}

function hideAllPathsExeptTheOptimal() {
    svg.find('.cls-customPathColor').hide();
}

function drawOptimalPath(optimalPathResult) {
    if (optimalPathResult.resultState == ResultState.ERROR) {
        console.log("...")
    } else {
        var combinedPath;
        for (var qValue in optimalPathResult.optimalPath) {
            var firstValue = optimalPathResult.optimalPath[parseInt(qValue)];
            var secondValue = optimalPathResult.optimalPath[parseInt(qValue)+1];
            if (secondValue !== null) {
                try {

                    if (combinedPath == undefined) {
                        var combinedPath = findPathWithID(svg, firstValue, secondValue);
                    } else {
                        var temp = findPathWithID(svg, firstValue, secondValue).array();
                        // temp.stroke({linecap: 'round'})
                        temp.splice(0, 1);
                        combinedPath.array().push(...temp)
                        combinedPath.plot(combinedPath.array());
                    }
                } catch (error) {
                    //console.log(pathCopyWhite + " > " + pathCopyBlack)
                }
            }
        }
        combinedPath.addTo(svg);
        combinedPath.removeClass('cls-customPathColor');
        combinedPath.addClass('pink-flower')
        combinedPath.stroke({width: 80, color: '#ffffff', opacity: 1, linecap: 'round', linejoin: 'round' })
            .fill('none');

        var pathCopyBlack = combinedPath.clone();
        pathCopyBlack.addTo(svg);
        pathCopyBlack.removeClass('cls-customPathColor')
        pathCopyBlack.addClass('pink-flower')
        pathCopyBlack.stroke({width: 30, color: '#000000'})
            .fill('none');
        console.log(combinedPath.array())
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
                action = qValueStore.getBestAction(state, actions);
            }
            var rewardAndNewState = problem.takeAction(state, action);
            var reward = rewardAndNewState["reward"];
            var newState = rewardAndNewState["newState"];
            var q = qValueStore.getQValue(state, action);
            var newStateActions = problem.getAvailableActions(newState);
            var maxQ = qValueStore.getQValue(newState, qValueStore.getBestAction(newState, newStateActions));
            q = (1 - alpha) * q + alpha * (reward + gamma * maxQ);
            if (previousPath !== undefined) {
                previousPath.stroke({color: '#f8f7f7', dasharray: "0"})
            }
            previousPath = findPathWithID(svg, state, newState);
            let pathLength = previousPath.length();
            let direction = state > newState ? -1 : 1;
            previousPath.stroke({color: '#8fdc5d', dasharray: "" + pathLength + ", " + pathLength , dashoffset: "" + (pathLength*direction), width: q*2 + 10});
            previousPath.animate({
                duration: 100,
                delay: 0,
                when: 'now',
            }).attr( "stroke-dashoffset", 0 );
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
        }, 100);
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

    getBestAction(state, availableActions) {
        var actionsQMatrix = this.qMatrix[state];
        var bestActionValue = -1;
        var bestAction;
        for (var actionIndex in actionsQMatrix) {
            var action = actionsQMatrix[actionIndex];
            if (action != undefined && availableActions.includes(""+actionIndex) && action > bestActionValue ) {
                bestActionValue = actionsQMatrix[actionIndex];
                bestAction = actionIndex
            }
        }
        return bestAction;
    }

    storeQValue(state, action, value) {
        var actions = this.qMatrix[state];
        actions[action] = value; // === this.qMatrix[state][action] = value;
    }

    createOptimalPath(startState, endState, problem) {
        var optimalPath = [startState];
        var currentState = startState;
        var resultState = ResultState.SUCCESS;
        while (currentState !== endState) {
            var nextState = parseInt(this.getBestAction(currentState, problem.getAvailableActions(currentState)));
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

