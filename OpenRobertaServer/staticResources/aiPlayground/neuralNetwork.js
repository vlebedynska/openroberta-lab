
SVG.on(document, 'DOMContentLoaded', function() {
    var draw = SVG().addTo('body').size(300, 130)
    var circle = draw.circle(30).fill('#f06').move(20, 20)
    var circle1 = draw.circle(30).fill('#f06').move(100, 20)
    var circle2 = draw.circle(30).fill('#f06').move(20, 100)
    var circle3 = draw.circle(30).fill('#f06').move(100, 100)

    var line = draw.line(35, 35, 115, 35)
    line.stroke({ color: '#f06', width: 5, linecap: 'round' })
})