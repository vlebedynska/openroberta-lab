var requirejs = require('r.js');

requirejs.config({
    baseUrl: './node_modules',
    paths: {
        // 'qLearnerView': '../src/TestTypescriptFile',
        'react': 'react/cjs/react.development',
        'react-dom': 'react-dom/cjs/react-dom.development',
        // 'react': 'https://unpkg.com/react@16/umd/react.development',
        // 'react-dom': 'https://unpkg.com/react-dom@16/umd/react-dom.development',
        nodeRequire: require
    },

    // shim : {
        'react': {
            deps: ['react-dom']
        },
        // 'qLearnerView': {
        //     deps: [
        //         'react',
        //         'react-dom'
        //     ]
        // }
//     }
});

// load the modules defined above
requirejs(['react', 'react-dom'], function(React, ReactDOM) {
    //xy = require(qLearnerView)
    // now you can render your React elements
    ReactDOM.render(
        React.createElement('p', {}, 'Hello, AMD!'),
        document.getElementById('root')
    );

    // let componentSvg = new qLearnerView.QLearningView({ich: "bins"});
    // ReactDOM.render(
    //     componentSvg,
    //     document.getElementById('root')
    // )



});
