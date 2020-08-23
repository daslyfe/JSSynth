import React, { useEffect, useState, useRef, Component } from "react";
import Tone from "tone";

import { img } from "./images";
import MidiInput, { midiPatch } from "./midi.js";
import VideoSynth, { vid } from "./sketch";
import Modules from "./modules";
import SoundData from "./soundData";
import Time from "./time";
import { ar, num } from "./utility";
import "./App.css";
import Knob from './simpleKnob'

const grainSampler = Modules.grainSampler;
const filter = Modules.filter;
const pitchShift = Modules.pitchShift;
const pitchMix = Modules.pitchMix;
const sound = SoundData;
const time = Time;
const noteArray = time.noteArray;

let isStarted = false;
// const midiInput = MidiInput();

const delayPitch = {
  array: [12, 19, 24, -24, -17, -12, -5, 0, 7],
  nextPitch() {
    ar.move(this.array, 0, 8);
    return this.array[0];
  },
  prevPitch() {
    ar.move(this.array, 8, 0);
    return this.array[0];
  },
  selected() {
    return this.array[0];
  },
};

const cheatCode = {
  press: "00000000000",
  validate: "^^vv<><>BA!",
  success: () => window.open("https://waterkeeper.org/donate/"),
  add: (btn) => {
    cheatCode.press = cheatCode.press.slice(1, 11);
    cheatCode.press += btn;
    if (cheatCode.press === cheatCode.validate) {
      cheatCode.success();
    }
  },
};
const knbSave = [66, 0, 0, 0, 127, 0, 0, 0, 66, 66, 66, 40];

//

const sample = {
  loopLength: 0,
  loopEnd: () =>
    isStarted
      ? (grainSampler.loopStart + sample.loopLength) %
        grainSampler.buffer.duration
      : grainSampler.loopStart + sample.loopLength,
  // loopEnd: function () {
  //   return grainSampler.loopStart + this.loopLength;
  // },
  playbackRate: 0,
};

export const appStyles = {
  canvasWidth: () => window.innerWidth,
  canvasHeight: () => window.innerHeight,
  gameHeight: function () {
    return this.canvasHeight() / 1;
  },
  gameWidth: function () {
    return this.gameHeight() / 1.685;
  },
  screenBGColor: "#B8C0AB",
  gameColor: "#F2F2F2",
  clearColor: "",
};

let paramTimer;

function getScreenText(text, type) {
  if (type === "select") {
    return (
      <svg
        key={text}
        className="screen-text-wrapper-select"
        viewBox="0 0 100 5"
      >
        <text key={text + "in"} className="screen-text-select" x="1" y="4">
          {text}
        </text>
      </svg>
    );
  }
  return (
    <svg key={text} className="screen-text-wrapper noselect" viewBox="0 0 100 5">
      <text key={text + "in"} className="screen-text" x="1" y="4">
        {text}
      </text>
    </svg>
  );
}

