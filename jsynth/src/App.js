import React, { useEffect, useState, useRef, Component } from 'react';
import Tone from "tone";
import C1 from "./samples/p.wav";

import "./input-knobs-master/input-knobs.js"
import { img } from "./images"
import MidiInput, { midiPatch }from './midi.js'

import './App.css';


//import AudioGraph from "./graph.js"
import FlexGraph, { DrawShapesGraph, LineMarkGraph } from "./flexgraph.js"


// function(sel) {for (let i = 1; i < this.length; i++) {console.log("ran"); i === sel ? this.sel = true : this.sel = false; }},
let activeBuffer = new Tone.Buffer(C1);
// let sound = [];
let sound = {
  files: {
    0: []
  },
  pageMax: 14,
  currentPage: 0,
  selected: 0,
  next: function () {
    let numPages = Object.keys(this.files).length;
    let numFiles = this.files[this.currentPage].length;
    if (numPages <= 1) {
      this.selected = (this.selected + 1) % numFiles;
    }
    else {
      if (this.selected >= numFiles - 1) {
        this.currentPage = (this.currentPage + 1) % numPages;
        this.selected = 0;
      }
      else {
        this.selected += 1;
      }
    }
    console.log(this.currentPage + " " + this.selected)
    let currentFile = this.files[this.currentPage][this.selected];
    if (currentFile) {
      return currentFile.path;
    }
  },
  prev: function () {
    let numPages = Object.keys(this.files).length;
    let numFiles = this.files[this.currentPage].length;
    if (numPages <= 1) {
      this.selected = (this.selected - 1) % (numFiles);
      if (this.selected < 0) this.selected = numFiles - 1;
    }
    else {
      if (this.selected <= 0) {
        this.currentPage = (this.currentPage - 1) % numPages;
        if (this.currentPage < 0) this.currentPage = numPages - 1;
        numFiles = this.files[this.currentPage].length;
        this.selected = numFiles - 1;
      }
      else {
        this.selected -= 1;
      }
    }
    let currentFile = this.files[this.currentPage][this.selected];
    if (currentFile) {
      return currentFile.path;
    }
  }
}


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
  loopEnd: function () { return (this.loopStart + this.loopLength) % activeBuffer.duration },
  playbackRate: 0,
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

