import {Element, Path, Svg, Text} from "svgdotjs";

class Svglookup {

    private readonly selectors: Map<string, string>;
    private readonly svglookuptable: Map<string, Element>;
    private readonly svg: Svg;

    constructor(selectors: Map<string, string>, svg: Svg) {
        this.selectors = selectors;
        this.svg = svg;
        this.svglookuptable = new Map<string, Element>();
    }

    public getTextElement(key: string): Text {
        if (!this.svglookuptable.has(key)) {
            let selector: string = this.selectors.get(key);
            let element: Element = <Element>this.svg.findOne(selector);
            this.svglookuptable.set(key, element)
        }
        return <Text>this.svglookuptable.get(key);
    }

    public getPathElement(key: string): Path{
        return
    }

    public getElement(key: string): Element{
        return
    }
}