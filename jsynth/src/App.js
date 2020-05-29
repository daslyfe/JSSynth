import React, { useEffect, useState, useRef, Component } from 'react';
import Tone from "tone";
import C1 from "./samples/p.wav";
import nasa from "./samples/nasa.wav";
import "./input-knobs-master/input-knobs.js"

import './App.css';
import { Knob, Pointer, Value, Arc } from './rcknob';
//import AudioGraph from "./graph.js"
import FlexGraph, { DrawShapesGraph, LineMarkGraph } from "./flexgraph.js"

var buffer1 = new Tone.Buffer(C1);
var buffer2 = new Tone.Buffer(nasa);
export var GrainBuffer = null;

export const knob = {
  one: { midi: 0, val: 0 },
  two: { midi: 0, val: 0 },
  three: { midi: 0, val: 0 },
  four: { midi: 0, val: 0 },
  five: { midi: 0, val: 0 },
  

}

export const sample = {
  loopStart: 0,
  loopLength: 0,
  loopEnd: function () { return (this.loopStart + this.loopLength) % buffer1.duration },
  playbackRate: 0,
}

const button = {
  start: "filter",
}

let noteArray = [
  [1 / 3, true], [1 / 3, false], [1 / 2, false],
  [1, true], [1, false], [2, true], [2, false],
  [3, false], [4, true], [4, false],
  [6, false], [8, true], [8, false],
  [12, false], [16, true], [16, false],
  [32, true], [32, false]
];

const time = {
  bpm: 124,
  note: function (noteData) {
    let note = noteData[0];
    let dot = noteData[1];
    let out = 60 / this.bpm / note

    let display = null
    if (note >= 1) {
      display = "1/" + note;
    }
    else {
      display = 1 / note + "/" + 1;
    }
    if (dot) {
      out += out / 2;
      display += "."
    }

    return { time: out, display: display };
  },
}
// for (let note in noteArray){
//   console.log(time.note(noteArray[note]))
// }


export const appStyles = {
  canvasWidth: window.innerWidth,
  canvasHeight: window.innerHeight,
  gameHeight: function () { return this.canvasWidth / 2 },
  gameWidth: function () { return this.canvasWidth / 3.37 },
  screenBGColor: "#B8C0AB",
  gameColor: "#F2F2F2"
}

function gameX(num) {
  let mult = appStyles.gameWidth() / 100;
  return num * mult;
}

function gameY(num) {
  let mult = appStyles.gameHeight() / 100;
  return num * mult;
}

function drawX(num) {
  let mult = appStyles.canvasWidth / 100;
  return num * mult;
}

function drawY(num) {
  let mult = appStyles.canvasHeight / 100;
  return num * mult;
}

const limiter = new Tone.Limiter(-6)



// let fft = new Tone.FFT({size: 16});
// fft.output.connect(limiter)
let filter = new Tone.Filter(
  {
    type: "lowpass",
    frequency: 17000,
    rolloff: -24,
    Q: 2,
    gain: -12
  }
)
let fade = .5;
const grainSampler = new Tone.GrainPlayer({
  url: buffer1,
  loop: true,
  playbackRate: 1,
  grainSize: .1,
  overlap: 0,
  loopStart: 0,
  loopEnd: 0,
  reverse: false,
  detune: 0,
  volume: -6,
  fadeIn: fade,
  fadeOut: fade
})

// let vibrato = new Tone.Vibrato ({
//   maxDelay : 0.005 ,
//   frequency : 5 ,
//   depth : 0.1 ,
//   type : "sine"
// })
// let convolver = new Tone.Convolver(buffer2)
// convolver.wet.value = 0

grainSampler.connect(filter);
// convolver.connect(filter);
// vibrato.connect(filter);
filter.connect(limiter);
limiter.connect(Tone.Master);





let screen = (display) => <div style={{ display: 'inline-block', marginLeft: gameX(9), marginTop: gameY(8), height: gameY(36), width: gameX(82), borderRadius: gameX(2), background: appStyles.screenBGColor }}>{display}</div>


