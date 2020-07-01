import * as SVG from "svgdotjs";
import * as aiqlearning from "./aiReinforcementLearningModule"
import {QLearningAlgorithmModule, QlearningAlgorithmParameters} from "./aiReinforcementLearningModule";

var svg = SVG.SVG().addTo('body').size(300, 300)
var rect = svg.rect(100, 100).attr({ fill: '#f06' })

var updateBackground: Function = function () {
    console.log("Hallo");
};

var qLearningAlgorithmModule: QLearningAlgorithmModule =
    new aiqlearning.QLearningAlgorithmModule(
        updateBackground,
        "#qLearningBackgroundArea",
        {width: 629, height: 352},
        "../public/PopUPDesign_Minimal.svg"
    );


let qLearningParams: QlearningAlgorithmParameters = {
    alpha: 0.9,
    episodes: 150,
    finishNode: 7,
    gamma: 0.5,
    nu: 0.5,
    rho: 0.6,
    startNode: 0,
    timePerEpisode: 500,
    updateBackground: updateBackground,
    obstaclesList: []
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

});


// var timer = setTimeout(function (){
//     setUpQLearningBehaviour(qLearningParams.alpha, qLearningParams.gamma, qLearningParams.nu, qLearningParams.rho);
//     var pauseAfterRunningTheQlearner = runQLearner();
//     setTimeout(drawOptimalPath, pauseAfterRunningTheQlearner)
// }, pause);
