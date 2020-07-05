import React from "react";
import Sketch from "react-p5";
import Modules from './modules';
import {ar} from './utility';
import {appStyles} from './App'
  

export const vid = {
    frag: 1, //between 1 and 10
    busy: 5000, //between 20 & 10000 smaller == busier;
    dense: 1,//between 10 and 1000;
    shift: 0, //between -4 and 4
    speed: 1, //low/200
    scrSpeeds: [-1, 0, .25, .5, 1, 1.5, 3],
    directs: ["left", "right", "up", "down"],
    colors: ["#3f3f3f","#B8C0AB", "#18172A","#FFDCD1", "#3B3B3B", "#FD4A62", "#FE9CAB", "#3CA0AE", "#313655", "#EAA160"],
    // colors: ["#3f3f3f", "#B8C0AB", "#2D2D2D","#0071BC", "#7AB2E3", "#61CD77", "#FE6D2C", "#D94950"  ],
    selectedColors: () => [vid.colors[0], vid.colors[1]],
    changeColor: () => {ar.shuff(vid.colors); console.log(vid.colors)},
    direction: () => vid.directs[0],
    nextSpeed: () => ar.move(vid.scrSpeeds, 0, vid.scrSpeeds.length - 1),
    scrollSpeed: () => vid.scrSpeeds[0], //0 up
    stagger: () => Number.isInteger(vid.scrollSpeed()) ? 0 : 16,
    scrollVal: () => vid.scrollSpeed() > -1 ? (vid.t ^ vid.stagger()) << vid.scrollSpeed() : 0,
    opts: ["AND", "XOR", "SHIFT"],
    operator: () => vid.opts[0],
    nextOp: () => ar.move(vid.opts, 0, vid.opts.length -1), 
    t: 10000,
    scaleOp: [2,3,4,6,10],
    nextScale: () => ar.move(vid.scaleOp, 0, vid.scaleOp.length -1),//vid.scaleOp.move(0, vid.scaleOp.length - 1),
    scale: () => vid.scaleOp[0],
    threshold: 300,
    getScreenWidth: () => (appStyles.gameWidth()/1.2) /vid.scale(),
    getScreenHeight: () => appStyles.gameWidth()/1.7 / vid.scale()

}

const FFT = Modules.FFT;

Math.clamp = (val, min, max) => val < min ? min : val > max ? max : val;
const median = (arr) => {
    const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

}



function VideoSynth() {
    let setup = (p5, ref) => {
        p5.createCanvas(appStyles.gameWidth()/1.2, appStyles.gameWidth()/1.7).parent(ref);
        
        p5.noSmooth();
    };

    let refresh = (p5, ref) => {
        p5.clear(); // use parent to render canvas in this ref (without that p5 render this canvas outside your component)
        p5.scale(vid.scale());
        p5.stroke(vid.selectedColors()[0]);
        p5.background(vid.selectedColors()[1])
    }

    const lows = [], mids = [], highs = [];
    let low = 0, middle = 0, high = 0;


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

        const density = low;


        // vid.speed = high/300
        //low/200

        const screenWidth = vid.getScreenWidth();
        const screenHeight = vid.getScreenHeight()

        vid.t += 1;

        if (vid.operator() === "AND") {
            for (let y = 0; y < screenWidth; y++) {
                for (let x = 0; x < screenHeight; x++) {
                    if (((vid.t * vid.speed) + p5.abs(((x) + (y ^ vid.shift) + vid.scrollVal()) & (x - y + vid.scrollVal())) ** vid.frag) % vid.busy < density)

                        p5.point(y, x);
                }
            }
        }
        else if (vid.operator() === "XOR") {
            for (let y = 0; y < screenWidth; y++) {
                for (let x = 0; x < screenHeight; x++) {
                    if (((vid.t * vid.speed) + p5.abs(((x) + (y ^ vid.shift) + vid.scrollVal()) ^ (x - y + vid.scrollVal())) ** vid.frag) % vid.busy < density)
                        p5.point(y, x);
                }
            }

        }
        else if (vid.operator() === "SHIFT") {
            for (let y = 0; y < screenWidth; y++) {
                for (let x = 0; x < screenHeight; x++) {
                    if (((vid.t * vid.speed) + p5.abs(((x) + (y ^ vid.shift) + vid.scrollVal()) >>> (x - y + vid.scrollVal())) ** vid.frag) % vid.busy < density)
                        p5.point(y, x);
                }
            }

        }



    };
    return <Sketch style = {{position: "absolute"}} setup={setup} draw={draw} />;
}

export default VideoSynth