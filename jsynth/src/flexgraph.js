import React from 'react';
// import initReactFastclick from 'react-fastclick';
// initReactFastclick();



let canvasWidth = 80;
let canvasHeight = 40;
let heightMultiplier = canvasWidth / canvasHeight;
let viewBox = "0 0 100 " + (100 / heightMultiplier).toString();
let display = "";

function rndNearTenth(num) {
    return Math.round(num * 100) / 100;
}
function invertHex(hex) {
    return "#" + (Number(`0x1${hex.slice(1)}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
}

function diff(a, b) { return Math.abs(a - b); }

export function getValueDisplay(sortedData, styles) {

    let label = getTextSVG("displaytext", display, [40, sortedData.padTop * .9 + "%"], styles.fontSize, styles.clickPointColor);
    return <svg>{label}</svg>

}

export function getRectangleSVG(key, topLeftPoint, width, height, fill, strokeColor, strokeWidth, radius, mouseDown, mouseOut, mouseOver) {
    return (
        <rect
            key={key}
            x={topLeftPoint[0] + "%"} y={topLeftPoint[1] + "%"} //array [x,y]
            width={width + "%"} height={height + "%"}
            fill={fill} //string
            stroke={strokeColor} //string
            strokeWidth={strokeWidth}
            rx={radius}
            onMouseDown={mouseDown}
            onMouseOut={mouseOut}
            onMouseOver={mouseOver}
        />
    )
}


export function GetCircleSvg(key, fill, strokeColor, strokeWidth, centerX, centerY, xRadius, yRadius, onClick, mouseOver, mouseExit) {

    if (!yRadius) {
        yRadius = xRadius * heightMultiplier;
    }
    else {
        yRadius = yRadius * heightMultiplier;
    }

    return (
        <ellipse
            key={key}
            cx={centerX + "%"} cy={centerY + "%"}
            rx={xRadius + "%"} ry={yRadius + "%"}
            fill={fill}
            stroke={strokeColor} //string
            strokeWidth={strokeWidth}
            onMouseDown={onClick}
            onMouseOut={mouseExit}
            onMouseOver={mouseOver}

        />
    )
}

export function getPathSVG(key, points, color, strokeWidth, smoothing, dashSize, fill) {
    if (!color) {
        color = "black";
    }

    if (!strokeWidth) {
        strokeWidth = .5;
    }
    if (!dashSize) {
        dashSize = 0;
    }
    if (!fill) {
        fill = "none"
    }

    let controlPoint = null;
    //const points = points;
    const svgPath = (points, command) => {
        // build the d attributes by looping over the points
        const d = points.reduce((acc, point, i, a) => i === 0
            // if first point
            ? `M ${point[0]},${point[1] / heightMultiplier}`
            // else
            : `${acc} ${command(point, i, a)}`
            , '')

        return <path key={key} style={{ position: "absolute", width: 7, strokeDasharray: dashSize }} d={d} fill={fill} stroke={color} strokeWidth={strokeWidth} />
    }



    if (smoothing) {

        const line = (pointA, pointB) => {
            const lengthX = pointB[0] - pointA[0]
            const lengthY = pointB[1] - pointA[1]
            return {
                length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
                angle: Math.atan2(lengthY, lengthX)
            }
        }
        controlPoint = (current, previous, next, reverse) => {
            // When 'current' is the first or last point of the array
            // 'previous' or 'next' don't exist.
            // Replace with 'current'
            const p = previous || current
            const n = next || current
            // The smoothing ratio

            // Properties of the opposed-line
            const o = line(p, n)
            // If is end-control-point, add PI to the angle to go backward
            const angle = o.angle + (reverse ? Math.PI : 0)
            const length = o.length * smoothing
            // The control point position is relative to the current point
            const x = current[0] + Math.cos(angle) * length
            const y = current[1] + Math.sin(angle) * length
            return [x, y]
        }
    }
    const lineCommand = (point, i, a) => {
        if (smoothing) {
            // start control point
            const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);

            // end control point
            const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true)
            return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1] / heightMultiplier}`
        }
        else {
            return `L ${point[0]} ${point[1] / heightMultiplier}`
        }
    }


    return (svgPath(points, lineCommand));
}

