import React, { Component } from "react";
import Sketch from "react-p5";
import Tone from "tone";
import { grainSampler } from './App';
import Modules from './modules';

const FFT = Modules.FFT;

let x = 100;
let y = 125;

Math.clamp = (val, min, max) => val < min ? min : val > max ? max : val;

let ref;

function VideoSynth() {
    // let firstRun = React.useEffect(() => {

    //     grainSampler.connect(FFT);
    // }, [])



    // console.log(x)


    let setup = (p5, canvasParentRef) => {
        ref = canvasParentRef;
        p5.createCanvas(500, 500).parent(canvasParentRef); // use parent to render canvas in this ref (without that p5 render this canvas outside your component)
    };
    // let draw = p5 => {
    //     // p5.background(0);
    //     let fftArray = FFT.getValue();
    //     // let fftVal = parseFloat(fftArray[10]);
    //     let fftVal = Math.clamp(fftArray[14], -150, 150) * -1
    //     // console.log(fftVal)
    //     y = fftVal;
    //     x = fftVal;
    //     p5.ellipse(150, 150, x, y);
    //     // NOTE: Do not use setState in draw function or in functions that is executed in draw function... pls use normal variables or class properties for this purposes
    // };

    let t = 0;

    let draw = (p5, canvasParentRef) => {
        setup(p5, ref)
      
        // let x;
        // let y;
        let fftArray = FFT.getValue();
        let fftVal = Math.clamp(fftArray[10], -150, 150) * -1
        console.log(fftVal);
        let scale = 3; //zoom of effect between 1.5 and 7
        let fragmentation = 7; //between 1 and 10
        let busyness = 509 ; //between 20 & 10000 smaller == busier;
        let density =  40//between 10 and 1000;
        let tilt = 0; //between 0 and 2
        let shift = 1; //between -1 and 1.2

        t+= -1;
        p5.scale(scale)
        for (let y = 0; y < 300; y++) {
            for (let x = 0; x < 300; x++) {
                (t + p5.abs(((x )+ (y * shift) -t) ^ (x - y  + t)) ** fragmentation) % busyness < density && p5.point(x,  y-(x * tilt))
            }
        }


    };


    return <Sketch setup={setup} draw={draw} />;

}

export default VideoSynth