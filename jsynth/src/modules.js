import Tone from "tone";
import C1 from "./samples/p.wav";

let fade = .5;
const Modules = {
    limiter: new Tone.Limiter(-6),
    filter: new Tone.Filter({
        type: "lowpass",
        frequency: 17000,
        rolloff: -24,
        Q: 2,
        gain: -12
    }),
    grainVol: new Tone.Volume(0),
    pitchMix: new Tone.CrossFade(),
    pitchShift: new Tone.PitchShift({
        pitch: 7,
        windowSize: .4,
        delayTime: 0,
        feedback: .5
    }),
    grainSampler: new Tone.GrainPlayer({
        url: new Tone.Buffer(C1),
        loop: true,
        playbackRate: 1,
        grainSize: .1,
        overlap: 0,
        loopStart: 0,
        loopEnd: 0,
        reverse: false,
        detune: 0,
        volume: -6,
        fadeIn: fade,
        fadeOut: fade
    }),
    FFT: new Tone.FFT({
        size: 16
    }),
    patch() {
        this.grainSampler.connect(this.pitchShift);
        this.grainSampler.connect(this.pitchMix, 0, 0);
        
        this.pitchShift.connect(this.pitchMix, 0, 1);
        this.pitchMix.connect(this.filter);
        this.filter.connect(this.limiter);
        this.filter.connect(this.FFT);
        this.limiter.connect(Tone.Master);
    }
}

export default Modules;

