import {QLearningAlgorithmModule} from "aiReinforcementLearningModule";
import {QlearningAlgorithmParameters} from "models";
import {SVG, Svg} from "svgdotjs";
import {Visualizer} from "visualizer";
import {Utils} from "utils";

// var svg = SVG.SVG().addTo('body').size(300, 300)
// var rect = svg.rect(100, 100).attr({ fill: '#f06' })

var updateBackground: Function = function () {
    console.log("Hallo");
};

var qLearningAlgorithmModule: QLearningAlgorithmModule =
    new QLearningAlgorithmModule(
        updateBackground,
        "#qLearningBackgroundArea",
        "$('#simConfigRLQLearningModal')",
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
    obstaclesList: []
// {startNode: 1, finishNode:2}
        // [{startState: {id:1}, finishState: {id:2}}]
}



function createQLearningEnvironment(obstaclesList, startNode, finishNode) {
    return qLearningAlgorithmModule.createQLearningEnvironment(obstaclesList, startNode, finishNode);
}

function setUpQLearningBehaviour(alpha, gamma, nu, rho) {
    qLearningAlgorithmModule.setUpQLearningBehaviour(alpha, gamma, nu, rho);
}

function runQLearner(episodes: number, time: number) {
    return qLearningAlgorithmModule.runQLearner(episodes, time);
}

function drawOptimalPath() {
    qLearningAlgorithmModule.drawOptimalPath();
}

async function loadSVG() {
    let v: Visualizer = await Visualizer.createVisualizer("../public/Eisenbahn_Design_End.svg",
        "#qLearningBackgroundArea", {width: 300, height: 400});
    let ourSvg: Svg = (<Svg>v.svg.findOne("svg"));

    // let svgText: string = await Utils.file_get_contents("../public/Eisenbahn_Design_End.svg");

    let learnedImageHTML = ourSvg.svg();

    learnedImageHTML = learnedImageHTML.replace(/svgjs:data="{[^}]*}"/g, "");
    learnedImageHTML = learnedImageHTML.replace('xmlns:svgjs="http://svgjs.com/svgjs"', "");

    let learnedImage = window.btoa(learnedImageHTML);
    let temp: string = 'data:image/svg+xml;base64,' + learnedImage;
    let img = new Image();
    img.onload = e => {
        console.log("loaded!")
    };

    img.onerror = e => {
        console.log("error!")
    };

    img.src = "../public/Eisenbahn_Design_End.svg";




}

loadSVG().then(r => {

});

createQLearningEnvironment(qLearningParams.obstaclesList, qLearningParams.startNode, qLearningParams.finishNode).then(r => {
    setUpQLearningBehaviour(qLearningParams.alpha, qLearningParams.gamma, qLearningParams.nu, qLearningParams.rho);
    runQLearner(qLearningParams.episodes, qLearningParams.totalTime);
    drawOptimalPath();

});

