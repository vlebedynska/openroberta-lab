define(["require", "exports", "qLearner", "models", "visualizer", "utils"], function (require, exports, qLearner_1, models_1, visualizer_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HyperparameterTuning {
        constructor(parameterOptions) {
            this.parameterOptions = parameterOptions;
            this.problemsList = new Array();
        }
        static async create(parameterOptions, problemParamList) {
            let hyperparametherTuning = new HyperparameterTuning(parameterOptions);
            for (let problemParam of problemParamList) {
                let problem = await HyperparameterTuning.createProblem(problemParam);
                hyperparametherTuning.problemsList.push({
                    problemName: problemParam.problemName,
                    problem: problem,
                    episodes: problemParam.episodes,
                    startStateID: problemParam.startNode,
                    finishStateID: problemParam.finishNode,
                    behaviours: new Array(),
                    countExecutionsPerProblem: 1
                });
            }
            return hyperparametherTuning;
        }
        executeTests(callback, countExecutionsPerProblem) {
            //permutation
            let permutationBehaviour = this.createPermutations(this.parameterOptions);
            //for each problem
            for (let inputData of this.problemsList) {
                // executeTests for problem
                inputData.behaviours = permutationBehaviour;
                inputData.countExecutionsPerProblem = countExecutionsPerProblem;
                this.executeTestsForProblem(inputData, callback);
            }
        }
        executeTestsForProblem(inputData, callback) {
            let count = 0;
            for (let behavior of inputData.behaviours) {
                let result = { mapName: inputData.problemName, episodes: 0, optimalPathLength: 0 };
                for (let executionNumber = 0; executionNumber < inputData.countExecutionsPerProblem; executionNumber++) {
                    let testResult = this.executeTest(inputData.problem, behavior, inputData.startStateID, inputData.finishStateID, inputData.episodes);
                    result.episodes = result.episodes + testResult.episodes;
                    result.optimalPathLength = result.optimalPathLength + testResult.optimalPathLength;
                }
                result.episodes = result.episodes / inputData.countExecutionsPerProblem;
                result.optimalPathLength = result.optimalPathLength / inputData.countExecutionsPerProblem;
                count = count + 1;
                callback(result, behavior);
                console.log(" % executed:  " + Math.round(count / inputData.behaviours.length * 100));
            }
        }
        executeTest(problem, behaviour, startStateID, finishStateID, episodes) {
            let qLearner = new qLearner_1.QLearningAlgorithm(problem, behaviour.alpha, behaviour.gamma, behaviour.rho, behaviour.nu);
            // let qLearningSteps: Array<{qLearnerStepData: QLearningStep, optimalPath: Array<number>}> = new Array<{qLearnerStepData: QLearningStep, optimalPath: Array<number>}>();
            let testResult = { mapName: "", episodes: 10012020, optimalPathLength: 10012020 };
            for (let i = 0; i < episodes; i++) {
                qLearner.qLearnerStep();
                let optimalPathResult = qLearner.findOptimalPath(startStateID, finishStateID);
                if (optimalPathResult.resultState != models_1.ResultState.ERROR) {
                    let pathLength = optimalPathResult.optimalPath.length;
                    if (pathLength < testResult.optimalPathLength) {
                        testResult.optimalPathLength = pathLength;
                        testResult.episodes = i;
                    }
                }
                // testResult.push({
                //     qLearnerStepData: qLearner.qLearnerStep(),
                //     optimalPath: qLearner.findOptimalPath(startStateID, finishStateID).optimalPath});
            }
            return testResult;
        }
        static async createProblem(problemParams) {
            let visualizer = await visualizer_1.Visualizer.createVisualizer(problemParams.pathToSvg, problemParams.htmlSelector, problemParams.size);
            //convert data: obstacle list Array<Action>, start node, finishnode to actionInterface / array
            let notAllowedActions = utils_1.Utils.convertObstacleListToActionList(problemParams.obstaclesList);
            let startFinishStates = utils_1.Utils.convertStartFinishNodeToAction(problemParams.startNode, problemParams.finishNode);
            let allActions = visualizer.getActions();
            //visualiser gets obstacle list and draws rocks on the way
            visualizer.processNotAllowedActions(notAllowedActions);
            //filter out all actions from obstacle lists -> work with the same list
            allActions = utils_1.Utils.filterOutNotAllowedActions(allActions, notAllowedActions);
            //generate rewards & problem
            let statesAndActions = qLearner_1.RlUtils.generateRewardsAndProblem(allActions, startFinishStates);
            return new qLearner_1.ReinforcementProblem(statesAndActions);
        }
        createPermutations(options) {
            let qLearnerBehaviours = new Array();
            for (let alpha of options.alpha) {
                for (let gamma of options.gamma) {
                    for (let rho of options.rho) {
                        for (let nu of options.nu) {
                            qLearnerBehaviours.push({ alpha: alpha, gamma: gamma, rho: rho, nu: nu });
                        }
                    }
                }
            }
            return qLearnerBehaviours;
        }
    }
    exports.HyperparameterTuning = HyperparameterTuning;
});
//# sourceMappingURL=hyperparameterTuning.js.map