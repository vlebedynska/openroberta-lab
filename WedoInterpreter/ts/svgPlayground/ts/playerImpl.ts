import {Player, ProblemState} from "./models";

export class PlayerImpl implements Player{
    currentEpisodeNumber: number;
    currentTime: number;
    finishState: ProblemState;
    optimalPath: Array<ProblemState>;
    startState: ProblemState;
    totalNumberOfEpisodes: number;
    totalTime: number;

}