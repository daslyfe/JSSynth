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

  const [knb, setKnb] = useState({ midi: 0, val: 0 });

  const pointer = () => {
    const theta = 5.5 - knb.val * 5;
    const r = 30;
    const h = 38;
    const k = 38;
    const x = h + r * Math.cos(theta) + "%";
    const y = k + r * Math.sin(theta) + "%";

    return (
      <div
        style={{
          touchAction: "none",
          border: "none",
          background: props.pointerColor || "black",
          width: "25%",
          height: "25%",
          borderRadius: "50%",
          marginTop: x,
          marginLeft: y,
        }}
      ></div>
    );
  };

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    if (e.type === "touchmove") {
      point.x = e.touches[0].clientX
      point.y = e.touches[0].clientY
    } else {
      point.x = e.clientX;
      point.y = e.clientY;
    }
    const xDif = point.x - point.startX;
    const yDif = point.startY - point.y +knb.midi;
    let adjVal = (127 / window.innerHeight) * yDif * 6 + 63;
    let midiVal = num.clamp(adjVal, 0, 127);

    const out = {
      midi: midiVal,
      val: midiVal / 127,
    };
    // knb.midi = midiVal;
    // knob.val = knb.midi / 127
    setKnb(out);
  

  }
  if (props.action) {
    props.action(knb.midi, knb.val);
  }
  const stopDrag = (e) => {
    document.onmousemove = null;
    document.onmouseup = null;
    document.ontouchmove = null;
    document.ontouchend = null;
    console.log("mouseup");
  };
  const drag = (e) => {
    e = e || window.event;
    // e.preventDefault();
    if (e.type === "touchstart") {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else {
      startX = e.clientX;
      startY = e.clientY;
    }

    // document.onmousemove = () => {console.log('ugduhdhu')}
    document.ontouchmove = (e) => elementDrag(e);
    document.ontouchend = (e) => stopDrag(e);
    document.onmouseup = (e) => stopDrag(e);
    document.onmousemove = (e) => elementDrag(e);
  };
  const style = {
    touchAction: "none",
    background: props.color || "gray",
    borderRadius: "50%",
    position: "absolute",
    display: "flex",
    width: props.diameter,
    height: props.diameter
  }
  if (props.style) {
    for (let param in props.style) {
      style[param] = props.style[param];
    }
  }
  return (
    <div
      onTouchStart={(e) => drag(e)}
      onMouseDown={(e) => drag(e)}
      style=  {style}
  
    >
      {pointer()}
    </div>
  );
}

export default Knob;
