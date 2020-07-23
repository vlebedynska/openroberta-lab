define(["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Draggable {
        constructor(area) {
            this.area = area;
            this.draggingElement = null;
        }
        static create(area) {
            let draggable = new Draggable(area);
            draggable.draggableEventHandling();
            return draggable;
        }
        draggableEventHandling() {
            let that = this;
            this.area.mousemove(function (e) {
                e.stopPropagation();
                if (that.draggingElement != null) {
                    that.draggingElement.dispatch('dragmove', e);
                    console.log("dragmove");
                }
            });
            $(document).mouseup(function (e) {
                if (that.draggingElement != null) {
                    that.draggingElement.fire('dragend');
                    console.log("dragend");
                    that.draggingElement = null;
                }
            });
        }
        registerDraggableElement(element) {
            let that = this;
            element.mousedown(function () {
                that.draggingElement = this;
                that.draggingElement.fire('dragstart');
                console.log("dragstart");
            });
        }
    }
    exports.Draggable = Draggable;
});
