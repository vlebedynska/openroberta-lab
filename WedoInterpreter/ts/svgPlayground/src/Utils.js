define(["require", "exports"], function (require, exports) {
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
        static filterOutNotAllowedActions(allActions, notAllowedActions) {
            return allActions.filter(f => !notAllowedActions.includes(f));
        }
    }
    exports.Utils = Utils;
});
//# sourceMappingURL=Utils.js.map