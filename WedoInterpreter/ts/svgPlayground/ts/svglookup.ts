import {Element, Path, Svg, Text} from "svgdotjs";

export class Svglookup {

    private readonly svglookuptable: Map<string, Element>;
    private readonly svg: Svg;

    constructor(svg: Svg) {
        this.svg = svg;
        this.svglookuptable = new Map<string, Element>();
    }

    public getElement(key: string): Element{
        this.checkAndUpdateLookupTable(key);
        return this.svglookuptable.get(key);
    }


    public getTextElement(key: string): Text {
        return <Text>this.getElement(key);
    }

    public getPathElement(key: string): Path{
        return <Path>this.getElement(key);
    }
    

    private checkAndUpdateLookupTable(key: string) {
        if (!this.svglookuptable.has(key)) {
            let element: Element = <Element>this.svg.findOne(key);
            this.svglookuptable.set(key, element)
        }
    }


}