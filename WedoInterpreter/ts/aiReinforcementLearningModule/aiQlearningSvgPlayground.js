var svg;

function file_get_contents(uri, callback) {
    fetch(uri).then(res => res.text()).then(text => callback(text));
}


function drawSVG(text) {
    svg = SVG().addTo('#svgPlayground').size(1000, 1000);
    svg.svg(text);
    var tempPath = svg.find('.cls-1').stroke({ color: '#f06', opacity: 0.6, width: 0 });

}

file_get_contents("./Reinforcement_Learning_Playground.svg", function (text) {
    drawSVG(text);
    new Test().testStart();
});
