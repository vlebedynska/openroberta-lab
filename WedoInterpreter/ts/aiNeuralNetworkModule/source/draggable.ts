import * as SVG from "svgdotjs";
import * as $ from "jquery";

export class Draggable {

    private draggingElement: SVG.Element = null;

    private constructor(public area: SVG.Element) {

    }

    public static create(area: SVG.Element): Draggable {
        let draggable = new Draggable(area);
        draggable.draggableEventHandling();
        return draggable;
    }

    public draggableEventHandling() {
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

    public registerDraggableElement(element: SVG.Element) {
        let that = this;
        element.mousedown(function () {
            that.draggingElement = this;
            that.draggingElement.fire('dragstart');
            console.log("dragstart");
        });


    }
}
