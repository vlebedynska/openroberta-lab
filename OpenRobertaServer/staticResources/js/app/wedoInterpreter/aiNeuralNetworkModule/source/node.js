define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NodeImpl extends EventTarget {
        constructor(value, threshold, port, type) {
            super();
            this._value = value;
            this._threshold = threshold;
            this._port = port;
            this._type = type;
        }
        set positionX(value) {
            this._positionX = value;
        }
        set positionY(value) {
            this._positionY = value;
        }
        set value(value) {
            this._value = value;
            this.dispatchEvent(new CustomEvent("valueChanged", { detail: value }));
        }
        get positionX() {
            return this._positionX;
        }
        get positionY() {
            return this._positionY;
        }
        get name() {
            return this._name;
        }
        set name(value) {
            this._name = value;
        }
        get port() {
            return this._port;
        }
        get type() {
            return this._type;
        }
        get value() {
            return this._value;
        }
        get threshold() {
            return this._threshold;
        }
        get data() {
            return this._data;
        }
    }
    exports.NodeImpl = NodeImpl;
});
