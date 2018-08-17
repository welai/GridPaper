"use strict";
exports.__esModule = true;
var test_1 = require("./test");
window.onload = function () {
    console.log(test_1.hello);
    paper.setup('paperCanvas');
    var path = new paper.Path();
    path.strokeColor = 'black';
    var start = new paper.Point(100, 100);
    path.moveTo(start);
    path.lineTo(start.add([200, -50]));
    paper.view.draw();
};
//# sourceMappingURL=index.js.map