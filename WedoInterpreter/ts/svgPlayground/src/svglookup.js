define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Svglookup {
        constructor(svg) {
            this.svg = svg;
            this.svglookuptable = new Map();
        }
        getElement(key) {
            this.checkAndUpdateLookupTable(key);
            return this.svglookuptable.get(key);
        }
        getTextElement(key) {
            return this.getElement(key);
        }
        getPathElement(key) {
            return this.getElement(key);
        }
        checkAndUpdateLookupTable(key) {
            if (!this.svglookuptable.has(key)) {
                let element = this.svg.findOne(key);
                this.svglookuptable.set(key, element);
            }
        }
    }
    exports.Svglookup = Svglookup;
});
//# sourceMappingURL=svglookup.js.map