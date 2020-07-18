import {QLearningAlgorithmModule} from "aiReinforcementLearningModule";
import {QlearningAlgorithmParameters} from "models";

// var svg = SVG.SVG().addTo('body').size(300, 300)
// var rect = svg.rect(100, 100).attr({ fill: '#f06' })

var updateBackground: Function = function () {
    console.log("Hallo");
};

var qLearningAlgorithmModule: QLearningAlgorithmModule =
    new QLearningAlgorithmModule(
        updateBackground,
        "#qLearningBackgroundArea",
        "#simConfigRLQLearningModal",
        {width: 629, height: 352},
        "../public/Eisenbahn_Design_End.svg"
    );


let qLearningParams: QlearningAlgorithmParameters = {
    alpha: 0.5,
    episodes: 150,
    finishNode: 4,
    gamma: 0.8,
    nu: 0.9,
    rho: 0.5,
    startNode: 0,
    totalTime: 500,
    updateBackground: updateBackground,
    obstaclesList: [{startNode: 1, finishNode:2}]
// {startNode: 1, finishNode:2}
        // [{startState: {id:1}, finishState: {id:2}}]
}



function createQLearningEnvironment(obstaclesList, startNode, finishNode) {
    return qLearningAlgorithmModule.createQLearningEnvironment(obstaclesList, startNode, finishNode);
}

function setUpQLearningBehaviour(alpha, gamma, nu, rho) {
    qLearningAlgorithmModule.setUpQLearningBehaviour(alpha, gamma, nu, rho);
}

function runQLearner() {
    return qLearningAlgorithmModule.runQLearner();
}

function drawOptimalPath() {
    qLearningAlgorithmModule.drawOptimalPath();
}

createQLearningEnvironment(qLearningParams.obstaclesList, qLearningParams.startNode, qLearningParams.finishNode).then(r => {
    setUpQLearningBehaviour(qLearningParams.alpha, qLearningParams.gamma, qLearningParams.nu, qLearningParams.rho);
    runQLearner();
    drawOptimalPath();


});

