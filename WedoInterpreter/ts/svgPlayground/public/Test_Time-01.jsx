import * as React from "react"

function SvgComponent(props) {
    return (
        <svg data-name="Layer 1" viewBox="0 0 289 229" {...props}>
            <path
                fill="#8dc63f"
                stroke="#fff"
                strokeMiterlimit={10}
                d="M.5.5h288v228H.5z"
            />
            <text
                transform="translate(69.5 108.1)"
                fontSize={60}
                fill="#231f20"
                fontFamily="MyriadPro-Regular,Myriad Pro"
            >
                {"00 : 35"}
            </text>
        </svg>
    )
}

export default SvgComponent
