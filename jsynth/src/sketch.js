import React from "react";
import Sketch from "react-p5";
import Modules from './modules';

Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

Array.prototype.shuffle = function () {
    for (var i = this.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
}

export const vid = {
    frag: 1, //between 1 and 10
    busy: 5000, //between 20 & 10000 smaller == busier;
    dense: 1,//between 10 and 1000;
    shift: 0, //between -4 and 4
    speed: 1, //low/200
    scrSpeeds: [-1, 0, .25, .5, 1, 1.5, 3],
    directs: ["left", "right", "up", "down"],
    colors: ["#3f3f3f","#B8C0AB","#FBF2EE", "#18172A","#FFDCD1", "3B3B3B", "#FD4A62", "#FE9CAB", "#3CA0AE", "#313655", "#EAA160"],
    selectedColors: () => [vid.colors[0], vid.colors[1]],
    changeColor: () => vid.colors.shuffle(),
    direction: () => vid.directs[0],
    nextSpeed: () => vid.scrSpeeds.move(0, vid.scrSpeeds.length - 1),
    scrollSpeed: () => vid.scrSpeeds[0], //0 up
    stagger: () => Number.isInteger(vid.scrollSpeed()) ? 0 : 16,
    scrollVal: () => vid.scrollSpeed() > -1 ? (vid.t ^ vid.stagger()) << vid.scrollSpeed() : 0,
    opts: ["AND", "XOR", "SHIFT"],
    operator: () => vid.opts[0],
    nextOp: () => vid.opts.move(0, vid.opts.length - 1),
    prevOp: () => vid.opts.move(vid.opts.length - 1, 0),
    t: 10000,
    scale: 3,
    threshold: 300,
    getScreenWidth: () => 340 / vid.scale,
    getScreenHeight: () => 240 / vid.scale

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
        p5.createCanvas(500, 500).parent(ref);
        
        p5.noSmooth();
    };

    let refresh = (p5, ref) => {
        p5.clear(); // use parent to render canvas in this ref (without that p5 render this canvas outside your component)
        p5.scale(vid.scale);
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
    return <Sketch setup={setup} draw={draw} />;
}

export default VideoSynth