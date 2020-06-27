import {Svg} from "@svgdotjs/svg.js";

export class Visualizer {
    private readonly svg: Svg;

    private constructor() {

    }

    public async createVisualizer(path: string): Promise<Visualizer>{
        let promise = new Promise<>
        loadSVG(path)
        return ;
    }

    private static loadSVG(path: string) {

    }
}