const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
const genPointsButton = document.getElementById("genPoints");
const genConvexHullButton = document.getElementById("genConvexHull");
const genSimplePolyButton = document.getElementById("genSimplePoly");
const pointsField = document.getElementById("pointsField");

const width = 1280;
const height = 720;

// Only render points in the center of the screen
const defaultNGenPoints = 10;
const minGenHeight = Math.floor(height / 6);
const maxGenHeight = Math.floor(5 * height / 6);
const minGenWidth = Math.floor(width / 6);
const maxGenWidth = Math.floor(5 * width / 6);

const backgroundColour = 'slategray';
const gridLineColor = 'lightgrey';

const pointColour = 'black';
const pointRadius = 5;

const lineSegColour = 'black';
const lineSegWidth = 3;

const points = new Array();

// Point related helpers
class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distanceFromOrigin() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

function comparePoints(a, b) {
    if (a.x === b.x) {
        return a.y - b.y;
    }

    return a.x - b.x;
}
function genRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function genPoints() {

    let nGenPoints = defaultNGenPoints;
    if (pointsField.checkValidity()) {
        nGenPoints = pointsField.value;
    }

    points.length = 0;
    for (let i = 0; i < nGenPoints; ++i) {
        let newXCoord = genRandomInt(minGenWidth, maxGenWidth);
        let newYCoord = genRandomInt(minGenHeight, maxGenHeight);
        points.push(new Point2D(newXCoord, newYCoord));
    }
    drawPoints();
}
function checkLeftTurn(slice) {
    let p0 = slice[0];
    let p1 = slice[1];
    let p2 = slice[2];

    let det = (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y);

    //Flipped inequality because of the orientation flip with canvas's co-ordinates
    return det < 0;
}

// Algorithms
function genSimplePoly() {
    points.sort(comparePoints);

    let first = points[0];
    let last = points[points.length - 1];

    let upper = [first];
    let lower = [first];

    for (let i = 1; i < points.length - 1; i++) {
        if (checkLeftTurn([first, last, points[i]])) {
            upper.push(points[i]);
        } else {
            lower.push(points[i]);
        }

    }

    upper.push(last);
    lower.reverse();
    upper.push(...lower);

    return upper;
}

function genConvexHull() {
    let stackUpper = new Array();
    let stackLower = new Array();
    points.sort(comparePoints);

    stackUpper.push(points[0]);
    stackUpper.push(points[1]);

    for (let i = 2; i < points.length; i++) {
        stackUpper.push(points[i]);

        while (stackUpper.length > 2 && checkLeftTurn(stackUpper.slice(-3))) {
            let last = stackUpper.pop();
            stackUpper.pop();
            stackUpper.push(last);
        }
    }

    stackLower.push(points[points.length - 1]);
    stackLower.push(points[points.length - 2]);
    for (let i = points.length - 3; i >= 0; i--) {
        stackLower.push(points[i]);

        while (stackLower.length > 2 && checkLeftTurn(stackLower.slice(-3))) {
            let last = stackLower.pop();
            stackLower.pop();
            stackLower.push(last);
        }
    }

    let firstPoint = points[0];
    let lastPoint = points[points.length - 1];

    if (comparePoints(stackLower[0], lastPoint) == 0) {
        stackLower.shift();
    }

    if (comparePoints(stackLower[stackLower.length - 1], firstPoint) == 0) {
        stackLower.pop();
    }

    stackUpper.push(...stackLower);
    return stackUpper;
}


// Grid drawing functions
function drawGridLines() {
    let drawGridLine = (startPoint, endPoint) => {
        ctx.strokeStyle = gridLineColor;
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
    };

    let stepSize = 80;
    ctx.beginPath();

    // Do horizontal grind lines
    let nHoriLines = height / stepSize;
    for (let i = 1; i < nHoriLines; ++i) {
        let startPoint = new Point2D(0, i * stepSize);
        let endPoint = new Point2D(width, i * stepSize);
        drawGridLine(startPoint, endPoint);
    }

    let nVertLines = width / stepSize;
    for (let i = 1; i < nVertLines; ++i) {
        let startPoint = new Point2D(i * stepSize, 0);
        let endPoint = new Point2D(i * stepSize, height);
        drawGridLine(startPoint, endPoint);
    }

    ctx.stroke();
}
function drawGrid() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(0, 0, width, height);
    drawGridLines();
}

// Points and Lines
function drawPoint(point) {
    ctx.fillStyle = pointColour;
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
    ctx.fill();
}
function drawPoints() {
    drawGrid();

    for (let i = 0; i < points.length; i++) {
        drawPoint(points[i]);
    }
}
function drawLineSegment(startPoint, endPoint) {
    ctx.beginPath();
    ctx.strokeStyle = lineSegColour;

    let oldWidth = ctx.lineWidth;
    ctx.lineWidth = lineSegWidth;

    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();

    ctx.lineWidth = oldWidth;
}
function drawLines(pointList, closed = true) {
    let firstPoint = pointList[0];

    ctx.beginPath();
    let prevPoint = firstPoint;
    let curPoint;
    for (let i = 1; i < pointList.length; i++) {
        curPoint = pointList[i];
        drawLineSegment(prevPoint, curPoint);
        prevPoint = curPoint;
    }

    if (closed) {
        drawLineSegment(curPoint, firstPoint);
    }
}

// Polygons
function drawConvexHull() {
    drawPoints();
    let ch = genConvexHull();
    drawLines(ch);
}
function drawSimplePoly() {
    drawPoints();
    let ch = genSimplePoly();
    drawLines(ch);
}

function main() {
    genPoints();
    genPointsButton.addEventListener('click', genPoints);
    genConvexHullButton.addEventListener('click', drawConvexHull);
    genSimplePolyButton.addEventListener('click', drawSimplePoly);
}

main();
