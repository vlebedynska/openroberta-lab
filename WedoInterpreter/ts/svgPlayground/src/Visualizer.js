define(["require", "exports", "./Utils", "@svgdotjs/svg.js"], function (require, exports, Utils_1, svg_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Visualizer = /** @class */ (function () {
        function Visualizer(svg, size) {
            this.svg = svg;
            this.size = size;
        }
        //
        Visualizer.createVisualizer = function (path, htmlSelector, size) {
            var visualizerPromise = Visualizer.preload(path, htmlSelector)
                .then(function (svg) {
                return new Visualizer(svg, size);
            });
            return visualizerPromise;
        };
        Visualizer.preload = function (path, htmlSelector) {
            var svgPromise = Visualizer.loadSVG(path)
                .then(function (text) {
                return Visualizer.addSVGToHTML(text, htmlSelector);
            });
            return svgPromise;
        };
        Visualizer.loadSVG = function (filePath) {
            return Utils_1.Utils.file_get_contents(filePath);
        };
        Visualizer.addSVGToHTML = function (text, htmlSelector) {
            document.querySelector(htmlSelector).innerHTML = "";
            var svg = svg_js_1.default.SVG().addTo(htmlSelector).size(3148 / 5, 1764 / 5).viewbox("0 0 3148 1764");
            svg.svg(text);
            svg.find('.cls-customPathColor').each(function (e) { return e.stroke({ color: '#fcfcfc', opacity: 0.9, width: 0 }); });
            return svg;
        };
        Visualizer.prototype.extractAllPathes = function (svg) {
            return;
        };
        return Visualizer;
    }());
    exports.Visualizer = Visualizer;
});
