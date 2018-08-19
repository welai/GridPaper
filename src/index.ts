var path: paper.Path;
function onMouseDown(event: paper.ToolEvent): void {
    path = new paper.Path()
    path.fillColor = new paper.Color({
        hue:        Math.random() * 360,
        saturation: 1,
        brightness: 1
    });
    path.add(event.point);
}

function onMouseDrag(event: paper.ToolEvent): void {
    var step = event.delta.divide(4)
    step.angle += 90;

    var top = event.middlePoint.add(step);
    var bottom = event.middlePoint.subtract(step);

    path.add(top);
    path.insert(0, bottom);
    path.smooth();
}

function onMouseUp(event: paper.ToolEvent): void {
    // path.add(event.point);
    path.closed = true;
    path.smooth();
}

window.onload = () => {
    paper.setup('paperCanvas')
    paper.tool = new paper.Tool()
    paper.tool.onMouseDown  = onMouseDown;
    paper.tool.onMouseDrag  = onMouseDrag;
    paper.tool.onMouseUp    = onMouseUp;
}
