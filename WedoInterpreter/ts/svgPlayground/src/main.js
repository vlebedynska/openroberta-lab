require.config({
    baseUrl: '../../svgPlayground',
    paths: {
        'aiReinforcementLearningModule': 'src/aiReinforcementLearningModule',
        'svgdotjs': './node_modules/svgdotjs/dist/svg.min',
        'index':'src/index',
        'Visualizer': 'src/Visualizer',
        'Utils':'src/Utils',
        'playerImpl':'src/playerImpl',
        'models':'src/models',
        'playerImpl':'src/playerImpl',
        'qLearner':'src/qLearner',
        'timerImpl':'src/timerImpl'
    },
    shim : {
        'svgdotjs': {
            exports: 'SVG'
        },
    }
});


require([ 'require', 'index'], function(
    require) {
    index = require('index');
    console.log(index.qLearningAlgorithmModule)

})
