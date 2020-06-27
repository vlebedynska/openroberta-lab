import React from "react";
import ReactDOM from "react-dom";
import { SvgLoader, SvgProxy } from "react-svgmt";
import * as SVG from "@svgdotjs/svg.js";

import "./styles.css";

// function App() {
//     const selectors = ["rect:nth-child(1)", "rect:nth-child(4)"];
//     return (
//         <div className="App">
//             <SvgLoader width="100" height="100" path="/TestTime-01.svg">
//                 <SvgProxy selector=".cls-2" />
//
//             </SvgLoader>
//         </div>
//     );
// }
// var SVG = require("@svgdotjs/svg.js");



class Timer extends React.Component {

    constructor(props) {
        super(props);
        this.state = { seconds: 0 };

    }

    tick() {
        this.setState(state => ({
            seconds: state.seconds + 1
        }));
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <div>
                <h2>Seconds: {this.state.seconds}</h2>
                <SvgLoader path="/PopUPDesign_Minimal.svg">
                    <SvgProxy selector='#time text:nth-child(1)' stroke={"red"} >
                        {""+this.state.seconds}
                    </SvgProxy>
                </SvgLoader>
            </div>

        // <svg data-name="Layer 1" viewBox="0 0 289 229" {...this.props}>
        //     <path
        //         fill="#8dc63f"
        //         stroke="#fff"
        //         strokeMiterlimit={10}
        //         d="M.5.5h288v228H.5z"
        //     />
        //     <text
        //         transform="translate(69.5 108.1)"
        //         fontSize={60}
        //         fill="#231f20"
        //         fontFamily="MyriadPro-Regular,Myriad Pro"
        //     >
        //         {this.state.seconds}
        //     </text>
        // </svg>
        );
    }
}






ReactDOM.render(
    <Timer />,
    document.getElementById('root')

);
//
//
//
//
//
// const rootElement = document.getElementById("root");
// ReactDOM.render(<Timer />, rootElement);



