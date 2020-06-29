import React, { Component } from "react";
import Sketch from "react-p5";
import Tone from "tone";
import { grainSampler } from './App';
import Modules from './modules';
import { Value } from "./rcknob";
import { knob } from "./App";

const FFT = Modules.FFT;

Math.clamp = (val, min, max) => val < min ? min : val > max ? max : val;
const median = (arr) => {
    const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

}

let ref;
let p5;

function VideoSynth() {
    let setup = (p5, ref) => {


        p5.createCanvas(500, 500).parent(ref);
        p5.stroke('teal')
        p5.noSmooth();
        


    };

    let refresh = (p5, ref) => {

        p5.clear(); // use parent to render canvas in this ref (without that p5 render this canvas outside your component)
        p5.scale(3);

    }




    let t = 0;
    let x = 0
    let y = 0;
    let lows = [];
    let mids = [];
    let highs = [];
    let low= 0, middle = 0, high = 0;

 
 


    let draw = (p5) => {
        // setup(p5, ref)
        // p5.createCanvas(100, 100)

        let fftArray = FFT.getValue();
        refresh(p5);
        lows.push(fftArray[1] * -1);
        mids.push(fftArray[3] * -1);
        highs.push(fftArray[9] * -1)
        if (lows.length >=5){

         lows.shift()
         mids.shift()
         highs.shift()
     
        }
       
 
        low = median(lows)
        middle = median(mids)
        high = median(highs)
      
        

       
        // highMed = high;

        

        for (let x = 0; x < 80; x++) {
            x < 33 ? p5.point(x, low) : x < 66 ? p5.point(x, middle) : p5.point(x, high);


        };




    };


    return <Sketch setup={setup} draw={draw} />;

}

export default VideoSynth