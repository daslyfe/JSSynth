import React from 'react';
// import initReactFastclick from 'react-fastclick';
// initReactFastclick();

function FlexGraph() {
    
    let canvasWidth = 40;
    let canvasHeight= 40;
    let heightMultiplier = canvasWidth/canvasHeight;
    let viewBox = "0 0 100 "  + (100 / heightMultiplier).toString();
    const [display, setDisplay] = React.useState("");

    function rndNearTenth(num) {
        return Math.round(num * 100) / 100;
    }

    function diff(a,b){return Math.abs(a-b);}

    function getValueDisplay(sortedData, styles) {

        let label = getTextSVG("displaytext", display, [ 40, sortedData.padTop* .9 + "%"], styles.fontSize, styles.clickPointColor); 
        return <svg>{label}</svg>

    }

    function getRectangleSVG(key, topLeftPoint, width, height, fill, strokeColor, strokeWidth, radius, mouseDown, mouseOut, mouseOver) {
        return(  
            <rect 
            key={key}
            x={topLeftPoint[0] + "%"} y ={topLeftPoint[1] + "%"} //array [x,y]
            width = {width + "%"} height = {height + "%"}
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


    function GetCircleSvg(key, fill, strokeColor, strokeWidth, centerX, centerY, xRadius, yRadius, onClick, mouseOver, mouseExit) {
 
        if (!yRadius) {
            yRadius = xRadius * heightMultiplier;
        }
        else {
            yRadius = yRadius * heightMultiplier;
        }
    
        return(
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

    function getPathSVG (key, points, color, strokeWidth, smoothing, dashSize) {
        if (!color) {
            color= "black";
        }

        if (!strokeWidth) {
            strokeWidth = .5;
        }
        if (!dashSize) {
            dashSize = 0;
        }

        let controlPoint = null;
        //const points = points;
        const svgPath = (points, command) => {
            // build the d attributes by looping over the points
            const d = points.reduce((acc, point, i, a) => i === 0
            // if first point
            ? `M ${point[0]},${point[1] /heightMultiplier}`
            // else
            : `${acc} ${command(point, i, a)}`
            , '')
        
            return <path key={key} style={{position: "absolute", width: 7, strokeDasharray: dashSize}} d={d} fill="none" stroke={color} strokeWidth={strokeWidth}/>
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

    function sortXYArray(XYarray, xLimit, yLimit, range) {

        let lastEntry = XYarray.length -1;
        let data = {
            xAscending: XYarray.slice(),
            yAscending: XYarray.slice(),
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

        }

        data.xAscending.sort(function(a, b) {
            return parseFloat(a[0]) - parseFloat(b[0]);
        })

        data.yAscending.sort(function(a, b) {
            return a[1] - b[1];
        });

        if (!range) {
            data.xMin = data.xAscending[0][0];
            data.xMax = data.xAscending[lastEntry][0];
            data.yMin = data.yAscending[0][1];
            data.yMax = data.yAscending[lastEntry][1];
        }
        else {
            data.xMin = range[0][0];
            data.xMax = range[1][0];
            data.yMin = range[0][1];
            data.yMax = range[1][1];   
        }
        //set the default draw percents to 100% of the canvas
        if (!xLimit) {
            data.xLimit = 80;
        }
        if (!yLimit) {
            data.yLimit = 80;
        }
        data.padLeft = (100-xLimit)/2;
        data.padTop = (100-yLimit)/2;
    
        let xDiff = data.xMax - data.xMin;
        let yDiff = data.yMax - data.yMin;
        if (xDiff != 0){
            data.xMultiplier = data.xLimit/xDiff;
        }
        else {
            data.xMultiplier = 1
        }

        if (yDiff != 0) {
            data.yMultiplier = data.yLimit/yDiff;
        }
        else {
            data.yMultiplier = 1;
        }
        //now you need to reduce data.drawArray so the max value of x and y is the limit

        for (let pair in data.xAscending) {
            data.drawArray.push([((data.xAscending[pair][0] - data.xMin) * data.xMultiplier) + data.padLeft, data.yLimit - ((data.xAscending[pair][1] - data.yMin) * data.yMultiplier) + data.padTop ]);
        }
        return(data);
        
    }
    function getTextSVG(key, display, xy, fontSize, color) {
        if (!xy) {
            xy = [1, 10];
        }
        if (!fontSize) {
            fontSize = 2;
        }
        if (!color) {
            color = "black";
        }
        
        return (<text key={key} style={{fontSize: fontSize}} fill ={color} x={xy[0]} y={xy[1]}>{display}</text>);
    }

    function getXAxisSVG(sortedData, styles) { 
        let textArray = [];
        let tickArray = [];

        let middleX = ((100 - sortedData.padLeft) + sortedData.padLeft/2) /2 ;
        let xLine = getPathSVG("xLine", [[sortedData.padLeft, 100 - sortedData.padTop], [100 - sortedData.padLeft, 100 - sortedData.padTop]], styles.axisColor, styles.axisLineSize);
  
        let rulerOffset = sortedData.xLimit/styles.xTicks;
        let rulerStep = diff(sortedData.xMin, sortedData.xMax) /styles.xTicks;
        let rulerPosition = sortedData.padLeft;
        for (let i = 0; i <= styles.xTicks; i++) {
            //push ruler values to text array spaced out evenly
            textArray.push(getTextSVG("xrulerValue" + i, Math.round(sortedData.xMin + (rulerStep * i)), [rulerPosition + (rulerOffset * i) + "%", 100 - (sortedData.padTop / 2) + "%" ], styles.fontSize, styles.axisColor));
            if (i >= 1) {
                tickArray.push(getPathSVG("xTick" + i, [[rulerPosition + (rulerOffset * i) , 100 - sortedData.padTop], [rulerPosition + (rulerOffset * i) , sortedData.padTop]], styles.tickColor, styles.tickLineSize));
                
            }
        }
        
        textArray.push(getTextSVG("xNameText", styles.xName, [100 - middleX/2, 100 - (sortedData.padTop *1.2) + "%"], styles.fontSize, styles.axisColor ));

        return (
            <svg  >
                {textArray}
                {tickArray}
                {xLine}
            </svg>   
        )
    }
    //<g transform='rotate(90), translate(10.000000, -55.000000)' ></g>
    function getYAxisSVG(sortedData, styles) { 
        let textArray = [];
        let tickArray = [];
        
        let middleX = ((100 - sortedData.padLeft) + sortedData.padLeft/2) /2 ;
        let yLine = getPathSVG("yLine", [[sortedData.padLeft, 100 - sortedData.padTop], [sortedData.padLeft, sortedData.padTop]], styles.axisColor, styles.axisLineSize);
        
        let rulerOffset = sortedData.yLimit/styles.yTicks; //the offset for thephysical position on the canvas
        let rulerStep = diff(sortedData.yMin, sortedData.yMax) /styles.yTicks; //the value offset 
        let rulerPosition = 100 - sortedData.padTop; 
        for (let i = 0; i <= styles.yTicks; i++) {
            //push ruler values to text array spaced out evenly
            textArray.push(getTextSVG("yrulervalue" + i, Math.round(sortedData.yMin + (rulerStep * i)), [(sortedData.padLeft/2) + "%", rulerPosition - (rulerOffset * i) + "%" ], styles.fontSize, styles.axisColor));
            if (i >= 1) {
                tickArray.push( getPathSVG("ytickline" + i, [[sortedData.padLeft, rulerPosition - (rulerOffset * i)], [100 -sortedData.padLeft, rulerPosition - (rulerOffset * i)]], styles.tickColor, styles.tickLineSize));
            }
        }
        
        let label = getTextSVG("ylabeltext", styles.yName, [ (-middleX/2) / heightMultiplier , sortedData.padLeft * 1.3 ], styles.fontSize, styles.axisColor);

        return (
            <svg>
                <g transform='rotate(-90)' >{label}</g>
                {textArray}
                {tickArray}         
                {yLine}       
            </svg>   
        )
    }
    function getZeroLine(sortedData, styles) {
        
        if (sortedData.yMin <= 0 && sortedData.yMax > 0) {  
            let y = sortedData.yLimit - ((0 - sortedData.yMin) * sortedData.yMultiplier) + sortedData.padTop;
            let range = [[], []];
            range = [[sortedData.padLeft, y ], [100 - sortedData.padLeft, y]];
            let path = getPathSVG("zeroline", range, styles.zeroLineColor, styles.zeroLineSize, false, .8);
            let text = getTextSVG("0LineMark", "0", [100 - sortedData.padLeft/1.2, y + "%"], styles.fontSize, styles.zeroLineColor)
            return(
                <svg>
                    {text}
                    {path}
                </svg>
                );
        }
    }


    //plot scatter plot points with sorted data and styles
    

    function GraphPoints(key, sortedData, styles) {
        let circleArray = [];
         
        const [selectedPoint, setSelectedPoint] = React.useState();
        const [hovered, setHovered] = React.useState();

        function handlePointClick(pair) {
            setSelectedPoint(pair);
            let xVal = sortedData.xAscending[pair][0];
            let yVal = sortedData.xAscending[pair][1];
            setDisplay(styles.xName + ": " + xVal + " " + styles.yName + ": " + yVal);

        }
        

        
        for (let pair in sortedData.drawArray) {
            let color = styles.pointColor;
            let radius = styles.pointSize;  
            if (pair === selectedPoint) {
                color = styles.clickPointColor;
                radius = styles.selectedPointSize;
            }
            if (pair === hovered)  {
                radius = styles.selectedPointSize;
            }
            
            let xDraw = sortedData.drawArray[pair][0];
            
            let yDraw = sortedData.drawArray[pair][1];
            let mouseOver = () => setHovered(pair);
            let mouseExit = () => setHovered(null);
            let onClick = () => {handlePointClick(pair)};
            circleArray.push(GetCircleSvg(key+pair, color, "none", "none", xDraw, yDraw, radius, radius, onClick, mouseOver, mouseExit)); 
        }

        return (circleArray);
    }

    function LineMarkGraph(data, styles) {

        let defaults = {
            lineSize: .2,
            lineColor: "#75B8A0",
            fontSize: 2,
            axisColor: "#7BA7F0",
            axisLineSize: .2,
            xTicks: 4,
            yTicks: 4, 
            tickColor: "#E8E8E8	",
            tickLineSize: .1,
            pointColor: "#75B8A0",
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
            data = [[-50, 0],[100, 200],  [140, -10], [60, 20], [90, 90]];
        }
        
        if (!styles) {
            //styles = defaults;
            styles = defaults;  
        }
    
        let sortedData = sortXYArray(data, 80, 80, );
    
        //let aSquare = getRectangleSVG("sq", [0,0], 100, 20, "red");
        //let aCircle = GetCircleSvg("circ", "blue", "none", "none", 90, 90, 1,  );
        let Path = getPathSVG("graphPath", sortedData.drawArray, styles.lineColor, styles.lineSize, );
        let plot = GraphPoints("pointsarray", sortedData, styles);
        let XAxis = getXAxisSVG(sortedData, styles);
        let YAxis = getYAxisSVG(sortedData, styles);
        let zeroLine = getZeroLine(sortedData, styles);
        let displaySVG = getValueDisplay(sortedData, styles);

        return (
            <div style={{position: "absolute", left: "10%", width: canvasWidth + "%", height: canvasHeight + "%"}}>
                <svg style={{background: styles.background}} viewBox={viewBox}>
                    {zeroLine}{XAxis}{YAxis}{Path}{plot}{displaySVG}
                </svg>
            </div>
        )

    }

    function CompareGraph(data, styles) {

        let defaults = {
            lineSize: .2,
            lineColor: "#75B8A0",
            fontSize: 2,
            axisColor: "#7BA7F0",
            axisLineSize: .2,
            xTicks: 4,
            yTicks: 4, 
            tickColor: "#E8E8E8	",
            tickLineSize: .1,
            pointColor: "#75B8A0",
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
            data = [[1, 20], [1, 200], [10, 20]];
        }
        
        if (!styles) {
            //styles = defaults;
            styles = defaults;  
        }
    
        let sortedData = sortXYArray(data, 80, 80, );
    
        //let aSquare = getRectangleSVG("sq", [0,0], 100, 20, "red");
        //let aCircle = GetCircleSvg("circ", "blue", "none", "none", 90, 90, 1,  );
        let Path = getPathSVG("graphPath", sortedData.drawArray, styles.lineColor, styles.lineSize, );
        let plot = GraphPoints("pointsarray", sortedData, styles);
        let XAxis = getXAxisSVG(sortedData, styles);
        let YAxis = getYAxisSVG(sortedData, styles);
        let zeroLine = getZeroLine(sortedData, styles);
        let displaySVG = getValueDisplay(sortedData, styles);

        return (
            <div style={{position: "absolute", left: "10%", width: canvasWidth + "%", height: canvasHeight + "%"}}>
                <svg style={{background: styles.background}} viewBox={viewBox}>
                    {zeroLine}{XAxis}{YAxis}{Path}{plot}{displaySVG}
                </svg>
            </div>
        )

    }
    //a blank object is getting passed to the first two params for some reason


    return (LineMarkGraph());
}

export default FlexGraph;