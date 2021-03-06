import React, { useEffect } from "react";
import Tone from "tone";
import { img } from "./util/images";
import MidiInput, { midiPatch } from "./util/midi.js";
import { vid } from "./components/sketch";
import Modules from "./dsp/modules";
import soundData from "./dsp/soundData";
import time from "./dsp/time";
import { ar, num } from "./util/utility";
import "./css/App.css";
import Knob from "./components/knob";
import Display from "./components/display";
import dspUtil from "./dsp/dsp-util";
import FileUploadComponent from "./components/add-file";
import cheatCode from "./util/cheat-code";

const { pitchShift, grainSampler, filter, pitchMix } = Modules;
const { noteArray } = time;
let { delayPitch, sample, isStarted } = dspUtil;

//the init positions for the knobs
const knbSave = [66, 0, 0, 0, 127, 0, 0, 0, 66, 66, 66, 40, 108];

//dynamic style object, used to dynamically scale processing sketch and other graphics
export const appStyles = {
  canvasWidth: () => window.innerWidth,
  canvasHeight: () => window.innerHeight,
  gameHeight() {
    return this.canvasHeight() / 1;
  },
  gameWidth() {
    return this.gameHeight() / 1.685;
  },
  screenBGColor: "#B8C0AB",
  gameColor: "#F2F2F2",
  clearColor: "",
};

//this variable is outside the app loop so it doesnt get reset
let paramTimer;