export function sortXYArray(data, xLimit, yLimit, drawFree, range) {

    if (!drawFree) {
        drawFree = false;
    }
    if (!xLimit) {
        xLimit = 80;

    }
    if (!yLimit) {
        yLimit = 80;

    }

    let combinedData = {
        sortedData: [],
        xLimit: xLimit,
        yLimit: yLimit,
        xMin: 0,
        xMax: 0,
        yMin: 0,
        yMax: 0,
        padLeft: 0,
        padTop: 0,
        xMultiplier: 1,
        yMultiplier: 1,
        drawFree: drawFree

    };


    for (let set in data) {
        let lastEntry = data[set].length - 1;
        let sortedData = {
            xAscending: data[set].slice(),
            yAscending: data[set].slice(),
            xMin: 0,
            xMax: 0,
            yMin: 0,
            yMax: 0,
            xLimit: xLimit,
            yLimit: yLimit,
            padLeft: 0,
            padTop: 0,
            xMultiplier: 0,
            yMultiplier: 0,
            drawArray: [],
            color: set,

        }

        sortedData.xAscending.sort(function (a, b) {
            return a[0] - b[0];
        })

        sortedData.yAscending.sort(function (a, b) {
            return a[1] - b[1];
        });

        //if range hasnt been specified, dynamically create it
        if (!range) {
            sortedData.xMin = sortedData.xAscending[0][0];
            sortedData.xMax = sortedData.xAscending[lastEntry][0];
            sortedData.yMin = sortedData.yAscending[0][1];
            sortedData.yMax = sortedData.yAscending[lastEntry][1];

            //if the ranges of the dataset's mins/ maxs exceed the combined data min max, update the combined
            if (sortedData.xMin < combinedData.xMin) {
                combinedData.xMin = sortedData.xMin;
            }
            if (sortedData.xMax > combinedData.xMax) {
                combinedData.xMax = sortedData.xMax;
            }
            if (sortedData.yMin < combinedData.yMin) {
                combinedData.yMin = sortedData.yMin;
            }
            if (sortedData.xMax > combinedData.yMax) {
                combinedData.yMax = sortedData.yMax;
            }

        }
        else {
            //set the range to specified if it has been specified
            sortedData.xMin = range[0][0];
            sortedData.xMax = range[1][0];
            sortedData.yMin = range[0][1];
            sortedData.yMax = range[1][1];
            combinedData.xMin = sortedData.xMin;
            combinedData.xMax = sortedData.xMax;
            combinedData.yMin = sortedData.yMin;
            combinedData.yMax = sortedData.yMax;
        }
        //set the default draw percents to 100% of the canvas

        sortedData.padLeft = (100 - xLimit) / 2;
        sortedData.padTop = (100 - yLimit) / 2;

        sortedData.xDiff = sortedData.xMax - sortedData.xMin;
        sortedData.yDiff = sortedData.yMax - sortedData.yMin;
        if (sortedData.xDiff !== 0) {
            sortedData.xMultiplier = combinedData.xLimit / sortedData.xDiff;
        }
        else {
            sortedData.xMultiplier = 1
        }

        if (sortedData.yDiff !== 0) {
            sortedData.yMultiplier = sortedData.yLimit / sortedData.yDiff;

        }
        else {
            sortedData.yMultiplier = 1;
        }
        combinedData.sortedData.push(sortedData);
    };
    //endof for loop

    combinedData.padLeft = (100 - xLimit) / 2;
    combinedData.padTop = (100 - yLimit) / 2;
    combinedData.xDiff = combinedData.xMax - combinedData.xMin;
    combinedData.yDiff = combinedData.yMax - combinedData.yMin;

    if (combinedData.xDiff !== 0) {
        combinedData.xMultiplier = combinedData.xLimit / combinedData.xDiff;
    }
    else {
        combinedData.xMultiplier = 1
    }

    if (combinedData.yDiff !== 0) {
        combinedData.yMultiplier = combinedData.yLimit / combinedData.yDiff;

    }
    else {
        combinedData.yMultiplier = 1;
    }

    if (combinedData.drawFree === false) {

        for (let set in combinedData.sortedData) {
            let sortedData = combinedData.sortedData[set];
            //push the modified data in xascending order
            for (let pair in sortedData.xAscending) {
                combinedData.sortedData[set].drawArray.push([((sortedData.xAscending[pair][0] - combinedData.xMin) * combinedData.xMultiplier) + combinedData.padLeft, combinedData.yLimit - ((sortedData.xAscending[pair][1] - combinedData.yMin) * combinedData.yMultiplier) + combinedData.padTop]);
            }
        }
    }
    else {
        let set = 0
        //data is an object that has keys with the color attribute, use a count instead for set attribute
        for (let i in data) {
            //push the modified data in original order for drawing shapes and stuff            
            for (let pair in data[i]) {
                combinedData.sortedData[set].drawArray.push([((data[i][pair][0] - combinedData.xMin) * combinedData.xMultiplier) + combinedData.padLeft, combinedData.yLimit - ((data[i][pair][1] - combinedData.yMin) * combinedData.yMultiplier) + combinedData.padTop]);
            }
            set += 1;
        }
    }

    return (combinedData);

}
export function getTextSVG(key, display, xy, fontSize, color) {
    if (!xy) {
        xy = [1, 10];
    }
    if (!fontSize) {
        fontSize = 2;
    }
    if (!color) {
        color = "black";
    }

    return (<text key={key} style={{ fontSize: fontSize }} fill={color} x={xy[0]} y={xy[1]}>{display}</text>);
}

