export interface ProblemSource {
    getSections(): Array<Action>;
}

export interface Player {
    finishState: ProblemState;
    startState: ProblemState;
    optimalPath: Array<ProblemState>;
    currentEpisodeNumber: number;
    totalNumberOfEpisodes: number;
    currentTime: number;
    totalTime: number;
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
    rho: Rho;
    nu: Nu;
    qValueOld: number;
    qValueNew: number;
    state: number;
    newState: number;
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
}

export enum RunningState {
    PAUSE,
    STOP,
    PLAY
}