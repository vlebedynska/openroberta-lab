import * as SVG from "svgdotjs";


export class SVGUtils {


    public static createPath(svg, node1PositionX, node1PositionY, node2PositionX, node2PositionY): SVG.Path {
        return svg.path([
            ['M', node1PositionX, node1PositionY],
            ['L', node2PositionX, node2PositionY]
        ])
    }


    public static closestPoint(pathNode, point): {x, y, distance, lengthOnPath} {
        var pathLength = pathNode.getTotalLength(),
            precision = 8,
            best,
            bestLength,
            bestDistance = Infinity;

        // linear scan for coarse approximation
        for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
            if ((scanDistance = SVGUtils.distance2(point,scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
                best = scan, bestLength = scanLength, bestDistance = scanDistance;
            }
        }
        // binary search for precise estimate
        precision /= 2;
        while (precision > 0.5) {
            var before,
                after,
                beforeLength,
                afterLength,
                beforeDistance,
                afterDistance;
            if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = SVGUtils.distance2(point, before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
                best = before, bestLength = beforeLength, bestDistance = beforeDistance;
            } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = SVGUtils.distance2(point, after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
                best = after, bestLength = afterLength, bestDistance = afterDistance;
            } else {
                precision /= 2;
            }
        }
        return {x: best.x, y: best.y, distance: Math.sqrt(bestDistance), lengthOnPath: bestLength};

    }

    public static distance2(point, p) {
        var dx = p.x - point.x,
            dy = p.y - point.y;
        return dx * dx + dy * dy;
    }


    public static getPositionOnPath(path: SVG.Path, point, accuracy, fullWeight): number {
        let totalLength = path.node.getTotalLength();
        let step = totalLength / accuracy;
        let t = 0;
        let currentDistance;
        let minDistanceData = {"t": t, "distance": Number.MAX_VALUE};


        /**
         * <--        totalLength         -->
         * <step> <step> <step> <step> <step>
         * ------|------|------|---*--|------
         *       t-->         cirlceCenter
         *       <--  distance  -->
         *
         */
        for (t = 0; t <= totalLength; t += step) {
            t = SVGUtils.round(t, 4);
            currentDistance = SVGUtils.calcDistance(path.node.getPointAtLength(t), point)
            if (currentDistance < minDistanceData.distance) {
                minDistanceData = {"t": t, "distance": currentDistance}; //p2 - distance from point at length to circle center
            }
        }
        let sliderValue = minDistanceData.t / step * fullWeight / accuracy;
        return sliderValue;
    }


    private static round(num, places) {
        var multiplier = Math.pow(10, places);
        return (Math.round(num * multiplier) / multiplier);
    }

    private static calcDistance(p1, p2) {
        return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
    }
}