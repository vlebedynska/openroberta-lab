
require.config({
    baseUrl: '../../svgPlayground',
    paths: {
        'aiReinforcementLearningModule': 'src/aiReinforcementLearningModule',
        'svgdotjs': './node_modules/svgdotjs/dist/svg.min',
        'visualizer': 'src/visualizer',
        'utils':'src/utils',
        'playerImpl':'src/playerImpl',
        'models':'src/models',
        'qLearner':'src/qLearner',
        'timerImpl':'src/timerImpl',
        'svglookup': 'src/svglookup',
        'hyperparameterTuning': 'src/hyperparameterTuning',
        'hyperparametherTuningTest': 'src/hyperparametherTuningTest',
        'qValueLookup': 'src/qValueLookup',
        'svglookup': 'src/svglookup',
    },
    shim : {
        'svgdotjs': {
            exports: 'SVG'
        },
    }
});

// load the modules defined above
requirejs(['hyperparametherTuningTest'], function(hyperparametherTuningTest) {
    hyperparametherTuningTest
});
