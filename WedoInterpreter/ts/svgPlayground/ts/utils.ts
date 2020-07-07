import {Obstacle} from "./aiReinforcementLearningModule";
import {Action, ProblemSource, ProblemState} from "./models";
import {Line, Path, Polyline, Shape} from "svgdotjs";

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

    public static calcShapeLength(shape: Shape): number {
        switch (shape.constructor) {
            case Line:
                return Utils.dist(shape.attr("x1"), shape.attr("x2"), shape.attr("y1"), shape.attr("y2"));
            case Path:
                return (<Path>shape).length();
            case Polyline:
                default: 0;
        }
    }

    private static dist(x1, x2, y1, y2){
        return Math.sqrt( (x2-=x1)*x2 + (y2-=y1)*y2 );
    }
}
