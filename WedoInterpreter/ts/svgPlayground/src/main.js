
require.config({
    baseUrl: '../../svgPlayground',
    paths: {
        'aiReinforcementLearningModule': 'src/aiReinforcementLearningModule',
        'svgdotjs': './node_modules/svgdotjs/dist/svg.min',
        'index_2':'src/index_2',
        'visualizer': 'src/visualizer',
        'utils':'src/utils',
        'playerImpl':'src/playerImpl',
        'models':'src/models',
        'qLearner':'src/qLearner',
        'timerImpl':'src/timerImpl',
    },
    shim : {
        'svgdotjs': {
            exports: 'SVG'
        },
    }
});

// load the modules defined above
requirejs(['index_2'], function(index_2) {
    index_2
});