function App() {
  //video component references this to know what to display
  const [displayMode, setDisplayMode] = React.useState({
    modes: ["Video Synth", "Select_Audio"],
    selected: () => "Default",
    next() {
      this.selected = () => this.modes[0];
      ar.move(this.modes, 0, 3);
    },
    set(mode) {
      if (mode) this.selected = () => mode;
    },
  });

  const [dPad, setDPad] = React.useState(img.btn.dPad);
  const [paramText, setParamText] = React.useState();

  const updateParamText = (text) => {
    if (text && isStarted) {
      clearTimeout(paramTimer);
      setParamText(text);
      paramTimer = setTimeout(() => setParamText([]), 1000);
    }
  };

  const handleStart = () => {
    grainSampler.state === "stopped"
      ? grainSampler.start()
      : grainSampler.stop();
  };

  const firstInput = () => {
    if (isStarted === false) {
      grainSampler.start();

      isStarted = true;
      updateParamText("boot");
    }
  };

  const knobStyle = { position: "relative", marginLeft: "5.6%" };

  const grainKnobs = [
    <Knob
      key="grainSizeknb"
      initVal={knbSave[0]}
      style={knobStyle}
      diameter="18%"
      color="#7AB2E3"
      pointerColor="#0071BC"
      action={(midi, val) => {
        let param;
        const adjValue = parseInt(val * (noteArray.length - 1));
        const note = noteArray[adjValue];
        const noteLength = time.note(note).time;
        const display = time.note(note).display;
        grainSampler.grainSize = noteLength * grainSampler.playbackRate;
        param = "grain " + display;
        updateParamText(param);
        knbSave[0] = midi;
      }}
    />,
    <Knob
      key="grainOverlapKnb"
      initVal={knbSave[1]}
      style={knobStyle}
      diameter="18%"
      color="#61CD77"
      pointerColor="#009245"
      action={(midi, val) => {
        let param;
        let adjValue = 0;
        if (val < 0.8) {
          adjValue = parseInt(val * 10);
        } else {
          adjValue = parseInt(val * 30);
        }
        //change the volume to be even, volume change delayed to prevent glitching
        if (grainSampler.overlap === 0 && adjValue > 0) {
          setTimeout(() => {
            grainSampler.volume.value = 7;
          }, 500);
        } else if (adjValue === 0) {
          grainSampler.volume.value = -6;
        }
        grainSampler.overlap = adjValue;
        param = "overlap " + grainSampler.overlap;
        updateParamText(param);
        knbSave[1] = midi;
      }}
    />,
    <Knob
      key="grainStartKnb"
      initVal={knbSave[2]}
      style={knobStyle}
      diameter="18%"
      color="#FFFEFF"
      pointerColor="#CCCCCC"
      action={(midi, val) => {
        const bufferLength = grainSampler.buffer.duration * 0.75;
        let param;
        grainSampler.loopStart = val * bufferLength;
        grainSampler.loopEnd = sample.loopEnd();
        param = "start " + grainSampler.loopStart.toFixed(2);
        updateParamText(param);
        knbSave[2] = midi;
      }}
    />,
    <Knob
      key="grainLengthKnb"
      initVal={knbSave[3]}
      style={knobStyle}
      diameter="18%"
      color="#FE6D2C"
      pointerColor="#BD5226"
      action={(midi, val) => {
        let param;
        const adjValue = parseInt(val * (noteArray.length - 1));
        const note = noteArray[adjValue];
        const noteLength = time.note(note).time;
        const display = time.note(note).display;
        sample.loopLength = noteLength * grainSampler.playbackRate;
        grainSampler.loopEnd = sample.loopEnd();

        param = "length  " + display;
        updateParamText(param);
        knbSave[3] = midi;
      }}
    />,
  ];
  const fxKnobs = [
    <Knob
      key="cutoffKnb"
      initVal={knbSave[4]}
      style={knobStyle}
      diameter="18%"
      color="#7AB2E3"
      pointerColor="#0071BC"
      action={(midi, val) => {
        const logVal = Math.pow((val + 0.38) * 5.2, 5);
        filter.frequency.value = 0.1 + logVal;
        let param = "cutoff " + parseInt(filter.frequency.value);
        updateParamText(param);
        knbSave[4] = midi;
      }}
    />,
    <Knob
      key="resKnb"
      initVal={knbSave[5]}
      style={knobStyle}
      diameter="18%"
      color="#61CD77"
      pointerColor="#009245"
      action={(midi, val) => {
        const q = filter.Q.value;
        filter.Q.value = val * 10;
        let param = "res " + q.toFixed(2);
        updateParamText(param);
        knbSave[5] = midi;
      }}
    />,
    <Knob
      key="pitchMixknb"
      initVal={knbSave[6]}
      style={knobStyle}
      diameter="18%"
      color="#FFFEFF"
      pointerColor="#CCCCCC"
      action={(midi, val) => {
        pitchMix.fade.value = val <= 0.04 ? 0 : val;
        pitchShift.feedback.value = val / 2;
        let param = pitchMix.fade.value.toFixed(2);
        updateParamText("wet " + param);
        knbSave[6] = midi;
      }}
    />,
    <Knob
      key="delayTimeKnb"
      initVal={knbSave[7]}
      style={knobStyle}
      diameter="18%"
      color="#FE6D2C"
      pointerColor="#BD5226"
      action={(midi, val) => {
        const size = val;
        pitchShift.delayTime.value = size;
        let param = pitchShift.delayTime;
        updateParamText("delay " + param);
        knbSave[7] = midi;
      }}
    />,
  ];

  const videoKnobs = [
    <Knob
      key="gragKnb"
      initVal={knbSave[8]}
      style={knobStyle}
      diameter="18%"
      color="#7AB2E3"
      pointerColor="#0071BC"
      action={(midi, val) => {
        vid.frag = num.tenth(1 + val * 6);
        let param = "frag " + vid.frag;
        updateParamText(param);
        knbSave[8] = midi;
      }}
    />,
    <Knob
      key="CopyKnb"
      initVal={knbSave[9]}
      style={knobStyle}
      diameter="18%"
      color="#61CD77"
      pointerColor="#009245"
      action={(midi, val) => {
        vid.busy = parseInt(5200 - (200 + val * 5000));
        let param = "copy " + vid.busy;
        updateParamText(param);
        knbSave[9] = midi;
      }}
    />,
    <Knob
      key="shiftKnb"
      initVal={knbSave[10]}
      style={knobStyle}
      diameter="18%"
      color="#FFFEFF"
      pointerColor="#CCCCCC"
      action={(midi, val) => {
        vid.shift = num.tenth(-4 + val * 8);
        let param = "tilt " + vid.shift;
        updateParamText(param);
        knbSave[10] = midi;
      }}
    />,
    <Knob
      key="threshKnb"
      initVal={knbSave[11]}
      style={knobStyle}
      diameter="18%"
      color="#FE6D2C"
      pointerColor="#BD5226"
      action={(midi, val) => {
        vid.speed = val > 0.1 ? val * 8 : val;
        let param = "threshold " + vid.speed.toFixed(2);
        updateParamText(param);
        knbSave[11] = midi;
      }}
    />,
  ];

  //controls which set of knobs is displayed
  const [topKnobs, setTopKnobs] = React.useState(grainKnobs);

  
  //refreshes time based parameters so the buffer length stays consistent when the length of the sample is changed
  const refreshKnobs = () => {
    grainKnobs[0].props.action(knbSave[0], knbSave[0] / 127);
    grainKnobs[3].props.action(knbSave[3], knbSave[3] / 127);
  };
  const aClick = () => {
    let param = "grain synth";
    setTopKnobs(grainKnobs);
    displayMode.set("Default");
    updateParamText(param);
    cheatCode.add("A");
  };

  const bClick = () => {
    let param = "FX";
    setTopKnobs(fxKnobs);
    displayMode.set("fx");
    updateParamText(param);
    cheatCode.add("B");
  };

  const upPad = () => {
    setDPad(img.btn.dUp);
    let param;
    const mode = displayMode.selected();
    if (mode === "Default") {
      soundData.detune += 100;
      grainSampler.detune = soundData.detune;
      param = "detune " + soundData.detune;
    } else if (mode === "Select_Audio") {
      grainSampler.buffer = new Tone.Buffer(soundData.prev());
    } else if (mode === "fx") {
      pitchShift.pitch = delayPitch.nextPitch();
      param = "sparkle tune " + pitchShift.pitch.toString();
    } else if (mode === "Video Synth") {
      vid.nextScale();
      param = "scale " + vid.scale();
    }
    cheatCode.add("^");
    updateParamText(param);
  };

  const downPad = () => {
    setDPad(img.btn.dDown);
    const mode = displayMode.selected();
    let param;
    if (mode === "Default") {
      soundData.detune -= 100;
      //remove this line once reimplement midi
      grainSampler.detune = soundData.detune;
      param = "detune " + soundData.detune;
    } else if (mode === "Select_Audio") {
      grainSampler.buffer = new Tone.Buffer(soundData.next());
    } else if (mode === "fx") {
      pitchShift.pitch = delayPitch.prevPitch();
      param = "delay tune " + pitchShift.pitch.toString();
    } else if (mode === "Video Synth") {
      vid.changeColor();
      param = "color";
    }
    cheatCode.add("v");
    updateParamText(param);
  };

  let playBackStep = 0.5;
  const leftPad = () => {
    let param;
    setDPad(img.btn.dLeft);
    const mode = displayMode.selected();
    if (mode === "Default") {
      if (
        grainSampler.playbackRate > playBackStep &&
        grainSampler.reverse === false
      ) {
        grainSampler.playbackRate -= playBackStep;
      } else if (
        grainSampler.playbackRate <= playBackStep &&
        grainSampler.reverse === false
      ) {
        grainSampler.reverse = true;
      } else {
        grainSampler.playbackRate += playBackStep;
      }
      grainSampler.reverse
        ? (param = "< -" + grainSampler.playbackRate.toFixed(1) + "x")
        : (param = grainSampler.playbackRate.toFixed(1) + "x >");
      refreshKnobs();
    } else if (mode === "Select_Audio") {
      time.bpm -= 1;
      refreshKnobs();
      param = "bpm " + time.bpm;
    } else if (mode === "fx") {
      pitchShift.windowSize =
        pitchShift.windowSize <= 0.01 ? 0.001 : pitchShift.windowSize - 0.01;
      param = "window " + pitchShift.windowSize.toFixed(2);
    } else if (mode === "Video Synth") {
      vid.nextSpeed();
      param = "scroll " + (1 + vid.scrollSpeed()).toFixed(2);
    }
    cheatCode.add("<");
    updateParamText(param);
  };

  const rightPad = () => {
    let param;
    const mode = displayMode.selected();
    setDPad(img.btn.dRight);
    if (mode === "Default") {
      if (
        grainSampler.playbackRate > playBackStep &&
        grainSampler.reverse === true
      ) {
        grainSampler.playbackRate -= playBackStep;
      } else if (
        grainSampler.playbackRate <= playBackStep &&
        grainSampler.reverse === true
      ) {
        grainSampler.reverse = false;
      } else {
        grainSampler.playbackRate += playBackStep;
      }

      grainSampler.reverse
        ? (param = "< -" + grainSampler.playbackRate.toFixed(1) + "x")
        : (param = grainSampler.playbackRate.toFixed(1) + "x >");
      refreshKnobs();
    } else if (mode === "Select_Audio") {
      time.bpm += 1;
      refreshKnobs();
      param = "bpm " + time.bpm;
    } else if (mode === "fx") {
      pitchShift.windowSize += 0.01;
      param = "window " + pitchShift.windowSize.toFixed(2);
    } else if (mode === "Video Synth") {
      vid.nextOp();
      param = "logic " + vid.operator();
    }
    cheatCode.add(">");
    updateParamText(param);
  };

  const selClick = () => {
    let param;
    displayMode.next();
    param = displayMode.selected();
    if (param === "Video Synth") {
      setTopKnobs(videoKnobs);
    }
    updateParamText(param);
  };

  const startClick = () => {
    if (isStarted) handleStart();
    cheatCode.add("!");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  useEffect(() => {
    //wait until the ui loads to start DSP
    Modules.patch();
    //initiate default values for the knobs
    grainKnobs.map((knob, key) =>
      knob.props.action(knbSave[key], knbSave[key] / 127)
    );
    fxKnobs.map((knob, key) =>
      knob.props.action(knbSave[key + 4], knbSave[key + 4] / 127)
    );
    videoKnobs.map((knob, key) =>
      knob.props.action(knbSave[key + 8], knbSave[key + 8] / 127)
    );
  }, []);

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        firstInput();
      }}
      onDrag={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e)}
      key="game"
      className="grainboi noselect"
    >
      <Display
        displayMode={displayMode}
        paramText={paramText}
        isStarted={isStarted}
      />
      <FileUploadComponent
        postAction={() => {
          displayMode.set("Select_Audio");
          updateParamText(displayMode.selected());
        }}
      />
      <div className="knob-bar">{topKnobs}</div>
      <div className="button-area">
        <div className="btn-circle"></div>
        <div
          style={{ right: "8.8%", top: "21.2%" }}
          className="btn-circle"
        ></div>
        <button className="a-button noselect" onMouseDown={aClick}></button>
        <button className="b-button noselect" onMouseDown={bClick}></button>
        <div className="dPad noselect">
          <img
            src={img.btn.dBack}
            style={{ position: "absolute", width: "105%", right: "-2%" }}
          ></img>
          <img src={dPad} style={{ position: "absolute", width: "100%" }}></img>
          <button
            className="d-btn"
            style={{ left: "33%" }}
            onMouseDown={upPad}
            onMouseUp={() => setDPad(img.btn.dPad)}
          ></button>
          <button
            className="d-btn"
            style={{ bottom: 0, left: "33%" }}
            onMouseDown={downPad}
            onMouseUp={() => setDPad(img.btn.dPad)}
          ></button>
          <button
            className="d-btn"
            style={{ bottom: "33%", left: 0 }}
            onMouseDown={leftPad}
            onMouseUp={() => setDPad(img.btn.dPad)}
          ></button>
          <button
            className="d-btn"
            style={{ bottom: "33%", right: 0 }}
            onMouseDown={rightPad}
            onMouseUp={() => setDPad(img.btn.dPad)}
          ></button>
        </div>
        <button
          className="sel-button noselect"
          style={{ left: "33%" }}
          onMouseDown={selClick}
        ></button>
        <button
          className="sel-button"
          style={{ right: "33%" }}
          onMouseDown={startClick}
        ></button>
        <Knob
          key="volumeknob"
          initVal={knbSave[12]}
          style={{ position: "absolute", bottom: "12%", right: "7%" }}
          diameter="12%"
          color="#2F342E"
          pointerColor="#CCCCCC"
          action={(midi, val) => {
            grainSampler.volume.value = (val * 32) - 32
            let param = grainSampler.volume.value.toFixed(2);
            updateParamText("Volume " + param);
            knbSave[12] = midi;
          }}
        ></Knob>
      </div>
    </div>
  );
}

export default App;