function App() {
  const [disp, setDisp] = React.useState({
    modes: ["Video Synth", "Select_Audio"],
    selected: () => "Default",
    next: () => {
      disp.selected = () => disp.modes[0];
      ar.move(disp.modes, 0, 3);
    },
    set: function (mode) {
      if (mode) this.selected = () => mode;
    },
  });

  const [paramDisplay, setParamDisplay] = React.useState();
  const [dPad, setDPad] = React.useState(img.btn.dPad);

  const getSoundList = () => {
    let out = [];
    for (let file in sound.files[sound.currentPage]) {
      let fileList = sound.files[sound.currentPage];
      if (fileList[file] === fileList[sound.selected]) {
        out.push(getScreenText(fileList[file].name, "select"));
      } else {
        out.push(getScreenText(fileList[file].name));
      }
    }
    return <div className="sound-list">{out}</div>;
  };
  const startupDisp = (
    <div className="watermark-screen">
      {[
        getScreenText(">start: play and stop"),
        getScreenText(">select: fileselect/videosynth"),
        getScreenText(">A: granular synth mode"),
        getScreenText(">B: FX mode"),
        getScreenText(">clk screen to load audio files"),
        getScreenText(">twist knobs and use D-pad"),
        getScreenText("to make cool soindz"),
        getScreenText(""),
        getScreenText("*cheat:Λ Λ V V < >< > B A Start "),
      ]}
    </div>
  );

  const screen =
    disp.selected() === "Select_Audio"
      ? getSoundList()
      : isStarted
      ? VideoSynth()
      : startupDisp;

  function pushAudio(files) {
    let file;
    let currentPage = 0;
    for (let i = 0; i < files.length; i++) {
      file = URL.createObjectURL(files[i]);
      let soundInfo = { name: files[i].name, path: file };
      if (sound.files[currentPage].length >= 14) {
        currentPage += 1;
        sound.files[currentPage] = [];
      }
      sound.files[currentPage].push(soundInfo);
    }
    disp.set("Select_Audio");
    getParamDisplay(disp.selected());
  }
  function AddFile() {
    let fileUploadRef = React.createRef();
    return (
      <>
        <input
          key="uploadREf"
          style={{ display: "none" }}
          ref={fileUploadRef}
          id="audio_file"
          type="file"
          multiple
          accept="audio/*"
          onChange={() => {
            pushAudio(fileUploadRef.current.files);
          }}
        />
        <input
          key="uploadUI"
          className="screen-button-overlay"
          type="button"
          onMouseDown={() => fileUploadRef.current.click()}
        />
      </>
    );
  }
  // const selector = midiInput.createSelector();
  const handleStart = () => {
    grainSampler.state === "stopped"
      ? grainSampler.start()
      : grainSampler.stop();
  };

  const firstInput = () => {
    if (isStarted === false) {
      grainSampler.start();

      isStarted = true;
      getParamDisplay("boot");
    }
  };

  let getParamDisplay = (text) => {
    if (text && isStarted) {
      clearTimeout(paramTimer);

      let display = () => {
        return (
          <div key="paramDisplay" className="param-display">
            <svg key={text} className="param-text-wrapper" viewBox="0 0 100 12">
              <text
                className="param-text"
                dominantBaseline="middle"
                textAnchor="middle"
                x="50%"
                y="59%"
              >
                {text}
              </text>
            </svg>
          </div>
        );
      };

      setParamDisplay(display);
      paramTimer = setTimeout(() => setParamDisplay([]), 1000);
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
        let adjValue = parseInt(val * (noteArray.length - 1));
        let note = noteArray[adjValue];
        let noteLength = time.note(note).time;
        let display = time.note(note).display;
        grainSampler.grainSize = noteLength * grainSampler.playbackRate;
        param = "grain " + display;
        getParamDisplay(param);
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
        getParamDisplay(param);
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
        // console.log(
        //   "start " + grainSampler.loopStart + " end " + grainSampler.loopEnd
        // );
        param = "start " + grainSampler.loopStart.toFixed(2);
        getParamDisplay(param);
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
        let adjValue = parseInt(val * (noteArray.length - 1));
        let note = noteArray[adjValue];
        let noteLength = time.note(note).time;
        let display = time.note(note).display;
        sample.loopLength = noteLength * grainSampler.playbackRate;
        grainSampler.loopEnd = sample.loopEnd();

        param = "length  " + display;
        getParamDisplay(param);
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
        let logVal = Math.pow((val + 0.38) * 5.2, 5);
        filter.frequency.value = 0.1 + logVal;
        let param = "cutoff " + parseInt(filter.frequency.value);
        getParamDisplay(param);
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
        let q = filter.Q.value;
        filter.Q.value = val * 10;
        let param = "res " + q.toFixed(2);
        getParamDisplay(param);
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
        getParamDisplay("wet " + param);
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
        let size = val;
        pitchShift.delayTime.value = size;
        let param = pitchShift.delayTime;
        getParamDisplay("delay " + param);
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
        getParamDisplay(param);
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
        getParamDisplay(param);
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
        getParamDisplay(param);
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
        getParamDisplay(param);
        knbSave[11] = midi;
      }}
    />,
  ];
  const [topKnobs, setTopKnobs] = React.useState(grainKnobs);
  const refreshKnobs = () => {
    grainKnobs[0].props.action(knbSave[0], knbSave[0] / 127);
    // grainKnobs[2].props.action(knbSave[2], knbSave[2] / 127);
    grainKnobs[3].props.action(knbSave[3], knbSave[3] / 127);
  };
  const aClick = () => {
    let param = "grain synth";
    setTopKnobs(grainKnobs);
    disp.set("Default");
    getParamDisplay(param);
    cheatCode.add("A");
  };

  const bClick = () => {
    let param = "FX";
    setTopKnobs(fxKnobs);
    disp.set("fx");
    getParamDisplay(param);
    cheatCode.add("B");
  };

  const upPad = () => {
    setDPad(img.btn.dUp);
    let param;
    let mode = disp.selected();
    if (mode === "Default") {
      sound.detune += 100;
      grainSampler.detune = sound.detune;
      param = "detune " + sound.detune;
    } else if (mode === "Select_Audio") {
      grainSampler.buffer = new Tone.Buffer(sound.prev());
    } else if (mode === "fx") {
      pitchShift.pitch = delayPitch.nextPitch();
      param = "sparkle tune " + pitchShift.pitch.toString();
    } else if (mode === "Video Synth") {
      vid.nextScale();
      param = "scale " + vid.scale();
    }
    cheatCode.add("^");
    getParamDisplay(param);
  };

  const downPad = () => {
    setDPad(img.btn.dDown);
    let mode = disp.selected();
    let param;
    if (mode === "Default") {
      sound.detune -= 100;
      //remove this line once reimplement midi
      grainSampler.detune = sound.detune;
      param = "detune " + sound.detune;
    } else if (mode === "Select_Audio") {
      grainSampler.buffer = new Tone.Buffer(sound.next());
    } else if (mode === "fx") {
      pitchShift.pitch = delayPitch.prevPitch();
      param = "delay tune " + pitchShift.pitch.toString();
    } else if (mode === "Video Synth") {
      vid.changeColor();
      param = "color";
    }
    cheatCode.add("v");
    getParamDisplay(param);
  };

  let playBackStep = 0.5;
  const leftPad = () => {
    let param;
    setDPad(img.btn.dLeft);
    let mode = disp.selected();
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
    getParamDisplay(param);
  };

  const rightPad = () => {
    let param;
    let mode = disp.selected();
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
    getParamDisplay(param);
  };

  const selClick = () => {
    let param;
    disp.next();
    param = disp.selected();
    if (param === "Video Synth") {
      setTopKnobs(videoKnobs);
    }
    getParamDisplay(param);
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
    Modules.patch();
    //initiate default state
    grainKnobs.map((knob, key) =>
      knob.props.action(knbSave[key], knbSave[key] / 127)
    );
    fxKnobs.map((knob, key) =>
      knob.props.action(knbSave[key + 4], knbSave[key + 4] / 127)
    );
    videoKnobs.map((knob, key) =>
      knob.props.action(knbSave[key + 8], knbSave[key + 8] / 127)
    );

    // console.log ("w " + Document.onmousemove + " " + window.innerWidth)
    // sample.loopEnd = function () { return (grainSampler.loopStart + this.loopLength) % grainSampler.buffer.duration  }
  }, []);
  const grainStyle =
    window.innerWidth > window.innerHeight
      ? { height: "100vh", width: "59.35vh" }
      : { width: "100vw", height: "165vw" };
  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        firstInput();
      }}
      onDrag= {e=> e.preventDefault()}
      onDrop={(e) => handleDrop(e)}
      key="game"
      className="grainboi noselect"
      // style={grainStyle}
    >
      
      <div className="display">
        {screen}
        {paramDisplay}
      </div>
      {AddFile()}
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
      </div>
    </div>
  );
}

export default App;
