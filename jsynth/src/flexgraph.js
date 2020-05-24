import React from 'react';


let globalStyles = {
    clickedPoint: null,
}
let display = "";
const commaFormat = (number) => Intl.NumberFormat().format(number);

function rndNearTenth(num) {
    return Math.round(num * 100) / 100;
}
function invertHex(hex) {
    return "#" + (Number(`0x1${hex.slice(1)}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
}

function diff(a, b) { return Math.abs(a - b); }

export function getValueDisplay(sortedData, styles) {
    if (display === "") {
        display = styles.displayInit;
    }

    let label = getTextSVG("displaytext", display, [33, sortedData.padTop * .4 + "%"], styles.displayFontSize, styles.displayColor, styles.displayFontWeight);
    return <svg key="valuedisplay">{label}</svg>

}

export function getRectangleSVG(key, styles, mouseDown, mouseOut, mouseOver, mouseUp) {
    return (
        <rect
            key={key}
            x={styles.topLeftPoint[0] + "%"} y={styles.topLeftPoint[1] + "%"} //array [x,y]
            width={styles.width + "%"} height={styles.height + "%"}
            fill={styles.fill} //string
            stroke={styles.strokeColor} //string
            strokeWidth={styles.strokeWidth}
            rx={styles.radius}
            onMouseDown={mouseDown}
            onMouseUp={mouseUp}
            onMouseOut={mouseOut}
            onMouseOver={mouseOver}
            opacity={styles.opacity}
            style={{ cursor: styles.cursor, boxShadow: "1px 3px 1px #9E9E9E" }}
        />
    )
}


export function GetCircleSvg(key, styles, fill, strokeColor, strokeWidth, centerX, centerY, xRadius, yRadius, onClick, mouseOver, mouseExit) {
    styles.heightMultiplier = parseFloat(styles.canvasWidth) / parseFloat(styles.canvasHeight);

    if (!yRadius) {
        yRadius = xRadius * styles.heightMultiplier;
    }
    else {
        yRadius = yRadius * styles.heightMultiplier;
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

export function getPathSVG(key, styles, points, color, strokeWidth, smoothing, dashSize, fill) {
    styles.heightMultiplier = parseFloat(styles.canvasWidth) / parseFloat(styles.canvasHeight);

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
            ? `M ${point[0]},${point[1] / styles.heightMultiplier}`
            // else
            : `${acc} ${command(point, i, a)}`
            , '')
        //removed position absolute i hope that doesnt break anything
        return <path key={key} style={{ width: 7, strokeDasharray: dashSize }} d={d} fill={fill} stroke={color} strokeWidth={strokeWidth} />
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
            return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1] / styles.heightMultiplier}`
        }
        else {
            return `L ${point[0]} ${point[1] / styles.heightMultiplier}`
        }
    }


    return (svgPath(points, lineCommand));
}

