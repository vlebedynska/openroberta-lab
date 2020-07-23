define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LinkImpl extends EventTarget {
        constructor(node1, node2, weight) {
            super();
            this._node1 = node1;
            this._node2 = node2;
            this._weight = weight;
        }
        get weight() {
            return this._weight;
        }
        set weight(value) {
            this._weight = value;
            let event = new CustomEvent('weightChanged', { detail: value });
            this.dispatchEvent(event);
        }
        get node1() {
            return this._node1;
        }
        get node2() {
            return this._node2;
        }
    }
    exports.LinkImpl = LinkImpl;
});
