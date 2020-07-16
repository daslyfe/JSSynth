import React, { useState } from "react";
import { knob } from "./App";
import { num } from "./utility";
let startX, startY, x, y, midiVal;

function Knob(props) {
  const [point] = useState({
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
  });
  
  const [knb, setKnb] = useState({midi: 0, val: 0})
  
  const pointer = () => {
    const theta =5.5-( knb.val * 5);
    const r = 30;
    const h = 38;
    const k = 38;
    const x = h + r * Math.cos(theta) + "%";
    const y = k + r * Math.sin(theta) + "%";


    return (
      <div
        style={{
          background: props.pointerColor || "black",
          width: "25%",
          height: "25%",
          borderRadius: "50%",
          marginTop: x,
          marginLeft: y
        }}
      ></div>
    );
  };

  function elementDrag(e) {
    e = e || window.event;
    point.x = e.clientX;
    point.y = e.clientY;
    const xDif = point.x - point.startX;
    const yDif = point.startY - point.y;
    let adjVal = (127 / window.innerHeight) * yDif * 6 + 63;
    let midiVal = num.clamp(adjVal, 0, 127);
    
    const out = {
      midi: midiVal,
      val: midiVal / 127,
    };
    setKnb(out);
    console.log(knb)
    if (props.action) {
      props.action(out.midi, out.val);
    }
  }

  const stopDrag = () => {
    document.onmousemove = null;
    document.onmouseup = null;
    console.log("mouseup");
  };
  const drag = (e) => {
    e = e || window.event;
    // e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
  

    // document.onmousemove = () => {console.log('ugduhdhu')}
    document.onmouseup = (e) => stopDrag();
    document.onmousemove = (e) => elementDrag(e);
  };
  return (
    <div
      onMouseDown={(e) => drag(e)}
      style={{
        touchAction: "manipulation",
        background: props.color || "gray",
        borderRadius: "50%",
        position: "absolute",
        display: "flex",
        width: props.diameter,
        height: props.diameter,
      }}
    >
      {pointer()}
    </div>
  );
}

export default Knob;