function App() {
  const [width, setWidth] = React.useState(appStyles.canvasWidth);
  const [height, setHeight] = React.useState(appStyles.canvasHeight);
  const updateWidthAndHeight = () => {
    appStyles.canvasWidth = window.innerWidth;
    appStyles.canvasHeight = window.innerHeight;
    setWidth(appStyles.canvasWidth);
    setHeight(appStyles.canvasHeight);
  };




  //const grainSampler = useRef(null);
  const [updateDom, setUpdateDom] = useState(0);
  let topKnobs = [];
  let SomeGraph = [];
  useEffect(() => {
    window.addEventListener("resize", updateWidthAndHeight);

  
    // grainSampler = new Tone.GrainPlayer({ 
    //   url: buffer1 ,
    //   loop: true,
    //   playbackRate : .1,
    //   grainSize: 1,
    //   overlap: 0,
    //   loopStart: 0,
    //   loopEnd: 10,
    //   reverse: true  
    // }, ).toMaster(); 
    return () => window.removeEventListener("resize", updateWidthAndHeight);
  }, []);
  


  // },[]);

  const handleStart = () => {
    grainSampler.start();
    GrainBuffer = grainSampler.buffer.toArray();

    setUpdateDom(updateDom + 1);
    (grainSampler.buffer.toArray());
  };
  
  let GetKnob = (color, name) => {
    return (
      <input key={color} style={{ display: 'inline-block' }} type="range" className="input-knob"
        data-bgcolor={color}
        data-fgcolor="black"
        // data-diameter="50"
        data-diameter={parseInt(appStyles.canvasWidth/20)}
        min={0}
        max={127}
        name = {name} 
      />
    )
  }
  topKnobs.push(GetKnob("#7AB2E3", "one"));
  topKnobs.push(GetKnob("#61CD77", "two"))
  topKnobs.push(GetKnob("#50506A", "three"))
  topKnobs.push(GetKnob("#FE6D2C", "four"))
  topKnobs.push(GetKnob("gray", "five"))
  // let knobOne = GetKnob("#7AB2E3", "one");
  // let knobTwo = GetKnob("#61CD77", "two");
  // let knobThree = GetKnob("#50506A", "three");
  // let knobFour = GetKnob("#FE6D2C", "four");
  // let knobFive = GetKnob("gray", "five");

  knob.one.action = () => {
    let _knob = knob.one;
  
    let adjValue = parseInt(_knob.val * (noteArray.length - 1));
    let note = noteArray[adjValue];
    let noteLength = time.note(note).time;
    let display = time.note(note).display;
    // grainSampler.playbackRate = _knob.val * 20;
    grainSampler.grainSize = noteLength * grainSampler.playbackRate;
  }

  knob.two.action = () => {
    let _knob = knob.two;
    let adjValue = 0;
    if (_knob.val < .8) {
      adjValue = parseInt(_knob.val * 10);
    }
    else {
      adjValue = parseInt(_knob.val * 30);
    }
   
    grainSampler.overlap = adjValue;
  }


  knob.three.action = () => {
    let _knob = knob.three;
    sample.loopStart = _knob.val * buffer1.duration;
    grainSampler.loopStart = sample.loopStart;
    // grainSampler.loopEnd = adjVal + (knob.four.val * buffer1.duration);
    grainSampler.loopEnd = sample.loopEnd();
    console.log("start " + grainSampler.loopStart + " end " + grainSampler.loopEnd);
    // grainSampler.loopEnd = grainSampler.loopStart + .1;
  }

  knob.four.action = () => {
    let _knob = knob.four;
    let adjValue = parseInt(_knob.val * (noteArray.length - 1));
    let note = noteArray[adjValue];
    let noteLength = time.note(note).time;
    let display = time.note(note).display;
    sample.loopLength = noteLength * grainSampler.playbackRate;
    console.log(display)
    grainSampler.loopEnd = sample.loopEnd();
    // console.log("start " + grainSampler.loopStart + " end " + grainSampler.loopEnd);
  }

  knob.five.action = () => {
    
    let _knob = knob.five;
  
    let logVal = Math.pow((_knob.val + .38) * 5.2, 5);
    filter.frequency.value = .1 + logVal;


  }

  const aClick = () => {

  }

  const bClick = () => {


  }


  const upPad = () => {

    grainSampler.detune += 100;

  }

  const downPad = () => {
    grainSampler.detune -= 100;
  }

  const leftPad = () => {
    if (grainSampler.playbackRate > 1 && grainSampler.reverse === false) {
      grainSampler.playbackRate -= 1;
    }
    else if (grainSampler.playbackRate <= 1 && grainSampler.reverse === false) {
      grainSampler.reverse = true;
    }
    else {
      grainSampler.playbackRate += 1;
    }


    //sets properites for the time based knobs that rely on playback rate
    knob.one.action(knob.one);
    knob.three.action(knob.three);
    knob.four.action(knob.four);
  }

  const rightPad = () => {
    if (grainSampler.playbackRate > 1 && grainSampler.reverse === true) {
      grainSampler.playbackRate -= 1;
    }
    else if (grainSampler.playbackRate <= 1 && grainSampler.reverse === true) {
      grainSampler.reverse = false;
    }
    else {
      grainSampler.playbackRate += 1;
    }

    knob.one.action(knob.one);
    knob.three.action(knob.three);
    knob.four.action(knob.four);

  }

  const selClick = () => {

  }

  const startClick = () => {

  }
  

  return (
    <div>
      <div style={{ borderRadius: gameX(4), marginLeft: 100, marginTop: 20, width: appStyles.gameWidth(), height: appStyles.gameHeight(), background: appStyles.gameColor }}>
        <div>
          {screen()}
        </div>

        <div>
          {topKnobs}
        </div>
       
        <div>
          <button onMouseDown={aClick}>A</button>
          <button onMouseDown={bClick}>B</button>
        </div>
        <div>
          <button onMouseDown={upPad}>up</button>
          <button onMouseDown={downPad}>dwn</button>
          <button onMouseDown={leftPad}>left</button>
          <button onMouseDown={rightPad}>rite</button>
        </div>
        <div>
          <button onMouseDown={selClick}>select</button>
          <button onMouseDown={startClick}>start</button>
        </div>


      </div>
      <button onMouseDown={handleStart}>play</button>
    </div>
  );
};

export default App;