export function sortXYArray(data, styles, xLimit, yLimit, drawFree, range) {

    // globalStyles = {
    //     clickedPoint: null,
    // }

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
        xMax: 100,
        yMin: null,
        yMax: null,
        padLeft: 0,
        padTop: 0,
        xMultiplier: 1,
        yMultiplier: 1,
        drawFree: drawFree

    };

    let dataSetCount = 0

    
    for (let set in data) {
        if (!styles.type) {
            styles.type = [];
        }
        //if there is actually data
        let sortedData = {};
        let lastEntry = null;
        if (data[set].length) {
            lastEntry = data[set].length - 1;
            sortedData = {
                xAscending: data[set].slice(),
                yAscending: data[set].slice(),
                xMin: 0,
                xMax: 100,
                yMin: null,
                yMax: null,
                xLimit: xLimit,
                yLimit: yLimit,
                padLeft: 0,
                padTop: 0,
                xMultiplier: 0,
                yMultiplier: 0,
                drawArray: [],
                color: set,
                type: styles.type[dataSetCount]

            }
            dataSetCount += 1;

            // 

            sortedData.xAscending.sort(function (a, b) {
                return a[0] - b[0];
            })

            sortedData.yAscending.sort(function (a, b) {
                return a[1] - b[1];
            });

            //if range hasnt been specified, dynamically create it
            if (!range) {
                sortedData.xMin = parseFloat(sortedData.xAscending[0][0]);
                sortedData.xMax = parseFloat(sortedData.xAscending[lastEntry][0]);
                sortedData.yMin = parseFloat(sortedData.yAscending[0][1]);
                sortedData.yMax = parseFloat(sortedData.yAscending[lastEntry][1]);

                //if the ranges of the dataset's mins/ maxs exceed the combined data min max, update the combined
                if (sortedData.xMin < combinedData.xMin || combinedData.xMin === null) {
                    combinedData.xMin = sortedData.xMin;
                }
                if (sortedData.xMax > combinedData.xMax || combinedData.xMax === null) {
                    combinedData.xMax = sortedData.xMax;
                }
                if (sortedData.yMin < combinedData.yMin || combinedData.yMin === null) {
                    
                    combinedData.yMin = sortedData.yMin;
                }
                if (sortedData.yMax > combinedData.yMax || combinedData.yMax === null) {

                    combinedData.yMax = sortedData.yMax;
                }

            }
            else {
                //set the range to specified if it has been specified
               
                sortedData.xMin = parseFloat(range[0][0]);
                sortedData.xMax = parseFloat(range[1][0]);
                sortedData.yMin = parseFloat(range[0][1]);
                sortedData.yMax = parseFloat(range[1][1]);
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
                sortedData.xMultiplier = combinedData.xLimit / combinedData.xDiff;
            }
            else {
                sortedData.xMultiplier = 1;
            }

            if (sortedData.yDiff !== 0) {
                sortedData.yMultiplier = combinedData.yLimit / combinedData.yDiff;

            }
            else {
                sortedData.yMultiplier = 1;
            }
            combinedData.sortedData.push(sortedData);
        }
    };
    //endof for loop

    combinedData.padLeft = (100 - xLimit) / 2;
    combinedData.padTop = (100 - yLimit) / 2;
    combinedData.xDiff = combinedData.xMax - combinedData.xMin;
    combinedData.yDiff = combinedData.yMax - combinedData.yMin;

    //if there is no range differnece, make one

    if (combinedData.xDiff < 4) {
        combinedData.xMax += 2;
        combinedData.xMin += -2;
        combinedData.xDiff += 4;
    }

    if (combinedData.yDiff < 4) {
        combinedData.yMin += -2
        combinedData.yMax += 2;
        combinedData.yDiff += 4;
    }


    
    combinedData.xMultiplier = combinedData.xLimit / combinedData.xDiff;


    combinedData.yMultiplier = combinedData.yLimit / combinedData.yDiff;



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
            if (data[i].length) {      
                for (let pair in data[i]) {
                    combinedData.sortedData[set].drawArray.push([((data[i][pair][0] - combinedData.xMin) * combinedData.xMultiplier) + combinedData.padLeft, combinedData.yLimit - ((data[i][pair][1] - combinedData.yMin) * combinedData.yMultiplier) + combinedData.padTop]);
                }
                set += 1;
            }
        }
    }
   
    return (combinedData);

}
export function getTextSVG(key, display, xy, fontSize, color, fontWeight, userSelect) {
    if (!xy) {
        xy = [1, 10];
    }
    if (!fontSize) {
        fontSize = 2;
    }
    if (!color) {
        color = "black";
    }

    return (<text key={key} style={{ userSelect: userSelect, fontSize: fontSize, fontWeight: fontWeight }} fill={color} x={xy[0]} y={xy[1]}>{display}</text>);
}

