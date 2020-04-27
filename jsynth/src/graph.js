import React, {useEffect} from 'react';
import { GrainBuffer } from './App.js';
import {XYPlot, MarkSeries} from 'react-vis';
let idk = 0;
let data = [];
let zdata= [];
//let leftChannel = [{1: 0}]


function AudioGraph() {
    if (GrainBuffer != null) {
        let leftChannel = GrainBuffer[0];
        

        //useEffect(() => {  
            
            for (let i = 0; i < 1000; i++) {
                idk +=1;
                data.push({x: i, y: leftChannel[i]} )
            }
            console.log("bsbsbsbasubasubas");
            console.log("graph data " + data[0].y);
        //},[]);

        console.log("idk " + idk);
    }       
    
    
    return (
        <XYPlot
        width={5000}
        height={300}>
        <MarkSeries
            className="mark-series-example"
            sizeRange={[5, 15]}
            data={data}/>
        </XYPlot>
    );
}

export default AudioGraph;