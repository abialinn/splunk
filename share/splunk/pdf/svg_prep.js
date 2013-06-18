// Convince Highcharts that our window supports SVG's
window.SVGAngle = true;

// jsdom doesn't yet support createElementNS, so just fake it up
window.document.createElementNS = function(ns, tagName) {
    var elem = window.document.createElement(tagName);
    elem.getBBox = function() {
        return {
            x: elem.offsetLeft,
            y: elem.offsetTop,
            width: elem.offsetWidth,
            height: elem.offsetHeight
        };
    };
    // Convince Highcharts that our window supports SVG's
    elem.createSVGRect = true;
    return elem;
};