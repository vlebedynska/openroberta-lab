define(["require", "exports", "aiReinforcementLearningModule", "visualizer"], function (require, exports, aiReinforcementLearningModule_1, visualizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // var svg = SVG.SVG().addTo('body').size(300, 300)
    // var rect = svg.rect(100, 100).attr({ fill: '#f06' })
    var updateBackground = function () {
        console.log("Hallo");
    };
    var qLearningAlgorithmModule = new aiReinforcementLearningModule_1.QLearningAlgorithmModule(updateBackground, "#qLearningBackgroundArea", "$('#simConfigRLQLearningModal')", { width: 629, height: 352 }, "../public/Eisenbahn_Design_End.svg");
    let qLearningParams = {
        alpha: 0.5,
        episodes: 150,
        finishNode: 4,
        gamma: 0.8,
        nu: 0.9,
        rho: 0.5,
        startNode: 0,
        totalTime: 500,
        updateBackground: updateBackground,
        obstaclesList: []
        // {startNode: 1, finishNode:2}
        // [{startState: {id:1}, finishState: {id:2}}]
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
    async function loadSVG() {
        let v = await visualizer_1.Visualizer.createVisualizer("../public/Eisenbahn_Design_End.svg", "#qLearningBackgroundArea", { width: 300, height: 400 });
        let ourSvg = v.svg.findOne("svg");
        // let svgText: string = await Utils.file_get_contents("../public/Eisenbahn_Design_End.svg");
        let learnedImageHTML = ourSvg.svg();
        learnedImageHTML = learnedImageHTML.replace(/svgjs:data="{[^}]*}"/g, "");
        learnedImageHTML = learnedImageHTML.replace('xmlns:svgjs="http://svgjs.com/svgjs"', "");
        let learnedImage = window.btoa(learnedImageHTML);
        let temp = 'data:image/svg+xml;base64,' + learnedImage;
        let img = new Image();
        img.onload = e => {
            console.log("loaded!");
        };
        img.onerror = e => {
            console.log("error!");
        };
        img.src = "../public/Eisenbahn_Design_End.svg";
    }
    loadSVG().then(r => {
    });
    createQLearningEnvironment(qLearningParams.obstaclesList, qLearningParams.startNode, qLearningParams.finishNode).then(r => {
        setUpQLearningBehaviour(qLearningParams.alpha, qLearningParams.gamma, qLearningParams.nu, qLearningParams.rho);
        runQLearner();
        drawOptimalPath();
    });
});
//# sourceMappingURL=index_2.js.map