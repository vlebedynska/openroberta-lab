var svg;
var svg2;

function file_get_contents(uri, callback) {
    fetch(uri).then(res => res.text()).then(text => callback(text));
}


function drawSVG(text) {
    svg = SVG().addTo('#svgPlayground').size(1000, 1000);
    svg.svg(text);
    svg2 = SVG().addTo('#svgPlayground2').size(1000, 1000).viewbox("0 0 3148 1764");
    svg.find('.cls-customPathColor').stroke({ color: '#fcfcfc', opacity: 0.9, width: 0 });


}

file_get_contents("./Mars_Top_View-08.svg", function (text) {
    drawSVG(text);

    new Test().testStart();
});
