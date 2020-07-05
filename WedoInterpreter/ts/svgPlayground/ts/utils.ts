import {Obstacle} from "./aiReinforcementLearningModule";
import {Action, ProblemSource, ProblemState} from "./models";

export class Utils {
    public static file_get_contents(uri): Promise<string> {
        return fetch(uri).then(res => res.text())
    }

    public static convertObstacleListToActionList(obstacleList: Array<Obstacle>): Array<Action> {
        let actionsList: Array<Action> = new Array<Action>();
        for (let obstacle of obstacleList) {
            actionsList.push(
                Utils.convertStartFinishNodeToAction(obstacle.startNode, obstacle.finishNode)
            );
        }
        return actionsList;
    }


    public static convertStartFinishNodeToAction(startNode: number, finishNode: number): Action {
        return {
            startState: {id: startNode},
            finishState: {id: finishNode}
        };
    }

    public static filterOutNotAllowedActions(allActions: Array<Action>, notAllowedActions: Array<Action>): Array<Action> {
        return allActions.filter(f => !notAllowedActions.includes(f));
    }
}