export const appStyles = {
  canvasWidth: window.innerWidth,
  canvasHeight: window.innerHeight,
  gameHeight: function () { return this.canvasHeight / 1 },
  gameWidth: function () { return this.gameHeight() / 1.685 },
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
const grainVol = new Tone.Volume(0);
let pitchMix = new Tone.CrossFade();
let pitchShift = new Tone.PitchShift(
  {
    pitch: 7,
    windowSize: .4,
    delayTime: 0,
    feedback: .5
  }
);



let fade = .5;
const grainSampler = new Tone.GrainPlayer({
  url: activeBuffer,
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

grainSampler.connect(pitchShift);
grainSampler.connect(pitchMix, 0, 0);
pitchShift.connect(pitchMix, 0, 1);
pitchMix.connect(filter);

// grainVol.connect(filter)
// convolver.connect(filter);
// vibrato.connect(filter);
filter.connect(limiter);
limiter.connect(Tone.Master);

let paramTimer;

const screen = {
  mode: ["default", "selectAudio"],
  selected: 0,
  next: function () {
    this.selected = (this.selected + 1) % this.mode.length;
    return this.mode[this.selected];
  }
}


function getScreenText(text, type) {
  if (type === "select") {
    return <svg key={text} className="screen-text-wrapper-select" viewBox="0 0 100 5"><text className="screen-text-select" x="1" y="4">{text}</text></svg>
  }
  return <svg key={text} className="screen-text-wrapper" viewBox="0 0 100 5"><text className="screen-text" x="1" y="4">{text}</text></svg>

}


function App() {
  const [mode, setMode] = React.useState("default");
  const [width, setWidth] = React.useState(appStyles.canvasWidth);
  const [height, setHeight] = React.useState(appStyles.canvasHeight);

  const [Display, setDisplay] = React.useState(<svg className="screen-text-wrapper" viewBox="0 0 100 5"><text className="screen-text" x="0" y="4">GrainBoy</text></svg>);
  const [paramDisplay, setParamDisplay] = React.useState()
  const [dPad, setDPad] = React.useState(img.btn.dPad);

  const updateWidthAndHeight = () => {
    appStyles.canvasWidth = window.innerWidth;
    appStyles.canvasHeight = window.innerHeight;
    setWidth(appStyles.canvasWidth);
    setHeight(appStyles.canvasHeight);
  };

  let topKnobs = [];

  useEffect(() => {
    // window.addEventListener("resize", updateWidthAndHeight);
  }, []);

  function AddFile() {
    let fileUploadRef = React.createRef();
    function setAudio(files) {
      let file;
      let currentPage = 0;
      for (let i = 0; i < files.length; i++) {
        file = URL.createObjectURL(files[i]);
        let soundInfo = { name: files[i].name, path: file }
        if (sound.files[currentPage].length >= 14) {
          currentPage += 1;
          sound.files[currentPage] = [];
        }
        sound.files[currentPage].push(soundInfo);
      }
    }
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <input style={{ display: "none" }} ref={fileUploadRef} id="audio_file" type="file" multiple accept="audio/*" onChange={() => { console.log(fileUploadRef.current); setAudio(fileUploadRef.current.files); setDisplay(getSoundList()) }} />
        <input className="screen-button-overlay" type="button" onMouseDown={() => fileUploadRef.current.click()} />
      </div>
    )
  }






  const handleStart = () => {
    grainSampler.state === "stopped" ? grainSampler.start() : grainSampler.stop();
    // GrainBuffer = grainSampler.buffer.toArray();


    // grainSampler.buffer.toArray();
  };

  let getParamDisplay = (text) => {
    if (text) {
      clearTimeout(paramTimer);

      let display = () => {
        return (
          <div className="param-display">
            <svg key={text} className="param-text-wrapper" viewBox="0 0 100 12"><text className="param-text" dominantBaseline="middle" textAnchor="middle" x="50%" y="59%">{text}</text></svg>
          </div>)
      }

      setParamDisplay(display);
      paramTimer = setTimeout(() => setParamDisplay([]), 1000);
    }
  }

  let GetKnob = (color, dotColor, name) => {
    return (
      <input key={color} style={{ padding: 0, display: 'inline-block', marginLeft: "5%" }} type="range" className="input-knob"
        data-bgcolor={color}
        data-fgcolor={dotColor}
        data-diameter={parseInt(appStyles.gameWidth() / 7)}
        min={0}
        max={127}
        name={name}
      />
    )
  }
  topKnobs.push(GetKnob("#7AB2E3", "#0071BC", "one"));
  topKnobs.push(GetKnob("#61CD77", "#009245", "two"))
  topKnobs.push(GetKnob("#FFFEFF", "#CCCCCC", "three"))
  topKnobs.push(GetKnob("#FE6D2C", "#BD5226", "four"))
  //topKnobs.push(GetKnob("gray", "five"))


  knob.one.action = () => {
    let param
    let _knob = knob.one;

    let adjValue = parseInt(_knob.val * (noteArray.length - 1));
    let note = noteArray[adjValue];
    let noteLength = time.note(note).time;
    let display = time.note(note).display;
    // grainSampler.playbackRate = _knob.val * 20;
    grainSampler.grainSize = noteLength * grainSampler.playbackRate;
    param = "grain " + display
    getParamDisplay(param);
  }

  knob.two.action = () => {
    let param;
    let _knob = knob.two;
    let adjValue = 0;
    if (_knob.val < .8) {
      adjValue = parseInt(_knob.val * 10);
    }
    else {
      adjValue = parseInt(_knob.val * 30);
    }

    //change the volume to be even, volume change delayed to prevent glitching
    if (grainSampler.overlap === 0 && adjValue > 0) {
      setTimeout(() => { grainSampler.volume.value = 7;}, 500)
    }
    else if (adjValue === 0) {
      grainSampler.volume.value = -6;
    }
    
    grainSampler.overlap = adjValue;
    param = "overlap " + grainSampler.overlap;
    getParamDisplay(param);
  }


  knob.three.action = () => {
    let param;
    let _knob = knob.three;
    sample.loopStart = _knob.val * grainSampler.buffer.duration;

    grainSampler.loopStart = sample.loopStart;
    grainSampler.loopEnd = sample.loopEnd();
    param = "start " + grainSampler.loopStart.toFixed(2);
    getParamDisplay(param);

  }

  knob.four.action = () => {
    let param;
    let _knob = knob.four;
    let adjValue = parseInt(_knob.val * (noteArray.length - 1));
    let note = noteArray[adjValue];
    let noteLength = time.note(note).time;
    let display = time.note(note).display;
    sample.loopLength = noteLength * grainSampler.playbackRate;
    grainSampler.loopEnd = sample.loopEnd();
    param = "length  " + display;
    getParamDisplay(param);
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
  const getSoundList = () => {
    let out = [];
    for (let file in sound.files[sound.currentPage]) {

      let fileList = sound.files[sound.currentPage];
      if (fileList[file] === fileList[sound.selected]) {
        out.push(getScreenText(fileList[file].name, "select"))
      }
      else {
        out.push(getScreenText(fileList[file].name))
      }
    }
    return out;
  }

  const upPad = () => {
    setDPad(img.btn.dUp);
    let param;

    if (mode === "default") {
      grainSampler.detune += 100;
      param = "detune " + grainSampler.detune;
    }
    else if (mode === "selectAudio") {
      // setDisplay(getScreenText("Loading..."))
      grainSampler.buffer = new Tone.Buffer(sound.prev());
      setDisplay(getSoundList());
    }
    getParamDisplay(param);

  }

  const downPad = () => {
    setDPad(img.btn.dDown);
    let param;
    if (mode === "default") {
      grainSampler.detune -= 100;
      param = "detune " + grainSampler.detune;
    }
    else if (mode === "selectAudio") {
      // setDisplay(getScreenText("Loading..."))
      grainSampler.buffer = new Tone.Buffer(sound.next());


      setDisplay(getSoundList())
    }

    getParamDisplay(param);


  }
  let playBackStep = .5;


  const leftPad = () => {
    let param;
    setDPad(img.btn.dLeft);
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
    grainSampler.reverse ? param = "< -" + grainSampler.playbackRate.toFixed(1) + "x": param = grainSampler.playbackRate.toFixed(1) + "x >";
    
    //sets properites for the time based knobs that rely on playback rate
    knob.one.action(knob.one);
    knob.three.action(knob.three);
    knob.four.action(knob.four);
    getParamDisplay(param);

  }

  const rightPad = () => {
    let param;
    setDPad(img.btn.dRight);
    if (grainSampler.playbackRate > playBackStep && grainSampler.reverse === true) {
      grainSampler.playbackRate -= playBackStep;
    }
    else if (grainSampler.playbackRate <= playBackStep && grainSampler.reverse === true) {
      grainSampler.reverse = false;
    }
    else {
      grainSampler.playbackRate += playBackStep;
    }
    
    grainSampler.reverse ? param = "< -" + grainSampler.playbackRate.toFixed(1) + "x": param = grainSampler.playbackRate.toFixed(1) + "x >";
    
    console.log(grainSampler.reverse)
    knob.one.action(knob.one);
    knob.three.action(knob.three);
    knob.four.action(knob.four);
    getParamDisplay(param);


  }



  const selClick = () => {
    let param;
    setMode(screen.next());
    param = mode;
    getParamDisplay(param);
    // setMode(selectMode());
  }

  const startClick = () => {
    handleStart();
  }


  return (
    <div>
      <MidiInput/>
      <div className="grainboi" style={{ position: "absolute", width: appStyles.gameWidth(), height: appStyles.gameHeight() }}>


        <div className="display">
          {Display}
          {paramDisplay}
          {AddFile()}
        </div>

        <div className="knob-bar">
          {topKnobs}
        </div>

        <div className="button-area">

          <div className="btn-circle"></div>
          <div style={{ right: "8.8%", top: "21.2%" }} className="btn-circle"></div>
          <button className="a-button" onMouseDown={aClick}></button>
          <button className="b-button" onMouseDown={bClick}></button>
          <div className="dPad">
            <img src={img.btn.dBack} style={{ position: "absolute", width: "105%", right: "-2%" }}></img>
            <img src={dPad} style={{ position: "absolute", width: "100%" }}></img>
            <button className="d-btn" style={{ left: "33%" }} onMouseDown={upPad} onMouseUp={() => setDPad(img.btn.dPad)}></button>
            <button className="d-btn" style={{ bottom: 0, left: "33%" }} onMouseDown={downPad} onMouseUp={() => setDPad(img.btn.dPad)}></button>
            <button className="d-btn" style={{ bottom: "33%", left: 0 }} onMouseDown={leftPad} onMouseUp={() => setDPad(img.btn.dPad)}></button>
            <button className="d-btn" style={{ bottom: "33%", right: 0 }} onMouseDown={rightPad} onMouseUp={() => setDPad(img.btn.dPad)}></button>
          </div>

          <button className="sel-button" style={{ left: "33%" }} onMouseDown={selClick}></button>
          <button className="sel-button" style={{ right: "33%" }} onMouseDown={startClick}></button>
        </div>

      </div>



    </div>
  );
};

export default App;
