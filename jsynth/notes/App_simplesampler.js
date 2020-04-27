import React, { useEffect, useState, useRef } from 'react';
import { Sampler } from "tone";
import C1 from "./samples/p.wav";
import './App.css';


function App() {
  const [isLoaded, setLoaded]  = useState(false);
  const sampler = useRef(null);
  useEffect(() => {
    sampler.current = new Sampler(
      { C1 },
      {onload: () => {setLoaded(true);}}
    ).toMaster(); 
  },[]);

  const handleClick = () => sampler.current.triggerAttack("C1");

  return (
    <div>
      <button disabled={!isLoaded} onClick={handleClick}>start</button>
    </div>
  );
};

export default App;