export function getXAxisSVG(sortedData, styles) {
    let textArray = [];
    let tickArray = [];

    let middleX = ((100 - sortedData.padLeft) + sortedData.padLeft / 2) / 2;
    let xLine = getPathSVG("xLine", [[sortedData.padLeft, 100 - sortedData.padTop], [100 - sortedData.padLeft, 100 - sortedData.padTop]], styles.axisColor, styles.axisLineSize);

    let rulerOffset = sortedData.xLimit / styles.xTicks;
    let rulerStep = diff(sortedData.xMin, sortedData.xMax) / styles.xTicks;
    let rulerPosition = sortedData.padLeft;
    for (let i = 0; i <= styles.xTicks; i++) {
        //push ruler values to text array spaced out evenly
        textArray.push(getTextSVG("xrulerValue" + i, Math.round(sortedData.xMin + (rulerStep * i)), [rulerPosition + (rulerOffset * i) + "%", 100 - (sortedData.padTop / 2) + "%"], styles.fontSize, styles.fontColor));
        if (i >= 1) {
            tickArray.push(getPathSVG("xTick" + i, [[rulerPosition + (rulerOffset * i), 100 - sortedData.padTop], [rulerPosition + (rulerOffset * i), sortedData.padTop]], styles.tickColor, styles.tickLineSize));

        }
    }

    textArray.push(getTextSVG("xNameText", styles.xName, [100 - middleX / 2, 100 - (sortedData.padTop * 1.2) + "%"], styles.fontSize, styles.fontColor));

    return (
        <svg  >
            {textArray}
            {tickArray}
            {xLine}
        </svg>
    )
}
//<g transform='rotate(90), translate(10.000000, -55.000000)' ></g>
export function getYAxisSVG(sortedData, styles) {
    let textArray = [];
    let tickArray = [];

    let middleX = ((100 - sortedData.padLeft) + sortedData.padLeft / 2) / 2;
    let yLine = getPathSVG("yLine", [[sortedData.padLeft, 100 - sortedData.padTop], [sortedData.padLeft, sortedData.padTop]], styles.axisColor, styles.axisLineSize);

    let rulerOffset = sortedData.yLimit / styles.yTicks; //the offset for thephysical position on the canvas
    let rulerStep = diff(sortedData.yMin, sortedData.yMax) / styles.yTicks; //the value offset 
    let rulerPosition = 100 - sortedData.padTop;
    for (let i = 0; i <= styles.yTicks; i++) {
        //push ruler values to text array spaced out evenly
        textArray.push(getTextSVG("yrulervalue" + i, Math.round(sortedData.yMin + (rulerStep * i)), [(sortedData.padLeft / 2) + "%", rulerPosition - (rulerOffset * i) + "%"], styles.fontSize, styles.fontColor));
        if (i >= 1) {
            tickArray.push(getPathSVG("ytickline" + i, [[sortedData.padLeft, rulerPosition - (rulerOffset * i)], [100 - sortedData.padLeft, rulerPosition - (rulerOffset * i)]], styles.tickColor, styles.tickLineSize));
        }
    }

    let label = getTextSVG("ylabeltext", styles.yName, [(-middleX / 2) / heightMultiplier, sortedData.padLeft * 1.3], styles.fontSize, styles.fontColor);

    return (
        <svg>
            <g transform='rotate(-90)' >{label}</g>
            {textArray}
            {tickArray}
            {yLine}
        </svg>
    )
}
export function getZeroLine(sortedData, styles) {

    if (sortedData.yMin <= 0 && sortedData.yMax > 0) {
        let y = sortedData.yLimit - ((0 - sortedData.yMin) * sortedData.yMultiplier) + sortedData.padTop;
        let range = [[], []];
        range = [[sortedData.padLeft, y], [100 - sortedData.padLeft, y]];
        let path = getPathSVG("zeroline", range, styles.zeroLineColor, styles.zeroLineSize, false, .8);
        let text = getTextSVG("0LineMark", "0", [100 - sortedData.padLeft / 1.2, y + "%"], styles.fontSize, styles.zeroLineColor)
        return (
            <svg>
                {text}
                {path}
            </svg>
        );
    }
}


