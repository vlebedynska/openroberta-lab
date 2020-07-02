export interface ProblemSource {
    getActions(): Array<Action>;
}

export interface Player {
    finishState: ProblemState;
    startState: ProblemState;
    optimalPath: Array<ProblemState>;
    currentEpisodeNumber: number;
    totalNumberOfEpisodes: number;
    currentTime: number;
    totalTime: number;
    qLearningSteps: Array<QLearningStep>;
    initialize(): void;
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
}

export enum Rho {
    EXPLOIT,
    EXPLORE
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

export enum RunningState {
    PAUSE,
    STOP,
    PLAY
}