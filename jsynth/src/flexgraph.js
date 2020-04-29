import React from 'react';

function FlexGraph() {
    
    let canvasWidth = 40;
    let canvasHeight= 40;
    let heightMultiplier = canvasWidth/canvasHeight;
    let viewBox = "0 0 100 "  + (100 / heightMultiplier).toString();
    const [display, setDisplay] = React.useState("");

    function rndNearTenth(num) {
        return Math.round(num * 100) / 100;
    }
    
    function getValueDisplay(sortedData, styles) {
        console.log("got value display");
        let label = getTextSVG("displaytext", display, [ 40, 100 - sortedData.padTop/2 + "%"], styles.fontSize, styles.lineColor); 
        return <svg>{label}</svg>

    }

    function getRectangleSVG(key, topLeftPoint, width, height, fill, strokeColor, strokeWidth, radius) {
        return(  
            <rect 
            key={key}
            x={topLeftPoint[0] + "%"} y ={topLeftPoint[1] + "%"} //array [x,y]
            width = {width + "%"} height = {height + "%"}
            fill={fill} //string
            stroke={strokeColor} //string
            strokeWidth={strokeWidth} 
            rx={radius}
        />  
        )
    }


    function getCircleSVG(key, fill, strokeColor, strokeWidth, centerX, centerY, xRadius, yRadius, onClick) {
        if (!yRadius) {
            yRadius = xRadius * heightMultiplier;
        }
        else {
            yRadius = yRadius * heightMultiplier;
        }
        //onClick = () => console.log("clicked");
        return(
            <ellipse 
                key={key}
                cx={centerX + "%"} cy={centerY + "%"}
                rx={xRadius + "%"} ry={yRadius + "%"}
                fill={fill}
                stroke={strokeColor} //string
                strokeWidth={strokeWidth} 
                onClick={onClick}
            />  
        )
    }

    function getPathSVG (points, color, strokeWidth, smoothing, dashSize) {
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
        
            return <path style={{position: "absolute", width: 7, strokeDasharray: dashSize}} d={d} fill="none" stroke={color} strokeWidth={strokeWidth}/>
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
    

        data.xMultiplier = data.xLimit/(data.xMax - data.xMin);
        data.yMultiplier = data.yLimit/(data.yMax - data.yMin);
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
        let xLine = getPathSVG([[sortedData.padLeft, 100 - sortedData.padTop], [100 - sortedData.padLeft, 100 - sortedData.padTop]], styles.axisColor, styles.axisLineSize);
    
        textArray.push(getTextSVG("xMinText", sortedData.xMin, [sortedData.padLeft + "%", 100 - (sortedData.padTop / 2) + "%" ], styles.fontSize, styles.axisColor));
        textArray.push(getTextSVG("xMaxText", sortedData.xMax, [100 - sortedData.padLeft + "%", 100 - (sortedData.padTop / 2) + "%" ], styles.fontSize, styles.axisColor));
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
        let yLine = getPathSVG([[sortedData.padLeft, 100 - sortedData.padTop], [sortedData.padLeft, sortedData.padTop]], styles.axisColor, styles.axisLineSize);
        textArray.push(getTextSVG("yMinText", sortedData.yMin, [(sortedData.padLeft/2) + "%", 100 - (sortedData.padTop) + "%" ], styles.fontSize, styles.axisColor));
        textArray.push(getTextSVG("yMaxTExt", sortedData.yMax, [sortedData.padLeft/2 + "%", sortedData.padTop + "%" ], styles.fontSize, styles.axisColor));
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
            let path = getPathSVG(range, styles.zeroLineColor, styles.zeroLineSize, false, .8);
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
        let radius = styles.pointSize;
        let colorArray = [];
        const [plotPoints, setPlotPoints]= React.useState([]);

        function handlePointClick(pair) {
            //circleArray.pop();
            
            let xVal = sortedData.xAscending[pair][0];
            let yVal = sortedData.xAscending[pair][1];
            let xDraw = sortedData.drawArray[pair][0];
            let yDraw = sortedData.drawArray[pair][1];
            let onClick = () => {handlePointClick(pair)};
            let splicePoint = getCircleSVG(key+pair, styles.clickPointColor, "none", "none", xDraw, yDraw, radius, radius, onClick);
            circleArray.splice(pair, 1, splicePoint);
            let newArray = circleArray.slice();
            setPlotPoints(newArray);
            setDisplay(styles.xName + ": " + xVal + " " + styles.yName + ": " + yVal);

        }
        

        if (!radius) {
            radius = 1;
        }
        
        for (let pair in sortedData.drawArray) {
            //olorArray.push(sortedData.push(sortedData.)
            let xDraw = sortedData.drawArray[pair][0];
            let yDraw = sortedData.drawArray[pair][1];
            let onClick = () => {handlePointClick(pair)};
            circleArray.push(getCircleSVG(key+pair, styles.pointColor, "none", "none", xDraw, yDraw, radius, radius, onClick)); 
        }
        
        
            React.useEffect(() => {
                setPlotPoints(circleArray);
            }, []);
         
            console.log(circleArray[0]);
        return (plotPoints);
    }

    function LineMarkGraph(data, styles) {

        let defaults = {
            lineSize: .2,
            lineColor: "#75B8A0",
            fontSize: 2,
            axisColor: "#7BA7F0",
            axisLineSize: .2,
            pointColor: "#75B8A0",
            clickPointColor: "blue",
            pointSize: 1,
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
        //let aCircle = getCircleSVG("circ", "blue", "none", "none", 90, 90, 1,  );
        let aPath = getPathSVG(sortedData.drawArray, styles.lineColor, styles.lineSize, );
        let plot = GraphPoints("pointsarray", sortedData, styles);
        console.log("plot");
        console.log(plot);
        let XAxis = getXAxisSVG(sortedData, styles);
        let YAxis = getYAxisSVG(sortedData, styles);
        let zeroLine = getZeroLine(sortedData, styles);
        let displaySVG = getValueDisplay(sortedData, styles);

        return (
            <div style={{position: "absolute", left: "10%", width: canvasWidth + "%", height: canvasHeight + "%"}}>
                <svg style={{background: styles.background}} viewBox={viewBox}>
                    {zeroLine}{XAxis}{YAxis}{aPath}{plot}{displaySVG}
                </svg>
            </div>
        )

    }
    //a blank object is getting passed to the first two params for some reason


    return (LineMarkGraph())
}

export default FlexGraph;