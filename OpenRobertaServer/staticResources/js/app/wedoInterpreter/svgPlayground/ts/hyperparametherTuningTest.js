define(["require", "exports", "hyperparameterTuning"], function (require, exports, hyperparameterTuning_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function test() {
        let parameterOptions = {
            alpha: [0.01, 0.3, 0.5, 0.7, 0.99], gamma: [0.02, 0.2, 0.5, 0.7, 0.99], nu: [0.01, 0.5, 0.99], rho: [0.01, 0.5, 0.99] //nu[0.01, 0.5, 0.99]
        };
        let problemParamsList = new Array();
        let firstProblemParams = {
            size: { width: 629, height: 352 },
            episodes: 100,
            finishNode: 1,
            htmlSelector: "#qLearningBackgroundArea",
            obstaclesList: [{ startNode: 3, finishNode: 2 }, { startNode: 2, finishNode: 3 }],
            pathToSvg: "../public/Eisenbahn_Design_End.svg",
            problemName: "Eisenbahnkarte",
            startNode: 3,
        };
        let secondProblemParams = {
            size: { width: 629, height: 352 },
            episodes: 50,
            finishNode: 7,
            htmlSelector: "#qLearningBackgroundArea",
            obstaclesList: [{ startNode: 4, finishNode: 6 }],
            pathToSvg: "../public/_Wald_Labyrinth_End.svg",
            problemName: "Waldkarte",
            startNode: 0,
        };
        let thirdProblemParams = {
            size: { width: 629, height: 352 },
            episodes: 500,
            finishNode: 15,
            htmlSelector: "#qLearningBackgroundArea",
            obstaclesList: [{ startNode: 16, finishNode: 15 }],
            pathToSvg: "../public/_Stadt_End.svg",
            problemName: "Stadtkarte",
            startNode: 0,
        };
        problemParamsList.push(firstProblemParams);
        // problemParamsList.push(secondProblemParams);
        // problemParamsList.push(thirdProblemParams);
        let numberOfExecutions = 50;
        hyperparameterTuning_1.HyperparameterTuning.create(parameterOptions, problemParamsList).then(x => x.executeTests(handleTestResult, numberOfExecutions));
    }
    function handleTestResult(testResult, behavior) {
        // console.log(JSON.stringify(testResult) + " " + JSON.stringify(behavior));
        document.getElementById("qLearningBackgroundArea2").append(testResultToString(testResult, behavior), document.createElement('br'));
    }
    function testResultToString(testResult, behavior, separator = ";") {
        let testResultString = [
            "" + testResult.mapName,
            "" + behavior.alpha,
            "" + behavior.gamma,
            "" + behavior.rho,
            "" + behavior.nu,
            "" + testResult.episodes,
            "" + testResult.optimalPathLength
        ];
        return testResultString.join(separator);
    }
    test();
});
