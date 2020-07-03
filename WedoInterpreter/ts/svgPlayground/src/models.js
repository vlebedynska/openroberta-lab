define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Rho;
    (function (Rho) {
        Rho[Rho["EXPLOIT"] = 0] = "EXPLOIT";
        Rho[Rho["EXPLORE"] = 1] = "EXPLORE";
    })(Rho = exports.Rho || (exports.Rho = {}));
    var Nu;
    (function (Nu) {
        Nu[Nu["STAY_ON_PATH"] = 0] = "STAY_ON_PATH";
        Nu[Nu["RANDOM_STATE"] = 1] = "RANDOM_STATE";
    })(Nu = exports.Nu || (exports.Nu = {}));
    var RunningState;
    (function (RunningState) {
        RunningState[RunningState["PAUSE"] = 0] = "PAUSE";
        RunningState[RunningState["STOP"] = 1] = "STOP";
        RunningState[RunningState["PLAY"] = 2] = "PLAY";
    })(RunningState = exports.RunningState || (exports.RunningState = {}));
});
//# sourceMappingURL=models.js.map