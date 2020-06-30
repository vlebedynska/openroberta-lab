define(["require", "exports", "@svgdotjs/svg.js", "./aiReinforcementLearningModule"], function (require, exports, SVG, aiqlearning) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var svg = SVG.SVG().addTo('body').size(300, 300);
    var rect = svg.rect(100, 100).attr({ fill: '#f06' });
    var updateBackground = function () {
        console.log("Hallo");
    };
    var qLearningAlgorithmModule = new aiqlearning.QLearningAlgorithmModule(updateBackground);
    var qLearningParams = {
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
    };
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
    var pause = createQLearningEnvironment(qLearningParams.obstaclesList, qLearningParams.startNode, qLearningParams.finishNode);
    var timer = setTimeout(function () {
        setUpQLearningBehaviour(qLearningParams.alpha, qLearningParams.gamma, qLearningParams.nu, qLearningParams.rho);
        var pauseAfterRunningTheQlearner = runQLearner();
        setTimeout(drawOptimalPath, pauseAfterRunningTheQlearner);
    }, pause);
});