//plot scatter plot points with sorted data and styles


export function GraphPoints(key, sortedData, styles) {
    let circleArray = [];

    const [selectedPoint, setSelectedPoint] = React.useState([]);
    const [hovered, setHovered] = React.useState([]);

    function handlePointClick(set, pair) {

        let xVal = sortedData[set].xAscending[pair][0];
        let yVal = sortedData[set].xAscending[pair][1];
        display = styles.xName + ": " + xVal + " " + styles.yName + ": " + yVal;
        setSelectedPoint([set, pair]);

    }

    for (let set in sortedData) {
        for (let pair in sortedData[set].drawArray) {
            let color = sortedData[set].color;
            let radius = styles.pointSize;

            if (set === selectedPoint[0] && pair === selectedPoint[1]) {
                color = styles.clickPointColor;
                radius = styles.selectedPointSize;
            }
            if (set === hovered[0] && pair === hovered[1]) {
                radius = styles.selectedPointSize;
            }

            let xDraw = sortedData[set].drawArray[pair][0];

            let yDraw = sortedData[set].drawArray[pair][1];
            let mouseOver = () => setHovered([set, pair]);
            let mouseExit = () => setHovered([]);
            let mouseDown = () => { handlePointClick(set, pair) };
            circleArray.push(GetCircleSvg(key + pair + set, color, "none", "none", xDraw, yDraw, radius, radius, mouseDown, mouseOver, mouseExit));
        }

    }



    return (circleArray);
}
export function getBoxAxis(sortedData, styles) {
    let width = 100 - (sortedData.padLeft * 2);
    let height = 100 - (sortedData.padTop * 2);
    let box = getRectangleSVG("boxAxis", [sortedData.padLeft, sortedData.padTop], width, height, "none", styles.boxAxisColor, styles.axisLineSize, styles.boxRadius)
    let XAxis = getXAxisSVG(sortedData, styles);
    let YAxis = getYAxisSVG(sortedData, styles);

    return (
        <g>
            {YAxis}{XAxis}{box}
        </g>
    )
}
export function getCanvasBounds(styles) {
    heightMultiplier = parseInt(styles.canvasWidth) / parseInt(styles.canvasHeight);
    viewBox = "0 0 100 " + (100 / heightMultiplier).toString();
}

