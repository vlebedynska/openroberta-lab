define(["require", "exports", "svgdotjs", "./Utils"], function (require, exports, svgdotjs_1, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //.size(3148 / 5, 1764 / 5).
    class Visualizer {
        constructor(svg) {
            this.svg = svg;
        }
        //
        static createVisualizer(path, htmlSelector, size) {
            let visualizerPromise = Visualizer.preload(path, htmlSelector)
                .then(function (svg) {
                Visualizer.scaleSVGtoSize(svg, size);
                return new Visualizer(svg);
            });
            return visualizerPromise;
        }
        static preload(path, htmlSelector) {
            let svgPromise = Visualizer.loadSVG(path)
                .then(function (text) {
                return Visualizer.addSVGToHTML(text, htmlSelector);
            });
            return svgPromise;
        }
        static loadSVG(filePath) {
            return Utils_1.Utils.file_get_contents(filePath);
        }
        static addSVGToHTML(text, htmlSelector) {
            document.querySelector(htmlSelector).innerHTML = "";
            let svg = svgdotjs_1.SVG().addTo(htmlSelector);
            svg.svg(text);
            svg.viewbox(svg.attr("viewBox"));
            return svg;
        }
        getActions() {
            let listOfPaths = new Array();
            let allPaths = this.svg.find('g[id^="path-"]');
            allPaths.each(function (item) {
                let idName = item.attr("id");
                let tokens = idName.split("-");
                listOfPaths.push({
                    startState: {
                        id: parseInt(tokens[1])
                    },
                    finishState: {
                        id: parseInt(tokens[2])
                    }
                });
            });
            return listOfPaths;
        }
        static scaleSVGtoSize(svg, size) {
            let svgWidthHeight = {
                width: svg.viewbox().width,
                height: svg.viewbox().height
            };
            let newSize = Visualizer.fitInNewSize(svgWidthHeight, size);
            svg.size(newSize.width, newSize.height);
        }
        static fitInNewSize(originSize, newSize) {
            let factorWidth = newSize.width / originSize.width;
            let factorHeight = newSize.height / originSize.height;
            let factor = Math.min(factorWidth, factorHeight);
            return {
                width: originSize.width * factor,
                height: originSize.height * factor
            };
        }
        setPlayer(player) {
        }
        processNotAllowedActions(notAllowedActions) {
            for (let notAllowedAction of notAllowedActions) {
                let notAllowedPath = this.svg.findOne('g[id^="path-"]' + notAllowedAction.startState.id + "-" + notAllowedAction.finishState.id + " path|line|polyline");
                notAllowedPath.attr({
                    stroke: 'red',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': 7,
                    'stroke-dasharray': '12 24'
                });
                this.setMarker(notAllowedPath);
                //document.querySelector(notAllowedPath).innerHTML = ""
            }
        }
        setMarker(notAllowedPath) {
            try {
                notAllowedPath.marker('start', 10, 10, function (add) {
                    add.circle(20).fill('#ff0000');
                });
                notAllowedPath.marker('end', 10, 10, function (add) {
                    add.circle(20).fill('#ff0000');
                });
            }
            catch (error) {
                if (error instanceof TypeError) {
                    console.log("Unsupported type for the marker: " + error.message + ". Expected type: line, polyline or path. ");
                }
            }
        }
    }
    exports.Visualizer = Visualizer;
});
//# sourceMappingURL=Visualizer.js.map