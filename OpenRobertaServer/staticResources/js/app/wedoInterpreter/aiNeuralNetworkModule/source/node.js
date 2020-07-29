define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NodeImpl extends EventTarget {
        constructor(value, threshold, port, type, color = "default", duration = 0, frequency = 0) {
            super();
            this._value = value;
            this._threshold = threshold;
            this._port = port;
            this._type = type;
            this._color = color;
            this._duration = duration;
            this._frequency = frequency;
        }
        set positionX(value) {
            this._positionX = value;
        }
        set positionY(value) {
            this._positionY = value;
        }
        set value(value) {
            if (value !== this._value) {
                this._value = value;
                this.dispatchEvent(new CustomEvent("valueChanged", { detail: value }));
            }
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
        get color() {
            return this._color;
        }
        set color(value) {
            this._color = value;
        }
        get duration() {
            return this._duration;
        }
        get frequency() {
            return this._frequency;
        }
    }
    exports.NodeImpl = NodeImpl;
});
