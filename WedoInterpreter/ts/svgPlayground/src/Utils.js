define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.file_get_contents = function (uri) {
            return fetch(uri).then(function (res) { return res.text(); });
        };
        return Utils;
    }());
    exports.Utils = Utils;
});
