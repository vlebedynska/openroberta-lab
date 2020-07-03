import React from "react";
import ReactDOM from "react-dom";
import { SvgLoader, SvgProxy } from "react-svgmt";

import "./styles.css";
import SvgComponent from "./test";

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
        this.state = {
            seconds: 120,
            action: {
                startState: Math.floor(0),
                finishState: Math.floor(1)
            }
        };


    }

    tick() {
        let randomActionIndex = Math.floor(Math.random()*this.getActions().length);
        let action = this.getActions()[randomActionIndex];
        this.setState(state => ({
            seconds: state.seconds - 1,
            action: {
                startState: action[0],
                finishState: action[1]
            }
        }));
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 2000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getActions() {
        let listOfPaths = [
            [0,1], [1,0],
            [1,2], [2,1],
            [1,3], [3,1],
            [2,3], [3,2],
            [2,7], [7,2],
            [2,5], [5,2],
            [3,4], [4,3],
            [4,6], [6,4],
            [7,5], [5,7],
            [5,6], [6,5],
            [5,8], [8,8],
            [6,8], [8,6],
        ];
        return listOfPaths;
    }



    render() {
        return (
            <div>
                <h2>Seconds: {this.state.seconds}</h2>
                <SvgLoader path="/PopUPDesign_Minimal.svg">
                    <SvgProxy selector={'g[id^="path-"] line'} stroke="url(#Ripple_Viktoriya-0)" >
                    </SvgProxy>
                    <SvgProxy selector={'g[id^="path-"] path'} stroke="url(#Ripple_Viktoriya-0)" >
                    </SvgProxy>

                    <SvgProxy selector='#time text:nth-child(1)' stroke={"red"} >
                        {""+this.state.seconds}
                    </SvgProxy>
                    <SvgProxy selector='#node-start text' >
                        {""+this.props.startState}
                    </SvgProxy>
                    <SvgProxy selector='#node-finish text' >
                        {""+this.props.finishState}
                    </SvgProxy>
                    <SvgProxy selector={'#path-'+this.state.action.startState+'-'+this.state.action.finishState+' line'} stroke="red" >
                    </SvgProxy>
                    <SvgProxy selector={'#path-'+this.state.action.startState+'-'+this.state.action.finishState+' path'} stroke="red" >
                    </SvgProxy>
                    <SvgProxy selector={'#node-'+this.state.action.startState+' path'} fill="#7ccaff">
                    </SvgProxy>
                    <SvgProxy selector={'#node-'+this.state.action.finishState+' path'} fill="#7ccaff">
                    </SvgProxy>

                    <SvgProxy selector={'#navi-pause'} fill="#7ccaff" onclick={function(){console.log("click!")}}>
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
    <Timer startState="5" finishState="8" />,
    document.getElementById('root')

);
//
//
//
//
//
// const rootElement = document.getElementById("root");
// ReactDOM.render(<Timer />, rootElement);



