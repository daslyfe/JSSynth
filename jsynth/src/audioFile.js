import React from 'react';
import Tone from "tone";

function AudioPlayer() {
    let audioRef = React.createRef();
    function setAudio(files) {
        let file = URL.createObjectURL(files[0]); 
        // let buff = new Tone.Buffer(file);

        
    } 
    return (
        <div>
            <input ref ={audioRef} id="audio_file" type="file" accept="audio/*" onChange={() => setAudio(audioRef.current.files)} />
        </div>
    )
}

export default AudioPlayer;
