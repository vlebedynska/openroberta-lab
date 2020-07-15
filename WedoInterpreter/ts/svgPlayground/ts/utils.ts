import {Action, Obstacle, ProblemSource, ProblemState} from "models";
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

    public static convertNumberToSeconds(totalTime: number): string {
        let hours = Math.floor(totalTime/60/60);
        let minutes = Math.floor(totalTime/60)%60;
        let seconds = totalTime%60
        let separator: string = " : "
        return Utils.normalizeTimeOutput(hours) + separator
            + Utils.normalizeTimeOutput(minutes) + separator
            + Utils.normalizeTimeOutput(seconds);
    }

    private static normalizeTimeOutput(timeValue: number): string {
        if (timeValue < 0) {
            return "" + timeValue;
        }
        return (timeValue < 10 ? "0" : "") + timeValue;
    }

    public static filterOutNotAllowedActions(allActions: Array<Action>, notAllowedActions: Array<Action>): Array<Action> {
        let filtered: Array<Action> = allActions.filter((el) => {
            return !notAllowedActions.some((f) => {
                return f.startState.id === el.startState.id && f.finishState.id === el.finishState.id;
            });
        });
        return filtered;
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
