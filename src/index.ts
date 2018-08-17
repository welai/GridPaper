import { hello } from './test'

window.onload = () => {
    console.log(hello)
    paper.setup('paperCanvas')
    let path = new paper.Path();
    path.strokeColor = 'black';
    let start = new paper.Point(100, 100);
    path.moveTo(start);
    path.lineTo(start.add([200, -50]));
    paper.view.draw();
}