export function LineMarkGraph(data, styles) {
    console.log("LineMarkGraph");
    let defaults = {
        canvasWidth: "40vw",
        canvasHeight: "40vw",
        canvasPadLeft: "1vw",
        canvasPadTop: "1vw",
        lineSize: .2,
        fontSize: 2,
        fontColor: "#7BA7F0",
        axisColor: "#7BA7F0",
        axisLineSize: .2,
        xTicks: 4,
        yTicks: 4,
        tickColor: "#E8E8E8	",
        tickLineSize: .1,
        clickPointColor: "#C18FE4",
        pointSize: 1,
        selectedPointSize: 2,
        xName: "X-axis",
        yName: "Y-axis",
        zeroLineColor: "#FFAAAA",
        zeroLineSize: .3,
        background: "none",
    }

    //load default data if none present
    if (!data) {
        data = {
            "#75B8A0": [[-50, 0], [100, 200], [140, -10], [60, 20], [90, 90]],
            "#DCDCAA": [[-25, 160], [115, 91]]
        };
    }

    if (!styles) {
        //styles = defaults;
        styles = defaults;
    }
    //apply canvas size in styles to global canvas
    getCanvasBounds(styles);


    let Paths = [];
    let plots = [];



    //let aSquare = getRectangleSVG("sq", [0,0], 100, 20, "red");
    //let aCircle = GetCircleSvg("circ", "blue", "none", "none", 90, 90, 1,  );
    let combinedData = sortXYArray(data, 80, 80);
    let sortedData = combinedData.sortedData;
    for (let set in sortedData) {

        let Path = getPathSVG("graphPath" + set, sortedData[set].drawArray, sortedData[set].color, styles.lineSize);
        Paths.push(Path);


    }

    let plot = GraphPoints("pointsarray", sortedData, styles);
    plots.push(plot);
    let XAxis = getXAxisSVG(combinedData, styles);
    let YAxis = getYAxisSVG(combinedData, styles);
    let zeroLine = getZeroLine(combinedData, styles);
    let displaySVG = getValueDisplay(combinedData, styles);

    return (
        <div style={{ position: "absolute", top: styles.canvasPadTop, left: styles.canvasPadLeft, width: styles.canvasWidth, height: styles.canvasHeight }}>
            <svg style={{ background: styles.background }} viewBox={viewBox}>
                {zeroLine}{XAxis}{YAxis}{Paths}{plots}{displaySVG}
            </svg>
        </div>
    )

}



export function DrawShapesGraph(data, styles) {
    console.log("drawshapes");

    let defaults = {
        canvasWidth: "40vw",
        canvasHeight: "40vw",
        canvasPadLeft: 0,
        canvasPadTop: 0,
        lineSize: .2,
        fontSize: 2,
        fontColor: "#7BA7F0",
        axisColor: "none",
        boxAxisColor: "#7BA7F0",
        boxRadius: .5,
        axisLineSize: .2,
        xTicks: 1,
        yTicks: 5,
        tickColor: "#E8E8E8	",
        tickLineSize: .1,
        clickPointColor: "#C18FE4",
        pointSize: 1,
        selectedPointSize: 2,
        xName: "",
        yName: "thangz",
        zeroLineSize: .3,
        background: "none",

    }

    //load default data if none present
    if (!data) {
        data = {
            "#DCDCAA": [[99, 1], [99, 55], [75, 55], [50, 55], [25, 55], [1, 55], [1, 1]],
            "#75B8A0": [[99, 1], [99, 30], [75, 25], [50, 30], [25, 30], [1, 30], [1, 1]]
        };
    }

    if (!styles) {
        styles = defaults;
    }
    getCanvasBounds(styles);

    let Paths = [];
    let combinedData = sortXYArray(data, 80, 80, true, [[0, 0], [100, 100]]);
    let sortedData = combinedData.sortedData;
    for (let set in sortedData) {

        let Path = getPathSVG("graphPath" + set, sortedData[set].drawArray, sortedData[set].color, styles.lineSize, 0, 0, sortedData[set].color);
        Paths.push(Path);


    }

    let displaySVG = getValueDisplay(combinedData, styles);
    let boxAxis = getBoxAxis(combinedData, styles);

    return (
        <div style={{ position: "absolute", left: styles.canvasPadLeft, top: styles.canvasPadTop, width: styles.canvasWidth, height: styles.canvasHeight }}>
            <svg style={{ background: styles.background }} viewBox={viewBox}>
                {boxAxis}{Paths}{displaySVG}
            </svg>
        </div>
    )

}


//a blank object is getting passed to the first two params for some reason this is a placeholder import as objects
function FlexGraph(props, props2, data, styles) {

    return (LineMarkGraph(data, styles));
}


export default FlexGraph;