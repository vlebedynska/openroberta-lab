import React from "react";
import ReactDOM from "react-dom";
import { SvgLoader, SvgProxy } from "react-svgmt";


export class PlayerView extends React.Component{
    constructor(props) {
        super(props);

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