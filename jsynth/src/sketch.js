import React, { Component } from "react";
import Sketch from "react-p5";
import Tone from "tone";
import { grainSampler } from './App';
import Modules from './modules';
import { Value } from "./rcknob";
import { knob } from "./App";

export const vidParam = {
    fragmentation: 7, //between 1 and 10
    busyness: 10000, //between 20 & 10000 smaller == busier;
    density: 100,//between 10 and 1000;
    shift: 3, //between -4 and 4
    speed: 1, //low/200
    stagger: 0,
    scrollSpeed: 0, //0 up
    scrollVal: () => vidParam.scrollSpeed > 0 ? (vidParam.t ^ vidParam.stagger) << vidParam.scrollSpeed : 0,
    operator: "AND",
    t: 10000,
    scale: 3
}

const FFT = Modules.FFT;

Math.clamp = (val, min, max) => val < min ? min : val > max ? max : val;
const median = (arr) => {
    const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

}
let scale = 3;
const getScreenWidth = () => 300 / scale;
const getScreenHeight = () => 240 / scale;

function VideoSynth() {
    let setup = (p5, ref) => {
        p5.createCanvas(500, 500).parent(ref);
        p5.stroke('teal')
        p5.noSmooth();
    };

    let refresh = (p5, ref) => {
        p5.clear(); // use parent to render canvas in this ref (without that p5 render this canvas outside your component)
        p5.scale(scale);
    }

    const lows = [], mids = [], highs = [];
    let low = 0, middle = 0, high = 0;
    let t = 10000;

    let draw = (p5) => {
        let fftArray = FFT.getValue();
        refresh(p5);
        lows.push(fftArray[1] * -1);
        mids.push(fftArray[3] * -1);
        highs.push(fftArray[9] * -1)
        if (lows.length >= 5) {
            lows.shift()
            mids.shift()
            highs.shift()
        }
        low = median(lows)
        middle = median(mids)
        high = median(highs);

        let fragmentation = 7; //between 1 and 10
        let busyness = 10000; //between 20 & 10000 smaller == busier;
        let density = high//between 10 and 1000;
        let shift = 3; //between -4 and 4
        let speed = low / 300 //low/200
        let stagger = 0;
        let scrollSpeed = 0; //0 up
        let scrollVal = scrollSpeed > 0 ? (t ^ stagger) << scrollSpeed : 0;
        let operator = "AND"
        const screenWidth = getScreenWidth();
        const screenHeight = getScreenHeight()

        t += 1;
        console.log(t);
        if (operator === "AND") {
            for (let y = 0; y < screenWidth; y++) {
                for (let x = 0; x < screenHeight; x++) {
                    if (((t * speed) + p5.abs(((x) + (y ^ shift) + scrollVal) & (x - y + scrollVal)) ** fragmentation) % busyness < density)
                        p5.point(y, x);
                }
            }
        }
        else if (operator === "XOR"){
            for (let y = 0; y < screenWidth; y++) {
                for (let x = 0; x < screenHeight; x++) {
                    if (((t * speed) + p5.abs(((x) + (y ^ shift) + scrollVal) ^ (x - y + scrollVal)) ** fragmentation) % busyness < density)
                        p5.point(y, x);
                }
            }

        }
        else if (operator === "SHIFT") {
            for (let y = 0; y < screenWidth; y++) {
                for (let x = 0; x < screenHeight; x++) {
                    if (((t * speed) + p5.abs(((x) + (y ^ shift) + scrollVal) >>> (x - y + scrollVal)) ** fragmentation) % busyness < density)
                        p5.point(y, x);
                }
            }
    
        }
      


    };
    return <Sketch setup={setup} draw={draw} />;
}

export default VideoSynth