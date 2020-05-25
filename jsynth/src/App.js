import React, { useEffect, useState, useRef, Component } from 'react';
import Tone from "tone";
import C1 from "./samples/p.wav";
import nasa from "./samples/nasa.wav"

import './App.css';
import { Knob, Pointer, Value, Arc } from './rcknob';
//import AudioGraph from "./graph.js"
import FlexGraph, {DrawShapesGraph, LineMarkGraph} from "./flexgraph.js"

var buffer1 = new Tone.Buffer(C1);
var buffer2 = new Tone.Buffer(nasa);
export var GrainBuffer = null;

export const knob = {
  one: {midi: 0, val: 0},
  two: {midi: 0, val: 0},
  three: {midi: 0, val: 0},
  four: {midi: 0, val: 0},
  five: {midi: 0, val: 0},
}




var styles = {
  canvasWidth: window.innerWidth,
  canvasHeight: window.innerHeight,
  gameHeight: function() {return this.canvasWidth/2},
  gameWidth: function() {return this.canvasWidth/3.37},  
  screenBGColor: "#B8C0AB",
  gameColor: "#F2F2F2"
}

function gameX(num) {
  let mult = styles.gameWidth()/100;
  return num * mult; 
}

function gameY(num) {
  let mult = styles.gameHeight()/100;
  return num * mult; 
}

function drawX(num) {
  let mult = styles.canvasWidth/100;
  return num * mult; 
}

function drawY(num) {
  let mult = styles.canvasHeight/100;
  return num * mult; 
}

const limiter = new Tone.Limiter(-6)



// let fft = new Tone.FFT({size: 16});
// fft.output.connect(limiter)
let filter = new Tone.Filter(
  {
    type : "lowpass",
    frequency : 17000 ,
    rolloff : -24 ,
    Q : 2,
    gain : -12
    }
)

const grainSampler = new Tone.GrainPlayer({ 
  url: buffer1 ,
  loop: true,
  playbackRate : .1,
  grainSize: .1,
  overlap: 0,
  loopStart: 0,
  loopEnd: 10,
  reverse: false,
  detune: 0, 
  volume: -6 
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





let screen = (display) => <div style = {{ display: 'inline-block', marginLeft: gameX(9), marginTop: gameY(8), height: gameY(36), width: gameX(82), borderRadius: gameX(2), background: styles.screenBGColor}}>{display}</div>


function App() {
  const [width, setWidth] = React.useState(styles.canvasWidth);
  const [height, setHeight] = React.useState(styles.canvasHeight);
  const updateWidthAndHeight = () => {
    styles.canvasWidth = window.innerWidth;
    styles.canvasHeight = window.innerHeight;
    setWidth(styles.canvasWidth);
    setHeight(styles.canvasHeight);
  };





  //const grainSampler = useRef(null);
  const [updateDom, setUpdateDom] = useState(0);
    
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
    },[]);
    

    
  // },[]);
 
  const handleStart = () =>  {
    grainSampler.start();
    GrainBuffer = grainSampler.buffer.toArray(); 
    setUpdateDom(updateDom + 1);
    console.log(grainSampler.buffer.toArray());
  };
  

  let getKnob = (color, _knob) => {  
    return (
    <div style = {{display: 'inline-block'}}>
    <Knob 
      size={40}  
      angleOffset={220} 
      angleRange={280}
      min={0}
      max={127}
      onChange={(e) => {_knob.midi = e; _knob.val = e/127; _knob.action(_knob);}}
      >
      <Arc 
        arcWidth={10}
        color={color}
        radius={15} 
      />
      {/* <Pointer 
        width={5}
        radius={10}
        type="circle"
        color="blue"
      /> */}
      <Value 
        marginBottom={0} 
        className="value" 
      />
      </Knob>
      </div>
      )
  }

  let knobOne = getKnob("#7AB2E3", knob.one);
  let knobTwo = getKnob("#61CD77", knob.two);
  let knobThree = getKnob("#50506A", knob.three);
  let knobFour = getKnob("#FE6D2C", knob.four);
  let knobFive = getKnob("gray", knob.five);

  knob.one.action = (_knob) => {
    // grainSampler.playbackRate = _knob.val * 20;
    grainSampler.grainSize = _knob.val + .01;
  }

  knob.two.action = (_knob) => {
    let adjValue = 0;
    if (_knob.val < .8) {
      adjValue = parseInt(_knob.val * 10);
    } 
    else {
      adjValue = parseInt(_knob.val * 30);
    }
    console.log(adjValue);
    grainSampler.overlap = adjValue;
    
  }


  knob.three.action = (_knob) => {
    grainSampler.loopStart = _knob.val * 10;
  }
  
  knob.four.action = (_knob) => {
    grainSampler.loopEnd = (_knob.val) + grainSampler.loopStart ;
   
  }

  knob.five.action = (_knob) => {
    let logVal = Math.pow((_knob.val + .38) * 5.2, 5);
    filter.frequency.value = .1 +  logVal;
    console.log(logVal);

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
    if (grainSampler.playbackRate >= 1 && grainSampler.reverse === false) {
      grainSampler.playbackRate -= 1; 
    }
    else {
      grainSampler.reverse = true;
      grainSampler.playbackRate += 1;
    } 
  }
  
  const rightPad = () => {
    if (grainSampler.playbackRate >= 1 && grainSampler.reverse === true) {
      grainSampler.playbackRate -=1;
    }
    else {
      grainSampler.reverse = false;
      grainSampler.playbackRate += 1;
    }
    
  }

  const selClick = () => {

  }

  const startClick = () => {

  }

  return (
    <div>
      <div style= {{ borderRadius: gameX(4), marginLeft: 100, marginTop: 20, width: styles.gameWidth(),  height: styles.gameHeight(), background: styles.gameColor}}>
        <div>
          {screen()}
        </div>
        
        <div>
          {knobOne}{knobTwo}{knobThree}{knobFour}{knobFive}
        </div>

        <div>
          <button  onMouseDown={aClick}>A</button>
          <button  onMouseDown={bClick}>B</button> 
        </div>
        <div>
          <button  onMouseDown={upPad}>up</button>
          <button  onMouseDown={downPad}>dwn</button> 
          <button  onMouseDown={leftPad}>left</button>
          <button  onMouseDown={rightPad}>rite</button> 
        </div>
        <div>
          <button  onMouseDown={selClick}>select</button> 
          <button  onMouseDown={startClick}>start</button> 
        </div>
  
        
      </div>
      <button  onMouseDown={handleStart}>play</button>
    </div>
  );
};

export default App;
