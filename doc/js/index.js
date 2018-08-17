window.onload = function () {
    paper.setup('paperCanvas');
    var path = new paper.Path();
    path.strokeColor = 'black';
    var start = new paper.Point(100, 100);
    path.moveTo(start);
    path.lineTo(start.add([200, -50]));
    paper.view.draw();
};
//# sourceMappingURL=index.js.map