export function getXAxisSVG(sortedData, styles) {
    let textArray = [];
    let tickArray = [];

    let middleX = ((100 - sortedData.padLeft) + sortedData.padLeft / 2) / 2;
    let xLine = getPathSVG("xLine", styles, [[sortedData.padLeft, 100 - sortedData.padTop], [100 - sortedData.padLeft, 100 - sortedData.padTop]], styles.axisColor, styles.axisLineSize);

    let rulerOffset = sortedData.xLimit / styles.xTicks;
    let rulerStep = diff(sortedData.xMin, sortedData.xMax) / styles.xTicks;
    let rulerPosition = sortedData.padLeft;
    for (let i = 0; i <= styles.xTicks; i++) {
        //push ruler values to text array spaced out evenly
        textArray.push(getTextSVG("xrulerValue" + i, Math.round(sortedData.xMin + (rulerStep * i)), [rulerPosition + (rulerOffset * i) + "%", 100 - (sortedData.padTop / 2) + "%"], styles.fontSize, styles.fontColor));
        if (i >= 1) {
            tickArray.push(getPathSVG("xTick" + i, styles, [[rulerPosition + (rulerOffset * i), 100 - sortedData.padTop], [rulerPosition + (rulerOffset * i), sortedData.padTop]], styles.tickColor, styles.tickLineSize, 0, 1));

        }
    }

    textArray.push(getTextSVG("xNameText", styles.xName, [100 - middleX / 1.8, 100 - (sortedData.padTop * 1.2) + "%"], styles.fontSize, styles.labelColor));

    return (
        <svg key="xaxissvg" >
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

    let rulerOffset = sortedData.yLimit / styles.yTicks; //the offset for thephysical position on the canvas
    let rulerStep = diff(sortedData.yMin, sortedData.yMax) / styles.yTicks; //the value offset 
    let rulerPosition = 100 - sortedData.padTop;
    for (let i = 0; i <= styles.yTicks; i++) {
        let yValue = sortedData.yMin + (rulerStep * i);
        //push ruler values to text array spaced out evenly, if there is a small differrence, round to the nearest 10th
        if (sortedData.yDiff > 50) {
            textArray.push(getTextSVG("yrulervalue" + i, commaFormat(Math.round(yValue)), [(sortedData.padLeft / 4) + "%", rulerPosition - (rulerOffset * i) + "%"], styles.fontSize, styles.fontColor));
        }
        else {
            textArray.push(getTextSVG("yrulervalue" + i, commaFormat(rndNearTenth(yValue)), [(sortedData.padLeft / 4) + "%", rulerPosition - (rulerOffset * i) + "%"], styles.fontSize, styles.fontColor));

        }

        if (i >= 1) {
            tickArray.push(getPathSVG("ytickline" + i, styles, [[sortedData.padLeft, rulerPosition - (rulerOffset * i)], [100 - sortedData.padLeft, rulerPosition - (rulerOffset * i)]], styles.tickColor, styles.tickLineSize, 0, 1));
        }
    }
    let yLine = getPathSVG("yLine", styles, [[sortedData.padLeft, 100 - sortedData.padTop], [sortedData.padLeft, sortedData.padTop]], styles.axisColor, styles.axisLineSize);


    let label = getTextSVG("ylabeltext", styles.yName, [(-middleX / 1.8) / styles.heightMultiplier, sortedData.padLeft * 1.25], styles.fontSize, styles.labelColor);

    return (
        <svg key="yaxissvg">
            {yLine}
            <g transform='rotate(-90)' >{label}</g>
            {textArray}
            {tickArray}
            
        </svg>
    )
}
export function getmarkerLine(sortedData, styles) {


    if (sortedData.yMin < 0 && sortedData.yMax > 0) {

        let y = sortedData.yLimit - ((0 - sortedData.yMin) * sortedData.yMultiplier) + sortedData.padTop;

        let range = [[], []];
        range = [[sortedData.padLeft, y], [100 - sortedData.padLeft, y]];
        let path = getPathSVG("markerLine", styles, range, styles.markerLineColor, styles.markerLineSize, false, 1);
        let text = getTextSVG("0LineMark", "0", [100 - sortedData.padLeft / 1.2, y + "%"], styles.fontSize, styles.markerLineColor)
        return (
            <svg key="markerLine">
                {text}
                {path}
            </svg>
        );
    }

}


//plot scatter plot points with sorted data and styles


export function GraphPoints(key, sortedData, styles) {
    let circleArray = [];
   
    
    let initValue = [];

    

        //initValue = [styles.selectedPoint[0], styles.selectedPoint[1]];

    const [selectedPoint, setSelectedPoint] = React.useState({value: initValue, draw: []});
    const [hovered, setHovered] = React.useState([]);
    //const [popTopLeft, setPopTopLeft] = React.useState([]);
   

    function handlePointClick(xVal, yVal, xDraw, yDraw) {
        display = styles.xName + ": " + xVal + " " + styles.yName + ": " + yVal;
        let point = {value: [xVal, yVal], draw: [xDraw, yDraw]}
        globalStyles.clickedPoint = point;
        // if (point.draw[0] === selectedPoint.draw[0]) {
        //     point = { value: [], draw: []}
        //     globalStyles.clickedPoint = null;
        // }
        setSelectedPoint(point);
       
    }


    for (let set in sortedData) {
      
        let alreadySelected = false;
        if (!styles.type || sortedData[set].type === "Mark" || sortedData[set.type] === "LineMark") {
            for (let pair in sortedData[set].drawArray) {
                let color = sortedData[set].color;
                let radius = styles.pointSize;

                //the draw coordinates
                let xDraw = Number(sortedData[set].drawArray[pair][0]);
                let yDraw = Number(sortedData[set].drawArray[pair][1]);

                //the unmodified data points
                let currentPair = sortedData[set].xAscending[pair];
                let xVal = currentPair[0];
                let yVal = currentPair[1];

                // if (currentPair[0] === selectedPoint.value[0] && currentPair[1] === selectedPoint.value[1] && alreadySelected === false) {
                //     color = styles.clickPointColor;
                //     alreadySelected = true;
                //     radius = styles.selectedPointSize;
                // }
                // if (currentPair[0] === styles.selectedPoint[0] && currentPair[1] === styles.selectedPoint[1]) {
          
                //     color = styles.clickPointColor;
                //     //alreadySelected = true;
                
                // }
                if (currentPair[0] === selectedPoint.value[0] && currentPair[1] === selectedPoint.value[1] && alreadySelected === false) {
                    color = styles.clickPointColor;
                    alreadySelected = true;
                    radius = styles.selectedPointSize;
                }

                if (set === hovered[0] && pair === hovered[1]) {
                    radius = styles.selectedPointSize;
                }


                // let mouseOver = () => setHovered([set, pair]);
                let mouseOver = () => { handlePointClick(xVal, yVal, xDraw, yDraw) };
                // let mouseExit = () => setHovered([]);
                let mouseExit = () => {setSelectedPoint({ value: [], draw: []}); globalStyles.clickedPoint = null};
                // let mouseDown = () => { handlePointClick(xVal, yVal, xDraw, yDraw) };
                let mouseDown = () => {};

                circleArray.push(GetCircleSvg(key + pair + set, styles, color, "none", "none", xDraw, yDraw, radius, radius, mouseDown, mouseOver, mouseExit));
            }

        }

    }


    return (<svg key = "graphpoints">{circleArray}</svg>);
}
export function getBoxAxis(sortedData, styles) {
    let boxStyle = {
        topLeftPoint: [sortedData.padLeft, sortedData.padTop],
        width: 100 - (sortedData.padLeft * 2),
        height: 100 - (sortedData.padTop * 2),
        fill: "none",
        strokeColor: styles.boxAxisColor,
        strokeWidth: styles.axisLineSize,
        radius: styles.boxRadius,

    }
        ;
    let box = getRectangleSVG("boxAxis", boxStyle);
    let XAxis = getXAxisSVG(sortedData, styles);
    let YAxis = getYAxisSVG(sortedData, styles);

    return (
        <g key = "boxaxis">
            {YAxis}{XAxis}{box}
        </g>
    )
}

export function drawCanvas(key, styles, Sketch) {
    styles.heightMultiplier = parseFloat(styles.canvasWidth) / parseFloat(styles.canvasHeight);
    let ViewBox = "0 0 100 " + (100 / styles.heightMultiplier).toString();

    return (
        <div key={key} style={{ position: "absolute", top: styles.canvasPadTop, left: styles.canvasPadLeft, width: styles.canvasWidth, height: styles.canvasHeight }}>
            <svg key = {key + "canvasBox"} style={{ background: styles.canvasColor }} viewBox={ViewBox}>
                <g key= "sketch">{Sketch}</g> 
            </svg>
        </div>
    )
}

export function LineMarkGraph(data, styles) {

    let defaults = {
        canvasWidth: "60vw",
        canvasHeight: "40vw",
        canvasPadLeft: "1vw",
        canvasPadTop: "1vw",
        displayFontSize: 2,
        lineSize: .2,
        fontSize: 2,
        fontColor: "gray",
        axisColor: "gray",
        axisLineSize: .2,
        xTicks: 4,
        yTicks: 4,
        tickColor: "#E8E8E8	",
        tickLineSize: .1,
        popYDisplay: "Y axis",
        popXDisplay: "X axis",
        clickPointColor: "lightBlue",
        pointSize: 1,
        selectedPointSize: 2,
        xName: "X-axis",
        yName: "Y-axis",
        markerLineColor: "#FFAAAA",
        markerLineSize: .3,
        background: "none",
        type: ["Line", "Mark"]
    }
    // data = null;

    //load default data if none present
    if (!data) {
        data = {
            "#75B8A0": [[-50, 0], [100, 200], [140, -10], [60, 20], [90, 90]],
            "lightBlue": [[-25, 160], [115, 91]]
        };
    }

    if (!styles) {
        styles = defaults;
    }
    //apply canvas size in styles to global canvas

    let Paths = [];
    let plots = [];
    let XAxis = [];
    let YAxis = [];
    let markerLine = [];
    let displaySVG = [];

    let combinedData = sortXYArray(data, styles, 80, 80);
    let sortedData = combinedData.sortedData;

    for (let set in sortedData) {
        let Path = null;
        if (!styles.type || sortedData[set].type === "Line" || sortedData[set.type] === "LineMark") {
            Path = getPathSVG("graphPath" + set, styles, sortedData[set].drawArray, sortedData[set].color, styles.lineSize);
            Paths.push(Path);
        }
    }


    plots = GraphPoints("pointsarray", sortedData, styles);
   
    let displayPop = GetDisplayPop(styles);

    XAxis = getXAxisSVG(combinedData, styles);
    YAxis = getYAxisSVG(combinedData, styles);
    if (styles.drawmarkerLine !== "false") {
        markerLine = getmarkerLine(combinedData, styles);
    }

    if (styles.drawDisplay !== "false") {
        displaySVG = getValueDisplay(combinedData, styles);
    }
    let canvas = drawCanvas("LineMarkCanvas", styles, [markerLine, XAxis, YAxis, Paths, plots, displaySVG, displayPop]);
    return (
        canvas
    )
}



export function FlexButton(key, styles, mouseDown, mouseHover, mouseExit) {
    styles.heightMultiplier = parseFloat(styles.canvasWidth) / parseFloat(styles.canvasHeight);


    let buttonStyle = {
        main: {
            topLeftPoint: [0, 0],
            width: 100,
            height: 92,
            fill: styles.btnColor,
            strokeColor: styles.btnStrokeColor,
            strokeWidth: styles.btnStrokeWidth,
            radius: styles.btnRadius,
        },

        cover: {
            topLeftPoint: [0, 0],
            width: 100,
            height: 100,
            fill: styles.btnColor,
            strokeColor: styles.btnStrokeColor,
            strokeWidth: styles.btnStrokeWidth,
            radius: styles.btnRadius,
            opacity: 0,
            cursor: "pointer"
        },

        shadow: {
            topLeftPoint: [0, 0],
            width: 100,
            height: 100,
            fill: "black",
            strokeColor: styles.btnStrokeColor,
            strokeWidth: styles.btnStrokeWidth,
            radius: styles.btnRadius,
            opacity: .6,
        },
        text: {
            placement: styles.btnTextRange
        }
    }

    let buttonClickedStyle = {
        main: {
            topLeftPoint: [0, 6],
            width: buttonStyle.main.width,
            height: buttonStyle.main.height,
            fill: styles.btnColor,
            strokeColor: styles.btnStrokeColor,
            strokeWidth: styles.btnStrokeWidth,
            radius: styles.btnRadius,
        },

        cover: {
            topLeftPoint: [0, 0],
            width: 100,
            height: 100,
            fill: "white",
            strokeColor: styles.btnStrokeColor,
            strokeWidth: styles.btnStrokeWidth,
            radius: styles.btnRadius,
            opacity: 0,
            cursor: "pointer"
        },

        shadow: {
            topLeftPoint: [0, 5],
            width: 100,
            height: 95,
            fill: "black",
            strokeColor: styles.btnStrokeColor,
            strokeWidth: styles.btnStrokeWidth,
            radius: styles.btnRadius,
            opacity: .6,

        },
        text: {
            placement: [styles.btnTextRange[0], styles.btnTextRange[1] + .75]
        }
    }

    const [btn, setBtn] = React.useState(buttonStyle);


    function moveButton() {
        setBtn(buttonClickedStyle);
    }
    let mouseUp = () => setTimeout(function () { setBtn(buttonStyle) }, 50);
    let mouseDownAction = () => { mouseDown(); moveButton() };
    let shadow = getRectangleSVG("dropshadow", btn.shadow);

    let button = getRectangleSVG("flexButtonrect", btn.main);
    //let text = getTextSVG("btninnertext", styles.btnDisplay,[0,0], styles.btnFontSize,styles.btnFontColor,styles.btnFontWeight);
    let buttonCover = getRectangleSVG("flexButtoncover", btn.cover, mouseDownAction, mouseExit, mouseHover, mouseUp);

    let text = getTextSVG("btninnertext", styles.btnDisplay, btn.text.placement, styles.btnFontSize, styles.btnFontColor, styles.btnFontWeight, "none")
    let canvas = drawCanvas(key, styles, [shadow, button, text, buttonCover]);
    return (canvas);
}

export function DrawShapesGraph(data, styles) {

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
        markerLineSize: .3,
        background: "no",
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
    
    let Paths = [];

    let combinedData = sortXYArray(data, styles, 80, 80, true, [[0, 0], [100, 100]]);

    let sortedData = combinedData.sortedData;

    for (let set in sortedData) {
        
        let Path = getPathSVG("graphPath" + set, styles, sortedData[set].drawArray, sortedData[set].color, styles.lineSize, 0, 0, sortedData[set].color);
        Paths.push(Path);
    }

    let boxAxis = getBoxAxis(combinedData, styles);
    let canvas = drawCanvas("shapescanvas", styles, [boxAxis, Paths]);
    return (canvas);

}

function GetDisplayPop(styles, selectedPoint) {
    let displayPop = {};
    let topLeftPoint = [];
    let pointy = [];
    let text = [];
    let xVal = null;
    let yVal = null;
    let xHeaderFontSize = styles.displayFontSize || 1;
    let yHeaderFontSize = styles.displayFontSize;
    let xValueFontSize = xHeaderFontSize * 1.25;
    let yValueFontSize = yHeaderFontSize * 1.25;
    let xHeaderXPosition = null;
    let yHeaderXPosition = null;
    let xValueXPosition = null;
    let yValueXPosition = null; 
    let flip = false;
    let xSymbol = styles.xSymbol || "";
    let ySymbol = styles.ySymbol || "";


    if (globalStyles.clickedPoint) {
        
        topLeftPoint = [globalStyles.clickedPoint.draw[0] - 6, globalStyles.clickedPoint.draw[1] -29];
        //flip the box when point is near the top of the graph
        if (topLeftPoint[1] <= 9) {
            topLeftPoint[1] += 40
            flip = true;
        }
        displayPop = {
            topLeftPoint: [topLeftPoint[0] + 2, topLeftPoint[1]],
            fill: styles.clickPointColor,
            width: 8,
            height: 18,
            radius: .5
        }
        //flip the triangle when point is near top of the graph
        if (flip === false) {
            pointy = getPathSVG(
                "popbox", styles, [
                [topLeftPoint[0] + 4.5, topLeftPoint[1] + displayPop.height -.1], 
                [topLeftPoint[0] + 7.5, topLeftPoint[1] + displayPop.height -.1], 
                [topLeftPoint[0] + 6, topLeftPoint[1] + displayPop.height + 4]
            ], "none", "0vw", 0, 0, styles.clickPointColor)
        }
        else {
            pointy = getPathSVG(
                "popbox", styles, [
                [topLeftPoint[0] + 4.5, topLeftPoint[1] + .1], 
                [topLeftPoint[0] + 7.5, topLeftPoint[1] + .1], 
                [topLeftPoint[0] + 6, topLeftPoint[1] - 4]
            ], "none", "0vw", 0, 0, styles.clickPointColor)
        }
        
        xVal = globalStyles.clickedPoint.value[0].toString() + xSymbol;
        if (xVal.length > 8){
            xValueFontSize = 12/xVal.length;
         }
      
        yVal = commaFormat(globalStyles.clickedPoint.value[1].toString()) + ySymbol;
        if (yVal.length > 8){
           yValueFontSize = 12/yVal.length;
        }
     
        
    
        //this calculates the center position of the text based on the font size and length of input
        xHeaderXPosition = (topLeftPoint[0] + 5.75) - ((xHeaderFontSize/3.11) * (styles.popXDisplay.toString().length -1))  + "%";
        yHeaderXPosition = (topLeftPoint[0] + 5.75) - ((yHeaderFontSize/3.11) * (styles.popYDisplay.toString().length -1))  + "%";

        xValueXPosition = (topLeftPoint[0] + 5.75) - ((xValueFontSize/3.11) * (xVal.toString().length -1))  + "%";
        yValueXPosition = (topLeftPoint[0] + 5.75) - ((yValueFontSize/3.11) * (yVal.toString().length -1))  + "%";
        
       
        text.push(getTextSVG("Xname", styles.popXDisplay, [xHeaderXPosition, topLeftPoint[1] + 4 + "%"], xHeaderFontSize, styles.fontColor, styles.displayFontWeight, ))
        text.push(getTextSVG("Xvalue",  xVal, [xValueXPosition, topLeftPoint[1] + 8 + "%"], xValueFontSize, styles.fontColor, "bold", ))
        text.push(getTextSVG("yname", styles.popYDisplay, [yHeaderXPosition, topLeftPoint[1] + 12 + "%"], yHeaderFontSize, styles.fontColor, styles.displayFontWeight, ))
        text.push(getTextSVG("yvalue",   yVal, [yValueXPosition, topLeftPoint[1] + 16 + "%"], yValueFontSize, styles.fontColor, "bold", ))


        

        // text.push(getTextSVG("Yname", styles.popYDisplay + " " + globalStyles.clickedPoint.value[1] + styles.ySymbol, [topLeftPoint[0] + 1 + "%", topLeftPoint[1] + 12 + "%"], styles.displayFontSize, styles.background, styles.displayFontWeight, ))

    }

    // console.log(pointy);
    if (displayPop.topLeftPoint) {
        return (
            <svg key= "displayPOP">
                    
                 {getRectangleSVG("displaything", displayPop)}
                 {pointy}
                 {text}
                 
            </svg>
            
         
        )
        
    }

}

//a blank object is getting passed to the first two params for some reason this is a placeholder import as objects
function FlexGraph(props, props2, data, styles) {

    return (LineMarkGraph(data, styles));
}


export default FlexGraph;