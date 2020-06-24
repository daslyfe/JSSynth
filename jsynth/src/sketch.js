import React, { Component } from "react";
import Sketch from "react-p5";
import Tone from "tone";
import {grainSampler} from './App';

let FFT= new Tone.FFT({
    size:16
})
let x = 100;
let y = 125;

Math.clamp = (val, min, max) => val < min ? min: val > max ? max : val;
console.log( "clamp " + Math.clamp(-200, -150, 150));
 

function VideoSynth() {
    let firstRun = React.useEffect(() => {
    
        grainSampler.connect(FFT);
    }, [])
    
 
 
   console.log(x)

    let setup = (p5, canvasParentRef) => {
        p5.createCanvas(500, 500).parent(canvasParentRef); // use parent to render canvas in this ref (without that p5 render this canvas outside your component)
    };
    let draw = p5 => {
        // p5.background(0);
        let fftArray = FFT.getValue();
        // let fftVal = parseFloat(fftArray[10]);
     let fftVal = Math.clamp(fftArray[14], -150, 150) * -1
     console.log(fftVal)
        y = fftVal;
        x = fftVal;
        p5.ellipse(x, y, 70, 70);
        // NOTE: Do not use setState in draw function or in functions that is executed in draw function... pls use normal variables or class properties for this purposes
    };



    return <Sketch setup={setup} draw={draw} />;

}

export default VideoSynth