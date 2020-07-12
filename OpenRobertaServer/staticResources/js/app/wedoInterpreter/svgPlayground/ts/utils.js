define(["require", "exports", "svgdotjs"], function (require, exports, svgdotjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Utils {
        static file_get_contents(uri) {
            return fetch(uri).then(res => res.text());
        }
        static convertObstacleListToActionList(obstacleList) {
            let actionsList = new Array();
            for (let obstacle of obstacleList) {
                actionsList.push(Utils.convertStartFinishNodeToAction(obstacle.startNode, obstacle.finishNode));
            }
            return actionsList;
        }
        static convertStartFinishNodeToAction(startNode, finishNode) {
            return {
                startState: { id: startNode },
                finishState: { id: finishNode }
            };
        }
        static convertNumberToSeconds(totalTime) {
            let hours = Math.floor(totalTime / 60 / 60);
            let minutes = Math.floor(totalTime / 60) % 60;
            let seconds = totalTime % 60;
            let separator = " : ";
            return Utils.normalizeTimeOutput(hours) + separator
                + Utils.normalizeTimeOutput(minutes) + separator
                + Utils.normalizeTimeOutput(seconds);
        }
        static normalizeTimeOutput(timeValue) {
            if (timeValue < 0) {
                return "" + timeValue;
            }
            return (timeValue < 10 ? "0" : "") + timeValue;
        }
        static filterOutNotAllowedActions(allActions, notAllowedActions) {
            let filtered = allActions.filter((el) => {
                return !notAllowedActions.some((f) => {
                    return f.startState.id === el.startState.id && f.finishState.id === el.finishState.id;
                });
            });
            return filtered;
        }
        static calcShapeLength(shape) {
            switch (shape.constructor) {
                case svgdotjs_1.Line:
                    return Utils.dist(shape.attr("x1"), shape.attr("x2"), shape.attr("y1"), shape.attr("y2"));
                case svgdotjs_1.Path:
                    return shape.length();
                case svgdotjs_1.Polyline:
                default: 0;
            }
        }
        static dist(x1, x2, y1, y2) {
            return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
        }
    }
    exports.Utils = Utils;
});
