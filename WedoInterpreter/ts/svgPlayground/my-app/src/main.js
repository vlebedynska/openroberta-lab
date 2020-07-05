
require.config({
    baseUrl: './src',
    paths: {
        'qLearnerView': '../src/TestTypescriptFile',
        'react': 'react_libs/react.development',
        'react-dom': 'react_libs/react-dom.development',
        'SvgLoader': 'react-svgmt/src/svg-loader',
        'SvgProxy': 'react-svgmt/src/svg-proxy',
        'babel': 'https://cdnjs.cloudflare.com/ajax/libs/babel-core/6.1.19/browser.min',
    },
    jsx: {
        fileExtension: '.jsx'
    },
    shim : {
        'qLearnerView': {
            deps: [
                'react',
                'react-dom',
                'react-svgmt'
            ]
        }
    }
});

// load the modules defined above
requirejs(['react', 'react-dom', 'qLearnerView', 'react-svgmt', 'SvgProxy', 'SvgLoader'], function(React, ReactDOM, qLearnerView, reactSVGMT, SvgProxy, SvgLoader) {
    //xy = require(qLearnerView)
    // now you can render your React elements
    ReactDOM.render(
        React.createElement('p', {}, 'Hello, AMD!'),
        document.getElementById('root')
    );

    let componentSvg = new qLearnerView.QLearningView({ich: "bins"});
    ReactDOM.render(
        componentSvg,
        document.getElementById('root')
    );

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

            render()
            {
                return (
                    <div>
                        <SvgLoader path="PopUPDesign_Minimal.svg">
                            <SvgProxy selector={'#navi-pause'} fill="#7ccaff" onclick={function () {
                                console.log("click!")
                            }}>
                            </SvgProxy>
                        </SvgLoader>
                    </div>
                )
            }

        }
    }
    ReactDOM.render( <Timer startState="5" finishState="8"/>,
        document.getElementById('root'));



});

