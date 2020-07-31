import {QLearningAlgorithm, ReinforcementProblem, RlUtils} from "qLearner";
import {Action, Obstacle, QlearningAlgorithmParameters, QLearningStep} from "models";
import {Size, Visualizer} from "visualizer.ts.ts";
import {Utils} from "utils.ts.ts";

class HyperparametherTuning {

    private parameterOptions: qLearnerParameterOptions;
    private problemsList: Array<ReinforcementProblem>;

    constructor(parameterOptions: qLearnerParameterOptions, problemParamList: Array<ProblemParams>) {
        this.parameterOptions = parameterOptions;
        this.problemsList = new Array<ReinforcementProblem>();
        for (let item of problemParamList) {
            this.createProblem(item).then(problem => this.problemsList.push(problem));
        }
    }


    public executeTests() {
        //permutation
        let permutationBehaviour: Array<qLearnerBehaviour> = this.createPermutations(this.parameterOptions);

        //for each problem
        for (let problem of this.problemsList) {
            // executeTests for problem
            this.executeTestsForProblem(problem, permutationBehaviour);
        }

        // write results to file
    }

    private executeTestsForProblem(problem: ReinforcementProblem, permutationBehaviour: Array<qLearnerBehaviour>) {

    }

    public executeTest(problem: ReinforcementProblem, behaviour: qLearnerBehaviour, expechtedPath: Array<number>) {
        let qLearner = new QLearningAlgorithm(problem,behaviour.alpha, behaviour.gamma, behaviour.rho, behaviour.nu);
        let qLearningSteps: Array<{qLearnerStepData: QLearningStep, optimalPath: Array<number>}> = new Array<{qLearnerStepData: QLearningStep, optimalPath: Array<number>}>();
        for (let i=0; i < this.episodes; i++) {
            qLearningSteps.push({
                qLearnerStepData: this.qLearner.qLearnerStep(),
                optimalPath: this.qLearner.findOptimalPath(this.startFinishStates.startState.id, this.startFinishStates.finishState.id).optimalPath});
        }
    }



    async createProblem(problemParams: ProblemParams): Promise<ReinforcementProblem> {
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


interface qLearnerParameterOptions {
    alpha: Array<number>;
    gamma: Array<number>;
    rho: Array<number>;
    nu: Array<number>;

}

interface qLearnerBehaviour{
    alpha: number;
    gamma: number;
    rho: number;
    nu: number;
}

interface ProblemParams {
    svg: string;
    obstaclesList: Array<Obstacle>;
    startNode: number;
    finishNode: number;
    pathToSvg: string;
    htmlSelector: string;
    size: Size;
}


