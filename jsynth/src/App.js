import React, { useEffect, useState, useRef, Component } from 'react';
import Tone from "tone";
import C1 from "./samples/p.wav";
import nasa from "./samples/nasa.wav";
import "./input-knobs-master/input-knobs.js"
import {img} from "./images"

import './App.css';
import { Knob, Pointer, Value, Arc } from './rcknob';
//import AudioGraph from "./graph.js"
import FlexGraph, { DrawShapesGraph, LineMarkGraph } from "./flexgraph.js"
import AudioPlayer from "./audioFile.js"
let modes = ["default", "file"];
let effects = ["filter", "delay"];
let selectedCount = 0;

let selectMode = () => {
  let mode;
  if (selectedCount < modes.length) {
    mode = modes[selectedCount];
  }
  else {
    selectedCount = 0;
    mode = modes[selectedCount];
  }
  selectedCount++;
  return mode;
}
let selEffect = 0;

// function(sel) {for (let i = 1; i < this.length; i++) {console.log("ran"); i === sel ? this.sel = true : this.sel = false; }},

let sound = [];
let activeBuffer = new Tone.Buffer(C1);
var buffer1 = new Tone.Buffer(C1);
var buffer2 = new Tone.Buffer(nasa);
let selectedFile = 0;


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
  gameHeight: function () { return this.canvasHeight / 1 },
  gameWidth: function () { return this.gameHeight()/1.685},
  screenBGColor: "#B8C0AB",
  gameColor: "#F2F2F2",
  clearColor: ""
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
  url: new Tone.Buffer(C1),
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


function AddFile() {
  let audioRef = React.createRef();
  function setAudio(files) {
      let file;   
      for (let i = 0; i < files.length; i++){     
        file = URL.createObjectURL(files[i]);
        let soundInfo = {name: files[0].name, path: file}
        sound.push(soundInfo);
      }
      selectedFile = sound[sound.length -1];
      activeBuffer = new Tone.Buffer(selectedFile.path);
      grainSampler.buffer = activeBuffer; 
  } 
  return (
      <div>
          <input ref ={audioRef} id="audio_file" type="file" multiple accept="audio/*" onChange={() => setAudio(audioRef.current.files)} />
      </div>
  )
}








function App() {
  const [mode, setMode] = React.useState("init");
  const [width, setWidth] = React.useState(appStyles.canvasWidth);
  const [height, setHeight] = React.useState(appStyles.canvasHeight);
  const [Display, setDisplay] = React.useState(<div>test</div>);
  const [dPad, setDPad] = React.useState(img.btn.dPad);
  // const [buffer, setBuffer] = React.useState(new Tone.Buffer(sound[0].path))
  const updateWidthAndHeight = () => {
    appStyles.canvasWidth = window.innerWidth;
    appStyles.canvasHeight = window.innerHeight;
    setWidth(appStyles.canvasWidth);
    setHeight(appStyles.canvasHeight);
  };



  let screen = (display) => <div className="display">{display}</div>


  const [updateDom, setUpdateDom] = useState(0);
  let topKnobs = [];
  let SomeGraph = [];
  useEffect(() => {
    // window.addEventListener("resize", updateWidthAndHeight);
  }, []);

  const handleStart = () => {
    grainSampler.start();
    GrainBuffer = grainSampler.buffer.toArray();

    setUpdateDom(updateDom + 1);
    (grainSampler.buffer.toArray());
  };
  
  let GetKnob = (color, dotColor, name) => {
    return (
      <input key={color} style={{ padding: 0, display: 'inline-block', marginLeft: "5%"}} type="range" className="input-knob"
        data-bgcolor={color}
        data-fgcolor={dotColor}
        data-diameter={parseInt(appStyles.gameWidth()/7)}
        min={0}
        max={127}
        name = {name} 
      />
    )
  }
  topKnobs.push(GetKnob("#7AB2E3", "#0071BC", "one"));
  topKnobs.push(GetKnob("#61CD77", "#009245", "two"))
  topKnobs.push(GetKnob("#FFFEFF", "#CCCCCC", "three"))
  topKnobs.push(GetKnob("#FE6D2C", "#BD5226", "four"))
  //topKnobs.push(GetKnob("gray", "five"))
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
    setDPad(img.btn.dUp);
    

  }

  const downPad = () => {
    grainSampler.detune -= 100;
    grainSampler.detune += 100;
    setDPad(img.btn.dDown);
    
  }
  let playBackStep = .5;


  const leftPad = () => {
    
    if (grainSampler.playbackRate > playBackStep && grainSampler.reverse === false) {
    
      grainSampler.playbackRate -= playBackStep;
    }
    else if (grainSampler.playbackRate <= playBackStep && grainSampler.reverse === false) {
      grainSampler.reverse = true;
    }
    else {
      grainSampler.playbackRate += playBackStep;
    }
    console.log(grainSampler.playbackRate)
    console.log(grainSampler.reverse)

    //sets properites for the time based knobs that rely on playback rate
    knob.one.action(knob.one);
    knob.three.action(knob.three);
    knob.four.action(knob.four);
    setDPad(img.btn.dLeft);
  }

  const rightPad = () => {
    if (grainSampler.playbackRate > playBackStep && grainSampler.reverse === true) {
      grainSampler.playbackRate -= playBackStep;
    }
    else if (grainSampler.playbackRate <= playBackStep && grainSampler.reverse === true) {
      grainSampler.reverse = false;
    }
    else {
      grainSampler.playbackRate += playBackStep;
    }
    console.log(grainSampler.playbackRate)
    console.log(grainSampler.reverse)
    knob.one.action(knob.one);
    knob.three.action(knob.three);
    knob.four.action(knob.four);
    setDPad(img.btn.dRight);

  }

  const selClick = () => {
    setMode(selectMode());
  }

  const startClick = () => {

  }
  
  console.log(img.btn.dPad);
  return (
    <div>
              
      {AddFile()}
      <div className="grainboi" style={{ position: "absolute",  width: appStyles.gameWidth(), height: appStyles.gameHeight()}}>

        
        <div className="display">{Display}</div>
        
        <div className="knob-bar">
          {topKnobs}
        </div>
      
        <div className="button-area">
          <button className="a-button" onMouseDown={aClick}></button>
          <div className="btn-circle">wwewe</div>
          <button className="b-button" onMouseDown={bClick}></button>
          <div className="dPad">
          <img src={img.btn.dBack} style={{position: "absolute", width: "105%", right: "-2%"}}></img>
            <img src={dPad} style={{position: "absolute", width: "100%"}}></img>
            
            <button className="d-btn" style={{left: "33%"}}onMouseDown={upPad} onMouseUp={()=>setDPad(img.btn.dPad)}></button>
            <button className="d-btn" style={{bottom: 0, left: "33%"}} onMouseDown={downPad} onMouseUp={()=>setDPad(img.btn.dPad)}></button>
            <button className="d-btn" style={{bottom: "33%", left: 0}} onMouseDown={leftPad} onMouseUp={()=>setDPad(img.btn.dPad)}></button>
            <button className="d-btn" style={{bottom: "33%", right: 0}} onMouseDown={rightPad} onMouseUp={()=>setDPad(img.btn.dPad)}></button>
          </div>
  
          <button className="sel-button" style={{left: "33%"}} onMouseDown={selClick}></button>
          <button className="sel-button" style={{right: "33%"}} onMouseDown={startClick}></button>
        </div>

      </div>
      <button onMouseDown={handleStart}>play</button>
      

    </div>
  );
};

export default App;
