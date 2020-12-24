import React from "react";

import soundData from "../dsp/soundData";
import VideoSynth from "./sketch";

function getScreenText(text, type) {
  //highlight the text if it is selected
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
    <svg
      key={text}
      className="screen-text-wrapper noselect"
      viewBox="0 0 100 5"
    >
      <text key={text + "in"} className="screen-text" x="1" y="4">
        {text}
      </text>
    </svg>
  );
}

//display loaded sounds as text
const SoundList = () => {
  const fileList = soundData.files[soundData.currentPage];
  const selected = fileList[soundData.selected];

  const screenText = fileList.map((file) =>
    file === selected
      ? getScreenText(file.name, "select")
      : getScreenText(file.name)
  );

  return <div className="sound-list">{screenText}</div>;
};

const StartupDisp = () => (
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

function Display({ paramText, displayMode, isStarted }) {

  //returns the correct visuals for whatever mode state is active
  const screen = 
    displayMode.selected() === "Select_Audio" ? (
      <SoundList />
    ) : isStarted ? (
      <VideoSynth />
    ) : (
      <StartupDisp />
    );

  const ParamDisplay = () =>
    paramText && paramText != "" ? (
      <div key="paramDisplay" className="param-display">
        <svg className="param-text-wrapper" viewBox="0 0 100 12">
          <text
            className="param-text"
            dominantBaseline="middle"
            textAnchor="middle"
            x="50%"
            y="59%"
          >
            {paramText}
          </text>
        </svg>
      </div>
    ) : (
      ""
    );

  return (
    <div className="display">
      {screen}
      <ParamDisplay />
    </div>
  );
}

export default Display;
