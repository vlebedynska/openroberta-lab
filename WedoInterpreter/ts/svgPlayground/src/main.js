
require.config({
    baseUrl: '../../svgPlayground',
    paths: {
        'aiReinforcementLearningModule': 'src/aiReinforcementLearningModule',
        'svgdotjs': './node_modules/svgdotjs/dist/svg.min',
        'index_2':'src/index_2',
        'Visualizer': 'src/Visualizer',
        'Utils':'src/Utils',
        'playerImpl':'src/playerImpl',
        'models':'src/models',
        'playerImpl':'src/playerImpl',
        'qLearner':'src/qLearner',
        'timerImpl':'src/timerImpl',
        'qLearnerView': 'src/qLearnerView',
        'react': 'https://unpkg.com/react@15.3.2/dist/react',
        'react-dom': 'https://unpkg.com/react-dom@15.3.2/dist/react-dom',
        'mapX' : 'src/map'
    },
    shim : {
        'svgdotjs': {
            exports: 'SVG'
        },
    }
});

// load the modules defined above
requirejs(['react', 'react-dom', 'mapX', 'qLearnerView'], function(React, ReactDOM, MAPX, qLearnerView) {
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
    )



});
