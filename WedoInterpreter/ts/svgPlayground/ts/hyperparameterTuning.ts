import {QLearningAlgorithm, ReinforcementProblem, RlUtils} from "qLearner";
import {Action, Nu, Obstacle, QlearningAlgorithmParameters, QLearningStep, ResultState} from "models";
import {Size, Visualizer} from "visualizer";
import {Utils} from "utils";

export class HyperparameterTuning {

    private parameterOptions: qLearnerParameterOptions;
    private problemsList: Array<TestInputData>;

    constructor(parameterOptions: qLearnerParameterOptions) {
        this.parameterOptions = parameterOptions;
        this.problemsList = new Array<TestInputData>();
    }

    public static async create(parameterOptions: qLearnerParameterOptions, problemParamList: Array<ProblemParams>): Promise<HyperparameterTuning> {
        let hyperparametherTuning: HyperparameterTuning = new HyperparameterTuning(parameterOptions);
        for (let problemParam of problemParamList) {
            let problem = await HyperparameterTuning.createProblem(problemParam);
            hyperparametherTuning.problemsList.push(
                {
                    problemName: problemParam.problemName,
                    problem: problem,
                    episodes: problemParam.episodes,
                    startStateID: problemParam.startNode,
                    finishStateID: problemParam.finishNode,
                    behaviours: new Array<qLearnerBehaviour>(),
                    countExecutionsPerProblem: 1
                });
        }
        return hyperparametherTuning;
    }


    public executeTests(callback: Function, countExecutionsPerProblem: number) {
        //permutation
        let permutationBehaviour: Array<qLearnerBehaviour> = this.createPermutations(this.parameterOptions);

        //for each problem
        for (let inputData of this.problemsList) {
            // executeTests for problem
            inputData.behaviours = permutationBehaviour;
            inputData.countExecutionsPerProblem = countExecutionsPerProblem;
            this.executeTestsForProblem(inputData, callback);
        }
    }



    private executeTestsForProblem(inputData: TestInputData, callback: Function) {
        let count = 0;
        for (let behavior of inputData.behaviours) {
            let result: TestResult = {mapName: inputData.problemName, episodes: 0, optimalPathLength: 0};
            for (let executionNumber = 0; executionNumber < inputData.countExecutionsPerProblem; executionNumber++) {
                let testResult = this.executeTest(inputData.problem, behavior, inputData.startStateID, inputData.finishStateID, inputData.episodes)
                result.episodes = result.episodes + testResult.episodes;
                result.optimalPathLength = result.optimalPathLength + testResult.optimalPathLength;
            }
        result.episodes = result.episodes/inputData.countExecutionsPerProblem;
        result.optimalPathLength = result.optimalPathLength/inputData.countExecutionsPerProblem;
        count = count+1;
        callback(result, behavior);
        console.log(" % executed:  " + Math.round(count/inputData.behaviours.length*100));
        }

    }

    public executeTest(problem: ReinforcementProblem, behaviour: qLearnerBehaviour, startStateID: number, finishStateID: number, episodes: number): TestResult {
        let qLearner = new QLearningAlgorithm(problem,behaviour.alpha, behaviour.gamma, behaviour.rho, behaviour.nu);
        // let qLearningSteps: Array<{qLearnerStepData: QLearningStep, optimalPath: Array<number>}> = new Array<{qLearnerStepData: QLearningStep, optimalPath: Array<number>}>();
        let testResult: TestResult = {mapName: "", episodes: 10_01_2020, optimalPathLength: 10_01_2020};
        for (let i=0; i < episodes; i++) {

            qLearner.qLearnerStep()
            let optimalPathResult = qLearner.findOptimalPath(startStateID, finishStateID);
            if (optimalPathResult.resultState != ResultState.ERROR) {
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



    static async createProblem(problemParams: ProblemParams): Promise<ReinforcementProblem> {
        let visualizer = await Visualizer.createVisualizer(problemParams.pathToSvg, problemParams.htmlSelector, problemParams.size);

        //convert data: obstacle list Array<Action>, start node, finishnode to actionInterface / array
        let notAllowedActions: Array<Action> = Utils.convertObstacleListToActionList(problemParams.obstaclesList);
        let startFinishStates = Utils.convertStartFinishNodeToAction(problemParams.startNode, problemParams.finishNode);

        let allActions: Array<Action> = visualizer.getActions();

        //visualiser gets obstacle list and draws rocks on the way
        visualizer.processNotAllowedActions(notAllowedActions);


        //filter out all actions from obstacle lists -> work with the same list
        allActions = Utils.filterOutNotAllowedActions(allActions, notAllowedActions);


        //generate rewards & problem
        let statesAndActions: Array<Array<number>> = RlUtils.generateRewardsAndProblem(allActions, startFinishStates);
        return new ReinforcementProblem(statesAndActions);
    }


    private createPermutations(options: qLearnerParameterOptions): Array<qLearnerBehaviour> {
        let qLearnerBehaviours: Array<qLearnerBehaviour> = new Array<qLearnerBehaviour>();
        for (let alpha of options.alpha) {
            for (let gamma of options.gamma) {
                for (let rho of options.rho) {
                    for (let nu of options.nu) {
                        qLearnerBehaviours.push({alpha: alpha,gamma: gamma, rho: rho, nu: nu});
                    }
                }
            }
        }
        return qLearnerBehaviours;
    }

}

export interface  qLearnerParameterOptions {
    alpha: Array<number>;
    gamma: Array<number>;
    rho: Array<number>;
    nu: Array<number>;

}

export interface qLearnerBehaviour{
    alpha: number;
    gamma: number;
    rho: number;
    nu: number;
}

export interface ProblemParams {
    problemName: string;
    obstaclesList: Array<Obstacle>;
    startNode: number;
    finishNode: number;
    pathToSvg: string;
    htmlSelector: string;
    size: Size;
    episodes: number;
}

export interface TestInputData {
    problemName: string;
    problem: ReinforcementProblem;
    episodes: number;
    startStateID: number;
    finishStateID: number;
    behaviours: Array<qLearnerBehaviour>;
    countExecutionsPerProblem: number;
}

export interface TestResult {
    mapName: string;
    episodes: number;
    optimalPathLength: number;
}