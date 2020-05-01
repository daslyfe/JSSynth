import React, { useEffect, useState, useRef } from 'react';
import Tone from "tone";
import C1 from "./samples/p.wav";
import './App.css';
//import AudioGraph from "./graph.js"
import FlexGraph, {DrawShapesGraph, LineMarkGraph} from "./flexgraph.js"

var buffer1 = new Tone.Buffer(C1);
export var GrainBuffer = null;

function App() {
 
  const grainSampler = useRef(null);
  const [updateDom, setUpdateDom] = useState(0);
  
let SomeGraph = LineMarkGraph();
 useEffect(() => {
    grainSampler.current = new Tone.GrainPlayer({ 
      url: buffer1 ,
      loop: true,
      playbackRate : .5,
      grainSize: 0.1,
      overlap: 0.2,
      loopStart: 0,
      loopEnd: .7,
      reverse: true  
    }, ).toMaster(); 
    
  },[]);
    

    
  // },[]);
 
  const handleClick = () =>  {
    grainSampler.current.start();
    GrainBuffer = grainSampler.current.buffer.toArray(); 
    setUpdateDom(updateDom + 1);
    console.log(grainSampler.current.buffer.toArray());
  };

  return (
    <div>
      <div>
      {SomeGraph}
      </div>
      <button  onClick={handleClick}>start</button>
    </div>
  );
};

export default App;
