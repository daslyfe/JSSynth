import React, { useState } from "react";

const num = {
  tenth: (number) => parseFloat(number.toFixed(2)),
  clamp: (number, min, max) => Math.min(Math.max(min, number), max),
};

function Knob(props) {
  const [point] = useState({
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
  });

  const [knb, setKnb] = useState({
    midi: parseInt(props.initVal) || 0,
    val: parseInt(props.initVal) / 127 || 0,
  });

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
          position: "absolute",
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
      point.x = e.touches[0].clientX;
      point.y = e.touches[0].clientY;
    } else {
      point.x = e.clientX;
      point.y = e.clientY;
    }

    const xDif = point.x - point.startX;
    const yDif = point.startY - point.y;
    const adjVal = (127 / window.innerHeight) * yDif * 6;
    const midiVal = num.clamp(adjVal + knb.midi, 0, 127);

    const out = {
      midi: midiVal,
      val: midiVal / 127,
    };

    props.action(out.midi, out.val);
    setKnb(out);
  }

  const stopDrag = (e) => {
    document.onmousemove = null;
    document.onmouseup = null;
    document.ontouchmove = null;
    document.ontouchend = null;
  };
  const drag = (e) => {
    e = e || window.event;
    // e.preventDefault();
    if (e.type === "touchstart") {
      point.startX = e.touches[0].clientX;
      point.startY = e.touches[0].clientY;
    } else {
      point.startX = e.clientX;
      point.startY = e.clientY;
    }

    document.ontouchmove = (e) => elementDrag(e);
    document.ontouchend = (e) => stopDrag(e);
    document.onmouseup = (e) => stopDrag(e);
    document.onmousemove = (e) => elementDrag(e);
  };
  const style = {
    touchAction: "none",
    background: props.color || "gray",
    borderRadius: "50%",
    position: "relative",
    display: "inline-block",
    width: props.diameter,
    height: 0,
    paddingBottom: props.diameter,
    userSelect: "none"
  };
  if (props.style) {
    for (let param in props.style) {
      style[param] = props.style[param];
    }
  }
  const knbClass = props.className || "simple-knob";

  return (
    <div
      className={knbClass}
      onTouchStart={(e) => drag(e)}
      onMouseDown={(e) => drag(e)}
      style={style}
    >
      {pointer()}
    </div>
  );
}

export default Knob;
