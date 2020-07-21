import {Visualizer} from "visualizer";
import {TimerImpl} from "timerImpl";



export interface QlearningAlgorithmParameters {
    // svg: SVG.Svg;
    startNode: number;
    updateBackground: any;
    finishNode: number;
    // problem: ReinforcementProblem;
    alpha: number;
    gamma: number;
    nu: number;
    rho: number;
    episodes: number;
    totalTime: number;
    obstaclesList: Array<Obstacle>;
}




export interface ProblemSource {
    getActions(): Array<Action>;
}

export enum ResultState {
    SUCCESS = 1,
    ERROR= 2
}


export interface OptimalPathResult {
    optimalPath: Array<number>;
    resultState: ResultState;
}

export interface Obstacle {
    startNode: number;
    finishNode: number;
}





interface TakeActionResult {
    reward: number;
    newState: number;
}




export interface Player {
    finishState: ProblemState;
    startState: ProblemState;
    optimalPath: Array<ProblemState>;
    currentEpisodeNumber: number;
    totalNumberOfEpisodes: number;
    currentTime: number;
    totalTime: number;
    qLearningSteps: Array<{qLearnerStepData: QLearningStep, optimalPath: Array<number>}>;
    timer: TimerImpl;
    initialize(visualizer: Visualizer): void;
    pause(): void;
}

export interface StateStatus {
    visited: boolean;
    state: ProblemState;
}

export interface SectionState {
    section: Action;
    reward: number;
    qValue: number;
}

export interface QLearningStep {
    readonly rho: Rho;
    readonly nu: Nu;
    readonly qValueOld: number;
    readonly qValueNew: number;
    readonly state: number;
    readonly newState: number;
    readonly duration: number;
    readonly stepNumber: number;
    readonly highestQValue: number;
}

export enum Rho {
    EXPLOIT = "nutze das Wissen aus",
    EXPLORE = "erkunde"
}

export enum Nu {
    STAY_ON_PATH,
    RANDOM_STATE
}

export interface QLearnerConfiguration {
    gamma: number;
    alpha: number;
    rho: number;
    nu: number;
}

export interface QLearnerProblem {

}

export interface QValueStore{
    getValue(action: Action);
}


export interface Action {
    startState: ProblemState,
    finishState: ProblemState
}

export interface ProblemState {
    id: number;
}

export interface Clock {
    runningState: RunningState;
    speed: number;
    time: number;
}

export interface qValue {
    state: number,
    newState: number;
    stars: number
}

export enum RunningState {
    PAUSE,
    STOP,
    PLAY
}


export interface Pose {
    x: number,
    y: number,
    theta: number,
    transX: number,
    transY: number,
    oldX?: number,
    oldY?: number
}
