import React from "react";
import soundData from "../dsp/soundData";

function FileUploadComponent({postAction}) {
    let fileUploadRef = React.createRef();
     //get data from file uploads and add it to the sound data array
  function pushAudio(soundFiles) {
    let currentPage = 0;
    Array.from(soundFiles).forEach((soundFile) => {
      const soundInfo = { name: soundFile.name, path: URL.createObjectURL(soundFile) };
      if (soundData.files[currentPage].length >= 14) {
        currentPage += 1;
        soundData.files[currentPage] = [];
      }
      soundData.files[currentPage].push(soundInfo);
    })
    postAction();
  
  }
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

  export default FileUploadComponent;